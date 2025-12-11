SELECT table_name 
FROM information_schema.tables
WHERE table_schema = 'silver';


INSERT INTO silver.Employees (name, role)
VALUES ('John Doe', 'Waiter');

select * from silver.Employees;

INSERT INTO silver.ShiftLogs (employeeId, startTime, endTime)
VALUES (1, '2025-01-01 10:00', '2025-01-01 18:00');


INSERT INTO silver.Ingredients (name, unitType)
VALUES ('Tomatoes', 'kg');

INSERT INTO silver.Inventory (ingredientId, quantity, threshold)
VALUES (1, 20, 5);

 