-- sample_data.sql

-- Insert sample raw materials
INSERT INTO raw_materials (name, cost_per_unit, unit_of_measurement, current_stock) VALUES
('Chicken Breast', 8.50, 'kg', 25.0),
('Tomato', 2.30, 'kg', 15.0),
('Lettuce', 1.80, 'kg', 8.0),
('Burger Bun', 0.50, 'piece', 100),
('Cheese Slice', 0.25, 'piece', 200);

-- Insert sample dishes
INSERT INTO dishes (name, description, sale_price, category, prep_time) VALUES
('Chicken Burger', 'Grilled chicken with lettuce and mayo', 12.99, 'Main', 15),
('Caesar Salad', 'Fresh salad with caesar dressing', 9.99, 'Starter', 10);

-- Insert sample employees
INSERT INTO employees (first_name, last_name, email, role, hourly_rate, hire_date) VALUES
('John', 'Smith', 'john.smith@restaurant.com', 'Waiter', 12.50, '2023-01-15'),
('Maria', 'Garcia', 'maria.garcia@restaurant.com', 'Chef', 18.00, '2022-11-10');