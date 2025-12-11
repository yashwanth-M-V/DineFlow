import json
from pipeline.db.connection import get_connection

def ingest_raw_order(table_name, items, source="POS"):
    conn = get_connection()
    cursor = conn.cursor()

    payload = json.dumps(items)  # items is a list of {itemId, qty}

    cursor.execute("""
        INSERT INTO bronze.RawOrders (tableName, orderJson, sourceSystem)
        VALUES (?, ?, ?)
    """, table_name, payload, source)

    conn.commit()
    cursor.close()
    conn.close()
