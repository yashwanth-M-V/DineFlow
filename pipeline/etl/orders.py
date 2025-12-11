import json
from pipeline.db.connection import get_connection

def process_raw_orders():
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Get raw orders not processed yet
    cursor.execute("SELECT rawOrderId, tableName, orderJson FROM bronze.RawOrders")
    rows = cursor.fetchall()

    for row in rows:
        raw_id, table_name, order_json = row

        try:
            # Parse JSON
            items = json.loads(order_json)

            # Lookup tableId
            cursor.execute("SELECT tableId FROM silver.Tables WHERE name = ?", table_name)
            table_row = cursor.fetchone()
            if not table_row:
                raise Exception(f"Invalid table name {table_name}")

            table_id = table_row[0]

            # Insert into Silver Orders
            cursor.execute("""
                INSERT INTO silver.Orders (tableId, status)
                OUTPUT INSERTED.orderId
                VALUES (?, 'CLOSED')
            """, table_id)
            order_id = cursor.fetchone()[0]

            # Insert each order item
            for item in items:
                cursor.execute("""
                    INSERT INTO silver.OrderItems (orderId, itemId, quantity, unitPrice)
                    SELECT ?, ?, ?, price FROM silver.MenuItems WHERE itemId = ?
                """, order_id, item["itemId"], item["qty"], item["itemId"])

            conn.commit()

        except Exception as e:
            # Log error
            cursor.execute("""
                INSERT INTO bronze.ErrorRecords (sourceTable, rawRecord, errorMessage)
                VALUES (?, ?, ?)
            """, "RawOrders", order_json, str(e))
            conn.commit()

    cursor.close()
    conn.close()
