-- restaurant_schema.sql

-- Table 1: Raw Materials
CREATE TABLE raw_materials (
    raw_material_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    cost_per_unit DECIMAL(10,2) NOT NULL CHECK (cost_per_unit > 0),
    unit_of_measurement VARCHAR(20) NOT NULL,
    current_stock DECIMAL(10,2) DEFAULT 0,
    alert_threshold DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table 2: Dishes
CREATE TABLE dishes (
    dish_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sale_price DECIMAL(10,2) NOT NULL CHECK (sale_price > 0),
    category VARCHAR(50),
    is_available BOOLEAN DEFAULT TRUE,
    prep_time INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table 3: Employees
CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL,
    hourly_rate DECIMAL(8,2) NOT NULL CHECK (hourly_rate >= 0),
    hire_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Table 4: Customer Orders
CREATE TABLE customer_orders (
    order_id SERIAL PRIMARY KEY,
    table_number VARCHAR(10),
    order_type VARCHAR(20) NOT NULL DEFAULT 'dine-in',
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    customer_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    served_by INTEGER REFERENCES employees(employee_id)
);

-- Table 5: Dish Recipes (Many-to-Many: Dishes ↔ Raw Materials)
CREATE TABLE dish_recipes (
    recipe_id SERIAL PRIMARY KEY,
    dish_id INTEGER NOT NULL REFERENCES dishes(dish_id) ON DELETE CASCADE,
    raw_material_id INTEGER NOT NULL REFERENCES raw_materials(raw_material_id) ON DELETE CASCADE,
    quantity_required DECIMAL(8,2) NOT NULL CHECK (quantity_required > 0),
    UNIQUE(dish_id, raw_material_id)
);

-- Table 6: Order Items (Many-to-Many: Orders ↔ Dishes)
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES customer_orders(order_id) ON DELETE CASCADE,
    dish_id INTEGER NOT NULL REFERENCES dishes(dish_id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price_at_time DECIMAL(10,2) NOT NULL CHECK (unit_price_at_time > 0),
    special_instructions TEXT,
    status VARCHAR(20) DEFAULT 'ordered'
);

-- Table 7: Shifts
CREATE TABLE shifts (
    shift_id SERIAL PRIMARY KEY,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    role_required VARCHAR(50) NOT NULL,
    slots_required INTEGER NOT NULL DEFAULT 1 CHECK (slots_required > 0),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table 8: Employee Shifts (Many-to-Many: Employees ↔ Shifts)
CREATE TABLE employee_shifts (
    employee_shift_id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    shift_id INTEGER NOT NULL REFERENCES shifts(shift_id) ON DELETE CASCADE,
    confirmed BOOLEAN DEFAULT FALSE,
    UNIQUE(employee_id, shift_id)
);