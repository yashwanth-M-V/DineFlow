# Dine-Flow – Silver Layer Schema Design (OLTP)

All tables live in schema: `silver`.

---

## 1. Employees & Shifts

### Table: silver.Employees
- **employeeId** (PK, int, identity) – unique employee ID  
- **name** (nvarchar(100), not null) – employee full name  
- **role** (nvarchar(50), not null) – e.g., waiter, chef, manager  
- **isActive** (bit, not null, default 1) – soft delete / active flag  

**Notes**
- No shift info here (kept in ShiftLogs).

---

### Table: silver.ShiftLogs
- **shiftId** (PK, int, identity)  
- **employeeId** (FK → silver.Employees.employeeId, not null)  
- **startTime** (datetime2, not null)  
- **endTime** (datetime2, null) – null while shift is ongoing  

**Constraints**
- `CHECK (endTime IS NULL OR endTime > startTime)`

---

## 2. Menu & Prepbook

### Table: silver.MenuItems
- **itemId** (PK, int, identity)  
- **name** (nvarchar(100), not null)  
- **category** (nvarchar(50), not null) – e.g., Starter, Main, Dessert  
- **price** (decimal(10,2), not null, CHECK price ≥ 0)  
- **availablePortions** (int, not null, CHECK availablePortions ≥ 0)  
- **isActive** (bit, not null, default 1)

---

### Table: silver.Prepbook
- **prepId** (PK, int, identity)  
- **itemId** (FK → silver.MenuItems.itemId, not null)  
- **ingredients** (nvarchar(max), null) – free-text recipe ingredients  
- **method** (nvarchar(max), null) – cooking method / steps  
- **imageFileUrl** (nvarchar(255), null) – blob URL or image path

---

## 3. Ingredients & Inventory

### Table: silver.Ingredients
- **ingredientId** (PK, int, identity)  
- **name** (nvarchar(100), not null, UNIQUE)  
- **unitType** (nvarchar(20), not null) – e.g., kg, g, ml, piece  

---

### Table: silver.Inventory
- **inventoryId** (PK, int, identity)  
- **ingredientId** (FK → silver.Ingredients.ingredientId, not null)  
- **quantity** (decimal(18,3), not null, CHECK quantity ≥ 0)  
- **threshold** (decimal(18,3), not null, CHECK threshold ≥ 0)  

**Notes**
- One row per ingredient for current stock level (MVP).
- Later we can add an InventoryMovements table.

---

## 4. Customers & Tables & Bookings

### Table: silver.Customers
- **customerId** (PK, int, identity)  
- **name** (nvarchar(100), not null)  
- **contact** (nvarchar(100), null) – phone or email  

---

### Table: silver.Tables
- **tableId** (PK, int, identity)  
- **name** (nvarchar(20), not null, UNIQUE) – e.g., T1, T2  
- **capacity** (int, not null, CHECK capacity > 0)  
- **location** (nvarchar(50), null) – e.g., Indoor, Patio  
- **isActive** (bit, not null, default 1)

---

### Table: silver.Bookings
- **bookingId** (PK, int, identity)  
- **tableId** (FK → silver.Tables.tableId, not null)  
- **customerId** (FK → silver.Customers.customerId, null)  
- **bookingStart** (datetime2, not null)  
- **bookingEnd** (datetime2, null)  
- **partySize** (int, null)  
- **status** (nvarchar(20), not null, default 'BOOKED')  

**Constraints**
- `CHECK (partySize IS NULL OR partySize > 0)`
- Optionally: `CHECK (bookingEnd IS NULL OR bookingEnd > bookingStart)`

---

## 5. Orders & Order Items

### Table: silver.Orders
- **orderId** (PK, int, identity)  
- **tableId** (FK → silver.Tables.tableId, null)  
- **bookingId** (FK → silver.Bookings.bookingId, null)  
- **orderTime** (datetime2, not null, default sysutcdatetime())  
- **status** (nvarchar(20), not null, default 'OPEN')  

**Notes**
- Either `tableId` or `bookingId` (or both) can be set.
- Later we can add a CHECK constraint to enforce at least one.

---

### Table: silver.OrderItems
- **orderItemId** (PK, int, identity)  
- **orderId** (FK → silver.Orders.orderId, not null)  
- **itemId** (FK → silver.MenuItems.itemId, not null)  
- **quantity** (int, not null, CHECK quantity > 0)  
- **unitPrice** (decimal(10,2), not null, CHECK unitPrice ≥ 0)  

**Notes**
- `unitPrice` captures price at the time of order (important for history).

---

## 6. Billing & Payment Methods

### Table: silver.PaymentMethods
- **methodId** (PK, int, identity)  
- **methodName** (nvarchar(50), not null, UNIQUE) – e.g., Cash, Card, UPI  

---

### Table: silver.Billing

- **billId** (PK, int, identity)  
- **orderId** (FK → silver.Orders.orderId, not null, UNIQUE) – 1 bill per order (MVP)  
- **amount** (decimal(10,2), not null, CHECK amount ≥ 0)  
- **paymentMethodId** (FK → silver.PaymentMethods.methodId, null)  
- **status** (nvarchar(20), not null, default 'PENDING')  
- **createdAt** (datetime2, not null, default sysutcdatetime())  
- **paidAt** (datetime2, null)  

Notes

- Later we can support multiple payments per bill with a separate Payments table.
