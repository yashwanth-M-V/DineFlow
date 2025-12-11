-- Dine-Flow: Silver schema + core tables
-- Run this on your Azure SQL database

------------------------------------------------
-- 1. Create schema
------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'silver')
    EXEC('CREATE SCHEMA silver');
GO

------------------------------------------------
-- 2. Employees & Shifts
------------------------------------------------
CREATE TABLE silver.Employees (
    employeeId     INT IDENTITY(1,1) PRIMARY KEY,
    name           NVARCHAR(100) NOT NULL,
    role           NVARCHAR(50)  NOT NULL,
    isActive       BIT           NOT NULL DEFAULT 1
);
GO

CREATE TABLE silver.ShiftLogs (
    shiftId     INT IDENTITY(1,1) PRIMARY KEY,
    employeeId  INT          NOT NULL,
    startTime   DATETIME2    NOT NULL,
    endTime     DATETIME2    NULL,
    CONSTRAINT FK_ShiftLogs_Employees
        FOREIGN KEY (employeeId) REFERENCES silver.Employees(employeeId),
    CONSTRAINT CK_ShiftLogs_EndAfterStart
        CHECK (endTime IS NULL OR endTime > startTime)
);
GO

------------------------------------------------
-- 3. Menu & Prepbook
------------------------------------------------
CREATE TABLE silver.MenuItems (
    itemId            INT IDENTITY(1,1) PRIMARY KEY,
    name              NVARCHAR(100) NOT NULL,
    category          NVARCHAR(50)  NOT NULL,
    price             DECIMAL(10,2) NOT NULL CONSTRAINT CK_MenuItems_Price CHECK (price >= 0),
    availablePortions INT           NOT NULL CONSTRAINT CK_MenuItems_Available CHECK (availablePortions >= 0),
    isActive          BIT           NOT NULL DEFAULT 1
);
GO

CREATE TABLE silver.Prepbook (
    prepId       INT IDENTITY(1,1) PRIMARY KEY,
    itemId       INT            NOT NULL,
    ingredients  NVARCHAR(MAX)  NULL,
    method       NVARCHAR(MAX)  NULL,
    imageFileUrl NVARCHAR(255)  NULL,
    CONSTRAINT FK_Prepbook_MenuItems
        FOREIGN KEY (itemId) REFERENCES silver.MenuItems(itemId)
);
GO

------------------------------------------------
-- 4. Ingredients & Inventory
------------------------------------------------
CREATE TABLE silver.Ingredients (
    ingredientId INT IDENTITY(1,1) PRIMARY KEY,
    name         NVARCHAR(100) NOT NULL UNIQUE,
    unitType     NVARCHAR(20)  NOT NULL
);
GO

CREATE TABLE silver.Inventory (
    inventoryId  INT IDENTITY(1,1) PRIMARY KEY,
    ingredientId INT              NOT NULL,
    quantity     DECIMAL(18,3)    NOT NULL CONSTRAINT CK_Inventory_Quantity CHECK (quantity >= 0),
    threshold    DECIMAL(18,3)    NOT NULL CONSTRAINT CK_Inventory_Threshold CHECK (threshold >= 0),
    CONSTRAINT FK_Inventory_Ingredients
        FOREIGN KEY (ingredientId) REFERENCES silver.Ingredients(ingredientId)
);
GO

------------------------------------------------
-- 5. Customers, Tables, Bookings
------------------------------------------------
CREATE TABLE silver.Customers (
    customerId INT IDENTITY(1,1) PRIMARY KEY,
    name       NVARCHAR(100) NOT NULL,
    contact    NVARCHAR(100) NULL
);
GO

CREATE TABLE silver.Tables (
    tableId   INT IDENTITY(1,1) PRIMARY KEY,
    name      NVARCHAR(20)  NOT NULL UNIQUE,
    capacity  INT           NOT NULL CONSTRAINT CK_Tables_Capacity CHECK (capacity > 0),
    location  NVARCHAR(50)  NULL,
    isActive  BIT           NOT NULL DEFAULT 1
);
GO

CREATE TABLE silver.Bookings (
    bookingId    INT IDENTITY(1,1) PRIMARY KEY,
    tableId      INT           NOT NULL,
    customerId   INT           NULL,
    bookingStart DATETIME2     NOT NULL,
    bookingEnd   DATETIME2     NULL,
    partySize    INT           NULL,
    status       NVARCHAR(20)  NOT NULL DEFAULT 'BOOKED',
    CONSTRAINT FK_Bookings_Tables
        FOREIGN KEY (tableId) REFERENCES silver.Tables(tableId),
    CONSTRAINT FK_Bookings_Customers
        FOREIGN KEY (customerId) REFERENCES silver.Customers(customerId),
    CONSTRAINT CK_Bookings_PartySize
        CHECK (partySize IS NULL OR partySize > 0),
    CONSTRAINT CK_Bookings_EndAfterStart
        CHECK (bookingEnd IS NULL OR bookingEnd > bookingStart)
);
GO

------------------------------------------------
-- 6. Orders & OrderItems
------------------------------------------------
CREATE TABLE silver.Orders (
    orderId    INT IDENTITY(1,1) PRIMARY KEY,
    tableId    INT          NULL,
    bookingId  INT          NULL,
    orderTime  DATETIME2    NOT NULL DEFAULT SYSUTCDATETIME(),
    status     NVARCHAR(20) NOT NULL DEFAULT 'OPEN',
    CONSTRAINT FK_Orders_Tables
        FOREIGN KEY (tableId) REFERENCES silver.Tables(tableId),
    CONSTRAINT FK_Orders_Bookings
        FOREIGN KEY (bookingId) REFERENCES silver.Bookings(bookingId)
    -- Optional later: CHECK constraint to enforce at least one of (tableId, bookingId)
);
GO

CREATE TABLE silver.OrderItems (
    orderItemId INT IDENTITY(1,1) PRIMARY KEY,
    orderId     INT           NOT NULL,
    itemId      INT           NOT NULL,
    quantity    INT           NOT NULL CONSTRAINT CK_OrderItems_Quantity CHECK (quantity > 0),
    unitPrice   DECIMAL(10,2) NOT NULL CONSTRAINT CK_OrderItems_UnitPrice CHECK (unitPrice >= 0),
    CONSTRAINT FK_OrderItems_Orders
        FOREIGN KEY (orderId) REFERENCES silver.Orders(orderId),
    CONSTRAINT FK_OrderItems_MenuItems
        FOREIGN KEY (itemId) REFERENCES silver.MenuItems(itemId)
);
GO

------------------------------------------------
-- 7. Billing & PaymentMethods
------------------------------------------------
CREATE TABLE silver.PaymentMethods (
    methodId   INT IDENTITY(1,1) PRIMARY KEY,
    methodName NVARCHAR(50) NOT NULL UNIQUE
);
GO

CREATE TABLE silver.Billing (
    billId          INT IDENTITY(1,1) PRIMARY KEY,
    orderId         INT           NOT NULL,
    amount          DECIMAL(10,2) NOT NULL CONSTRAINT CK_Billing_Amount CHECK (amount >= 0),
    paymentMethodId INT           NULL,
    status          NVARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    createdAt       DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    paidAt          DATETIME2     NULL,
    CONSTRAINT FK_Billing_Orders
        FOREIGN KEY (orderId) REFERENCES silver.Orders(orderId),
    CONSTRAINT UQ_Billing_Order UNIQUE (orderId),
    CONSTRAINT FK_Billing_PaymentMethods
        FOREIGN KEY (paymentMethodId) REFERENCES silver.PaymentMethods(methodId)
);
GO
