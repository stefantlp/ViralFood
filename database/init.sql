CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS menu;
CREATE SCHEMA IF NOT EXISTS reservations;
CREATE SCHEMA IF NOT EXISTS orders;

CREATE TABLE auth.admin_users (
                                  id SERIAL PRIMARY KEY,
                                  username VARCHAR(50) UNIQUE NOT NULL,
                                  password_hash VARCHAR(255) NOT NULL,
                                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu.categories (
                                 id SERIAL PRIMARY KEY,
                                 name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE menu.menu_items (
                                 id SERIAL PRIMARY KEY,
                                 name VARCHAR(100) NOT NULL,
                                 description TEXT,
                                 price DECIMAL(10, 2) NOT NULL,
                                 image_url VARCHAR(255),
                                 available BOOLEAN DEFAULT TRUE,
                                 category_id INTEGER REFERENCES menu.categories(id) ON DELETE SET NULL
);

CREATE TABLE reservations.restaurant_tables (
                                                id SERIAL PRIMARY KEY,
                                                table_number INTEGER UNIQUE NOT NULL,
                                                capacity INTEGER NOT NULL,
                                                status VARCHAR(20) DEFAULT 'AVAILABLE'
);

CREATE TABLE reservations.reservations (
                                           id SERIAL PRIMARY KEY,
                                           customer_alias VARCHAR(100) NOT NULL,
                                           phone_number VARCHAR(20) NOT NULL,
                                           table_id INTEGER REFERENCES reservations.restaurant_tables(id),
                                           reservation_time TIMESTAMP NOT NULL,
                                           people_count INTEGER NOT NULL,
                                           status VARCHAR(20) DEFAULT 'PENDING',
                                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders.orders (
                               id SERIAL PRIMARY KEY,
                               table_id INTEGER REFERENCES reservations.restaurant_tables(id),
                               status VARCHAR(20) DEFAULT 'PLACED',
                               total_price DECIMAL(10, 2) DEFAULT 0.00,
                               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders.order_items (
                                    id SERIAL PRIMARY KEY,
                                    order_id INTEGER REFERENCES orders.orders(id) ON DELETE CASCADE,
                                    menu_item_id INTEGER REFERENCES menu.menu_items(id),
                                    product_name VARCHAR(100) NOT NULL,
                                    unit_price DECIMAL(10, 2) NOT NULL,
                                    quantity INTEGER NOT NULL,
                                    line_total DECIMAL(10, 2) NOT NULL
);