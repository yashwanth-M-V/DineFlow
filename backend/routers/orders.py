from fastapi import APIRouter
from backend.db.connection import get_connection
import json

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/raw")
def ingest_raw_order(payload: dict):
    """
    Sample payload:
    {
      "tableName": "T1",
      "items": [
        {"itemId": 1, "qty": 2},
        {"itemId": 7, "qty": 1}
      ],
      "source": "POS"
    }
    """
    table_name = payload.get("tableName")
    items = payload.get("items")
    source = payload.get("source", "API")

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO bronze.RawOrders (tableName, orderJson, sourceSystem)
        VALUES (?, ?, ?)
    """, table_name, json.dumps(items), source)

    conn.commit()
    cursor.close()
    conn.close()

    return {"status": "success", "message": "Raw order ingested into Bronze"}
