INSERT INTO auth.admin_users (username, password_hash)
VALUES ('admin', '$2a$10$abcdefghijklmnopqrstuv');

INSERT INTO menu.categories (name) VALUES
('Pizza'),
('Paste'),
('Burgeri'),
('Bauturi Non Alcolice'),
('Bauturi Alcolice'),
('Deserturi'),
('Main Dish Pui'),
('Main Dish Vita');

INSERT INTO menu.menu_items (name, description, price, image_url, available, category_id) VALUES
('Margherita', 'Sos de rosii, mozzarella, busuioc', 32.00, NULL, TRUE, 1),
('Diavola', 'Sos de rosii, mozzarella, salam picant', 36.00, NULL, TRUE, 1),
('Quattro Formaggi', 'Mozzarella, gorgonzola, parmezan, brie', 39.00, NULL, TRUE, 1),
('Capricciosa', 'Sos de rosii, mozzarella, sunca, ciuperci, masline', 38.00, NULL, TRUE, 1),

('Carbonara', 'Paste, pancetta, parmezan, sos cremos', 34.00, NULL, TRUE, 2),
('Bolognese', 'Paste cu sos ragu de vita', 35.00, NULL, TRUE, 2),
('Arrabbiata', 'Paste cu sos de rosii picant', 30.00, NULL, TRUE, 2),
('Quattro Formaggi Pasta', 'Paste in sos de branzeturi', 36.00, NULL, TRUE, 2),

('Classic Burger', 'Burger de vita, cheddar, salata, rosii', 37.00, NULL, TRUE, 3),
('Chicken Burger', 'Burger de pui crispy, salata, maioneza', 35.00, NULL, TRUE, 3),
('BBQ Burger', 'Burger de vita, bacon, sos BBQ, cheddar', 41.00, NULL, TRUE, 3),
('Double Cheeseburger', 'Dublu burger de vita, cheddar, castraveti', 45.00, NULL, TRUE, 3),

('Limonada Clasica', 'Limonada proaspata cu menta', 15.00, NULL, TRUE, 4),
('Fresh Portocale', 'Suc natural de portocale', 18.00, NULL, TRUE, 4),
('Coca-Cola', 'Bautura carbogazoasa 330ml', 10.00, NULL, TRUE, 4),
('Apa Plata', 'Apa plata 500ml', 8.00, NULL, TRUE, 4),

('Bere Blonda', 'Bere blondă 500ml', 12.00, NULL, TRUE, 5),
('Vin Alb Pahar', 'Vin alb sec 150ml', 14.00, NULL, TRUE, 5),
('Vin Rosu Pahar', 'Vin rosu sec 150ml', 14.00, NULL, TRUE, 5),
('Aperol Spritz', 'Cocktail Aperol Spritz', 24.00, NULL, TRUE, 5),

('Cheesecake', 'Cheesecake cu fructe de padure', 22.00, NULL, TRUE, 6),
('Lava Cake', 'Sufleu de ciocolata cu interior lichid', 24.00, NULL, TRUE, 6),
('Tiramisu', 'Desert italian cu mascarpone si cafea', 23.00, NULL, TRUE, 6),
('Papanasi', 'Papanasi cu smantana si dulceata', 25.00, NULL, TRUE, 6),

('Piept de Pui Grilat', 'Piept de pui la gratar cu garnitura', 39.00, NULL, TRUE, 7),
('Snitel de Pui', 'Snitel crocant din piept de pui', 37.00, NULL, TRUE, 7),
('Pui Teriyaki', 'Pui in sos teriyaki cu orez', 42.00, NULL, TRUE, 7),
('Pui cu Ciuperci', 'Piept de pui in sos cremos cu ciuperci', 40.00, NULL, TRUE, 7),

('Steak de Vita', 'Steak de vita medium cu cartofi', 68.00, NULL, TRUE, 8),
('Burger Steak Vita', 'Bucati fragede de vita cu unt aromat', 64.00, NULL, TRUE, 8),
('Vita cu Sos de Piper', 'Muschiulet de vita cu sos de piper', 72.00, NULL, TRUE, 8),
('Vita Stroganoff', 'Fasii de vita in sos cremos cu ciuperci', 66.00, NULL, TRUE, 8);

INSERT INTO reservations.restaurant_tables (table_number, capacity, status) VALUES
(1, 4, 'AVAILABLE'),
(2, 4, 'AVAILABLE'),
(3, 4, 'AVAILABLE'),
(4, 4, 'AVAILABLE'),
(5, 4, 'AVAILABLE'),
(6, 6, 'AVAILABLE'),
(7, 6, 'AVAILABLE'),
(8, 6, 'AVAILABLE'),
(9, 6, 'AVAILABLE'),
(10, 6, 'AVAILABLE'),
(11, 8, 'AVAILABLE'),
(12, 8, 'AVAILABLE'),
(13, 8, 'AVAILABLE'),
(14, 8, 'AVAILABLE'),
(15, 8, 'AVAILABLE');