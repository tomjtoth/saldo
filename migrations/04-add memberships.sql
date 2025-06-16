CREATE TABLE memberships (
    group_id INTEGER REFERENCES groups(id),
    user_id INTEGER REFERENCES users(id),
    rev_id INTEGER REFERENCES revisions (id)
        ON DELETE CASCADE,

    admin INTEGER DEFAULT 0,
    PRIMARY KEY(user_id, group_id)
);

CREATE TABLE memberships_archive (
    group_id INTEGER REFERENCES groups(id),
    user_id INTEGER REFERENCES users(id),
    rev_id INTEGER REFERENCES revisions (id)
        ON DELETE CASCADE,

    admin INTEGER,
    PRIMARY KEY(user_id, group_id, rev_id)
);


----------
-- DOWN --
----------


DROP TABLE memberships_archive;
DROP TABLE memberships;
