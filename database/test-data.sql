INSERT INTO room (name) VALUES ('Hauptlager');

INSERT INTO room_sector (room_id, width, depth, pos_x, pos_y) VALUES
(1, 12.00, 10.50, 0.00, 0.00),
(1, 5.00, 4.50, 0.00, 10.50);

INSERT INTO category (name) VALUES 
('Elektrogeräte'), ('Camping-Ausrüstung'), 
('Sanitätsmaterial'), ('Küchenbedarf'), ('Reinigung');

INSERT INTO cabinet (room_sector_id, num_shelves, num_columns, width, depth, pos_x, pos_y) VALUES
(1, 5, 2, 1.20, 0.60, 1.00, 0.00),
(1, 6, 3, 1.80, 0.60, 4.00, 0.00),
(2, 4, 1, 0.80, 0.60, 0.00, 3.00),
(2, 5, 2, 1.00, 0.60, 0.00, 0.00),
(2, 8, 4, 2.20, 0.80, 3.50, 2.00);

INSERT INTO item (category_id, name) VALUES
(1, 'Akkuschrauber'),
(1, 'Kabeltrommel'),
(2, 'Gaskocher'),
(3, 'Verbandskasten'),
(4, 'Kochtopf 20L'),
(5, 'Besen');

INSERT INTO inventory (cabinet_id, item_id, shelf_no, column_no, quantity) VALUES
(1, 1, 2, 1, 3),
(2, 2, 1, 2, 2),
(3, 3, 3, 1, 5),
(4, 4, 1, 1, 4),
(5, 5, 4, 2, 2),
(5, 6, 1, 1, NULL);