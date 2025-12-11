--------------------------------------------------------------
-- Create Bronze schema
--------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'bronze')
    EXEC('CREATE SCHEMA bronze');
GO

--------------------------------------------------------------
-- 1. Bronze Raw Orders (from POS)
--------------------------------------------------------------
CREATE TABLE bronze.RawOrders (
    rawOrderId INT IDENTITY(1,1) PRIMARY KEY,
    tableName NVARCHAR(20) NULL,
    orderJson NVARCHAR(MAX) NULL,      -- raw, messy, unstructured
    eventTime DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    sourceSystem NVARCHAR(50) NULL
);
GO

--------------------------------------------------------------
-- 2. Bronze Raw Shift Logs (from clock-in system)
--------------------------------------------------------------
CREATE TABLE bronze.RawShiftLogs (
    rawShiftId INT IDENTITY(1,1) PRIMARY KEY,
    employeeName NVARCHAR(100) NULL,
    role NVARCHAR(50) NULL,
    shiftStartRaw NVARCHAR(50) NULL,
    shiftEndRaw NVARCHAR(50) NULL,
    eventTime DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

--------------------------------------------------------------
-- 3. Bronze Raw Inventory Movements (deliveries, consumption)
--------------------------------------------------------------
CREATE TABLE bronze.RawInventoryMovements (
    rawInvId INT IDENTITY(1,1) PRIMARY KEY,
    ingredientName NVARCHAR(100) NULL,
    movementType NVARCHAR(20) NULL,       -- PURCHASE / CONSUME
    quantityRaw NVARCHAR(50) NULL,
    eventTime DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

--------------------------------------------------------------
-- 4. Bronze Error Records (for failed ETL rows)
--------------------------------------------------------------
CREATE TABLE bronze.ErrorRecords (
    errorId INT IDENTITY(1,1) PRIMARY KEY,
    sourceTable NVARCHAR(100),
    rawRecord NVARCHAR(MAX),
    errorMessage NVARCHAR(255),
    eventTime DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
