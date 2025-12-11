# ETL Pipeline (Bronze → Silver)

This ETL cleans raw inputs from Bronze and transforms them into
structured, validated Silver tables.

---

## ETL 1 — RawOrders → Orders + OrderItems

### Input: bronze.RawOrders

- fields: tableName, orderJson

### Transform:

1. Lookup tableId from silver.Tables using tableName  
2. Parse orderJson into (itemId, quantity)  
3. Create row in silver.Orders  
4. Insert each parsed item into silver.OrderItems  

### Edge cases

- invalid tableName → send to bronze.ErrorRecords  
- invalid menu items → log error  
- missing price → use current MenuItems.price  

---

## ETL 2 — RawShiftLogs → Employees + ShiftLogs

1. Cleanup employeeName  
2. Match or create employee in silver.Employees  
3. Convert raw times to datetime2  
4. Insert sanitized data into silver.ShiftLogs  

---

## ETL 3 — RawInventoryMovements → Inventory

1. Match ingredientName to ingredientId  
2. Convert quantityRaw  
3. If PURCHASE → add quantity  
4. If CONSUME → subtract quantity  
5. Write updated total to silver.Inventory  

Constraints enforced:

- quantity ≥ 0  
- threshold > 0  

---

Gold layer analytics will be built on top of Silver once ETL works.
