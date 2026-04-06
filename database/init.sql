CREATE TABLE room (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE room_sector (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    width DECIMAL(10,2) NOT NULL,
    depth DECIMAL(10,2) NOT NULL,
    pos_x DECIMAL(10,2) NOT NULL,
    pos_y DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_sector_room FOREIGN KEY (room_id) REFERENCES room(id) ON DELETE CASCADE
);

CREATE TABLE cabinet (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_sector_id INT NOT NULL,
    num_shelves INT NOT NULL,
    num_columns INT NOT NULL,
    width DECIMAL(10,2) NOT NULL,
    depth DECIMAL(10,2) NOT NULL,
    pos_x DECIMAL(10,2) NOT NULL,
    pos_y DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_cabinet_sector FOREIGN KEY (room_sector_id) REFERENCES room_sector(id) ON DELETE CASCADE
);

CREATE TABLE item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    CONSTRAINT fk_item_category FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE
);

CREATE TABLE inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cabinet_id INT NOT NULL,
    item_id INT NOT NULL,
    shelf_no INT NOT NULL,
    column_no INT NOT NULL,
    quantity INT,
    CONSTRAINT fk_inv_cabinet FOREIGN KEY (cabinet_id) REFERENCES cabinet(id) ON DELETE CASCADE,
    CONSTRAINT fk_inv_item FOREIGN KEY (item_id) REFERENCES item(id) ON DELETE CASCADE
);