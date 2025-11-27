
DROP TABLE categories;
DROP TABLE ads_to_tags;
DROP TABLE tags;
DROP TABLE ads;

CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(50) NOT NULL
)

CREATE TABLE ads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(100) NOT NULL,
    price REAL NOT NULL,
    category_id INTEGER NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE ads_to_tags (
    ad_id INTEGER,
    tag_id INTEGER,
    FOREIGN KEY (ad_id) REFERENCES ads(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id),
    PRIMARY KEY (ad_id, tag_id)
);

INSERT INTO categories (name) VALUES 
    ('Auto'),
    ('Vêtements');

SELECT * FROM categories;


INSERT INTO tags (name) VALUES 
    ('tag1'),
    ('tag2');

SELECT * FROM tags;


INSERT INTO ads (title, price, category_id) VALUES 
    ('Vieux jeans troués', 200, 2),
    ('T-shit hello world', 9.99, 2),
    ('Chausettes wild code school', 4.49, 2),
    ('DeLorean DMC-12', 70000, 1),
    ('R5 pour pièces', 350, 1);

INSERT INTO ads_to_tags (ad_id, tag_id) VALUES 
    (1, 1),
    (1, 2),
    (2, 1),
    (3, 1);

SELECT * FROM ads;

# Ecrire une requête pour récupérer toutes les annonces d’une catégorie.

SELECT a.title, c.name AS 'category name' 
FROM ads AS a 
JOIN categories AS c 
ON a.category_id = c.id
WHERE c.name = 'Vêtements';

# Afficher toutes les annonces avec leurs nombre de tags associés.

SELECT a.title, count(t.id) as 'nb tags'
FROM ads AS a 
LEFT JOIN ads_to_tags AS att ON a.id = att.ad_id
LEFT JOIN tags AS t ON t.id = att.tag_id
GROUP BY a.id;

