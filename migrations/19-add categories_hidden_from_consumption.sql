CREATE TABLE categories_hidden_from_consumption(
    user_id INTEGER REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    PRIMARY KEY (user_id, category_id)
) WITHOUT ROWID;


-- DOWN --


SELECT NULL;
