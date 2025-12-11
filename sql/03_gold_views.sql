--------------------------------------------------------------
-- 1. Create GOLD schema
--------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'gold')
    EXEC('CREATE SCHEMA gold');
GO


--------------------------------------------------------------
-- 2. Daily Revenue View
-- Revenue grouped by day, including total orders and average bill
--------------------------------------------------------------
CREATE OR ALTER VIEW gold.vw_DailyRevenue AS
SELECT
    CAST(b.createdAt AS DATE) AS revenueDate,
    COUNT(b.billId) AS totalBills,
    SUM(b.amount) AS totalRevenue,
    AVG(b.amount) AS avgBillAmount
FROM silver.Billing b
GROUP BY CAST(b.createdAt AS DATE);
GO


--------------------------------------------------------------
-- 3. Top-Selling Menu Items
-- Count how many times each item was ordered
--------------------------------------------------------------
CREATE OR ALTER VIEW gold.vw_TopMenuItems AS
SELECT 
    mi.itemId,
    mi.name AS itemName,
    mi.category,
    SUM(oi.quantity) AS totalQuantitySold,
    SUM(oi.unitPrice * oi.quantity) AS totalSales
FROM silver.OrderItems oi
JOIN silver.MenuItems mi ON mi.itemId = oi.itemId
GROUP BY mi.itemId, mi.name, mi.category
GO


--------------------------------------------------------------
-- 4. Employee Total Working Hours
-- Summarizes each employee's shift durations
--------------------------------------------------------------
CREATE OR ALTER VIEW gold.vw_EmployeeWorkingHours AS
SELECT
    e.employeeId,
    e.name,
    e.role,
    SUM(DATEDIFF(HOUR, s.startTime, s.endTime)) AS totalHoursWorked
FROM silver.Employees e
LEFT JOIN silver.ShiftLogs s ON e.employeeId = s.employeeId
GROUP BY e.employeeId, e.name, e.role;
GO


--------------------------------------------------------------
-- 5. Table Utilization Summary
-- Shows how often tables are booked and their time usage
--------------------------------------------------------------
CREATE OR ALTER VIEW gold.vw_TableUtilization AS
SELECT
    t.tableId,
    t.name AS tableName,
    COUNT(b.bookingId) AS totalBookings,
    SUM(DATEDIFF(MINUTE, b.bookingStart, b.bookingEnd)) AS totalMinutesUsed,
    AVG(DATEDIFF(MINUTE, b.bookingStart, b.bookingEnd)) AS avgMinutesPerBooking
FROM silver.Tables t
LEFT JOIN silver.Bookings b ON t.tableId = b.tableId
GROUP BY t.tableId, t.name;
GO


--------------------------------------------------------------
-- 6. Inventory Low-Stock Alerts
-- Items where quantity < threshold
--------------------------------------------------------------
CREATE OR ALTER VIEW gold.vw_LowStockItems AS
SELECT
    i.ingredientId,
    i.name AS ingredientName,
    inv.quantity,
    inv.threshold,
    CASE 
        WHEN inv.quantity < inv.threshold THEN 'LOW'
        ELSE 'OK'
    END AS status
FROM silver.Ingredients i
JOIN silver.Inventory inv ON i.ingredientId = inv.ingredientId
WHERE inv.quantity < inv.threshold;
GO


--------------------------------------------------------------
-- 7. Payment Summary (By method)
-- Useful for revenue reporting / daily audits
--------------------------------------------------------------
CREATE OR ALTER VIEW gold.vw_PaymentSummary AS
SELECT
    pm.methodName,
    COUNT(b.billId) AS totalTransactions,
    SUM(b.amount) AS totalAmount
FROM silver.Billing b
LEFT JOIN silver.PaymentMethods pm ON b.paymentMethodId = pm.methodId
GROUP BY pm.methodName;
GO
