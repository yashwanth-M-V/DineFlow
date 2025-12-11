# Bronze Layer Design (Raw Landing Zone)

Bronze stores raw, unvalidated, semi-structured or external event data.  
This simulates logs coming from:

- POS system (orders)
- Clock-in/out machine (shift logs)
- Inventory delivery system
- Booking form inputs

Bronze tables are append-only and allow NULLs and bad data.

---

## 1. bronze.RawOrders

| column | type | notes |
|--------|------|-------|
| rawOrderId | int identity | PK |
| tableName | nvarchar(20) | like 'T3' |
| orderJson | nvarchar(max) | raw order data (items, qty) |
| eventTime | datetime2 | ingestion timestamp |
| sourceSystem | nvarchar(50) | 'POS' |

---

## 2. bronze.RawShiftLogs

| column | type |
|---------|------|
| rawShiftId | int identity |
| employeeName | nvarchar(100) |
| role | nvarchar(50) |
| shiftStartRaw | nvarchar(50) |
| shiftEndRaw | nvarchar(50) |
| eventTime | datetime2 |

---

## 3. bronze.RawInventoryMovements

| column | type |
|---------|------|
| rawInvId | int identity |
| ingredientName | nvarchar(100) |
| movementType | nvarchar(20) | PURCHASE / CONSUME |
| quantityRaw | nvarchar(50) |
| eventTime | datetime2 |

---

Bronze → Silver mapping will:

- validate name
- convert to correct IDs
- enforce constraints
- clean timestamps and numbers
