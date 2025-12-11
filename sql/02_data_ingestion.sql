------------------------------------------------
-- 1. Seed Payment Methods
------------------------------------------------
INSERT INTO silver.PaymentMethods (methodName)
VALUES ('Cash'), ('Card'), ('UPI'), ('Voucher');

------------------------------------------------
-- 2. Seed Employees
------------------------------------------------
INSERT INTO silver.Employees (name, role)
VALUES 
    ('Alice Johnson', 'Waiter'),
    ('Marco Rossi', 'Chef'),
    ('Nina Patel', 'Manager'),
    ('Derek Lee', 'Waiter'),
    ('Sara Kim', 'Chef');

------------------------------------------------
-- 3. Seed Tables
------------------------------------------------
INSERT INTO silver.Tables (name, capacity, location)
VALUES 
    ('T1', 2, 'Indoor'),
    ('T2', 4, 'Indoor'),
    ('T3', 4, 'Patio'),
    ('T4', 6, 'Indoor'),
    ('T5', 2, 'Patio');

------------------------------------------------
-- 4. Seed Customers
------------------------------------------------
INSERT INTO silver.Customers (name, contact)
VALUES 
    ('John Smith', 'john@example.com'),
    ('Emily Clark', 'emily@example.com'),
    ('Michael Lee', 'mike@example.com');

------------------------------------------------
-- 5. Seed Menu Items
------------------------------------------------
INSERT INTO silver.MenuItems (name, category, price, availablePortions)
VALUES
    ('Margherita Pizza', 'Main', 8.99, 20),
    ('Chicken Alfredo', 'Main', 12.49, 15),
    ('Tomato Soup', 'Starter', 4.99, 25),
    ('Caesar Salad', 'Starter', 5.99, 25),
    ('Chocolate Lava Cake', 'Dessert', 6.49, 18),
    ('Tiramisu', 'Dessert', 6.99, 12),
    ('Espresso', 'Beverage', 2.49, 30),
    ('Lemonade', 'Beverage', 3.49, 30);

------------------------------------------------
-- 6. Seed Ingredients
------------------------------------------------
INSERT INTO silver.Ingredients (name, unitType)
VALUES
    ('Tomato', 'kg'),
    ('Cheese', 'kg'),
    ('Pasta', 'kg'),
    ('Chicken', 'kg'),
    ('Lettuce', 'kg'),
    ('Chocolate', 'kg'),
    ('Coffee Beans', 'g'),
    ('Milk', 'L'),
    ('Lemon', 'unit'),
    ('Sugar', 'kg');

------------------------------------------------
-- 7. Seed Inventory
------------------------------------------------
INSERT INTO silver.Inventory (ingredientId, quantity, threshold)
VALUES
    (1, 20, 5),    -- Tomato
    (2, 15, 4),    -- Cheese
    (3, 10, 3),    -- Pasta
    (4, 12, 4),    -- Chicken
    (5, 18, 5),    -- Lettuce
    (6, 8, 2),     -- Chocolate
    (7, 2, 0.5),   -- Coffee Beans
    (8, 25, 8),    -- Milk
    (9, 40, 10),   -- Lemon
    (10, 30, 8);   -- Sugar
