-- for database migrations
create table migrations
(
    mig_id integer primary key,
    mig_name text not null,
    mig_status integer default 0,
    mig_applied datetime default current_timestamp
);


-- table_name holds current data speeding up most frequent queries
-- upon revision the current data is moved below
-- table_name_history holds redundantly each revision for simpler & faster queries


create table users
(
    user_id integer primary key,
    user_status integer default 0,
    user_name text not null unique

    --user_password_hash text not null,
    --user_email text not null unique,
);


-- this must be defined here as rev_by references users(user_id) below
create table revisions
(
    rev_id integer primary key,
    rev_on datetime default current_timestamp,
    rev_by integer references users(user_id)
);


create table users_history
(
    user_id integer references users(user_id),
    user_status integer,
    user_name text not null,
    
    --user_password_hash text,
    --user_email text not null,

    rev_id integer references revisions(rev_id),
    primary key(user_id, rev_id)

);


create table categories
(
    cat_id integer primary key,
    cat_status integer default 0,
    cat_name text not null
);


create table categories_history
(
    cat_id integer references categories(cat_id),
    cat_status integer,
    cat_name text,

    rev_id integer references revisions(rev_id),
    primary key(cat_id, rev_id)
);


create table receipts
(
    rcpt_id integer primary key,
    rcpt_status integer default 0,
    added_on datetime default current_timestamp,
    added_by integer references users(user_id),
    paid_on date default current_date,
    paid_by integer references users(user_id)
);


create table receipts_history
(
    rcpt_id integer references receipts(rcpt_id),
    rcpt_status integer,
    added_on datetime,
    added_by integer references users(user_id),
    paid_on date,
    paid_by integer references users(user_id),
    
    rev_id integer references revisions(rev_id),
    primary key(rcpt_id, rev_id)
);


create table items
(
    item_id integer primary key,
    item_status integer default 0,
    rcpt_id integer references receipts(rcpt_id),
    cat_id integer references categories(cat_id),
    item_cost integer,
    item_notes text
);


create table items_history
(
    item_id integer references items(item_id),
    item_status integer,
    rcpt_id integer references receipts(rcpt_id),
    cat_id integer references categories(cat_id),
    item_cost integer,
    item_notes text,

    rev_id integer references revisions(rev_id),
    primary key(item_id, rev_id)
);


create table item_shares
(
    item_id integer references items(item_id),
    item_share_of integer references users(user_id),
    item_share integer,

    primary key (item_id, item_share_of)
)
without rowid;


create table item_shares_history
(
    item_id integer references items(item_id),
    item_share_of integer references users(user_id),
    item_share integer,

    rev_id integer references revisions(rev_id),
    primary key (item_id, item_share_of, rev_id)
)
without rowid;
