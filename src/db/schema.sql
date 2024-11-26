create table statuses
(
    id integer primary key,
    -- probably 'default|disabled|revoked|expired'
    status text not null
);


-- for database migrations
create table migrations
(
    id integer primary key,
    migration text not null,
    status_id integer default 0 references statuses(id),
    applied integer default (unixepoch())
);


create table revisions
(
    id integer primary key,
    rev_on integer default (unixepoch()),
    rev_by integer references users(id)
);


-- table_name holds current data speeding up most frequent queries
-- upon revision the current data is moved below
-- table_name_history holds redundantly each revision for simpler & faster queries


create table users
(
    id integer primary key,
    status_id integer default 0 references statuses(id),
    name text not null,
    passwd text,
    email text not null unique
);


create table users_history
(
    id integer references users(id),
    status_id integer references statuses(id),
    name text not null,
    passwd text,
    email text not null,

    rev_id integer references revisions(id),
    primary key(id, rev_id)

);


create table categories
(
    id integer primary key,
    status_id integer default 0 references statuses(id),
    category text not null
);


create table categories_history
(
    id integer references categories(id),
    status_id integer references statuses(id),
    category text,

    rev_id integer references revisions(id),
    primary key(id, rev_id)
);


create table receipts
(
    id integer primary key,
    status_id integer default 0 references statuses(id),
    added_on integer default (unixepoch()),
    added_by integer references users(id),
    -- days since 1970-01-01
    paid_on integer default (floor(unixepoch()/60/60/24)),
    paid_by integer references users(id)
);


create table receipts_history
(
    id integer references receipts(id),
    status_id integer references statuses(id),
    added_on integer,
    added_by integer references users(id),
    paid_on integer,
    paid_by integer references users(id),
    
    rev_id integer references revisions(id),
    primary key(id, rev_id)
);


create table items
(
    id integer primary key,
    status_id integer default 0 references statuses(id),
    rcpt_id integer references receipts(id),
    cat_id integer references categories(id),
    cost integer not null,
    notes text
);


create table items_history
(
    id integer references items(id),
    status_id integer references statuses(id),
    rcpt_id integer references receipts(id),
    cat_id integer references categories(id),
    cost integer not null,
    notes text,

    rev_id integer references revisions(id),
    primary key(id, rev_id)
);


create table item_shares
(
    item_id integer references items(id),
    user_id integer references users(id),
    status_id integer default 0 references statuses(id),
    share integer,

    primary key (item_id, user_id)
)
without rowid;


create table item_shares_history
(
    item_id integer references items(id),
    user_id integer references users(id),
    status_id integer references statuses(id),
    share integer,

    rev_id integer references revisions(id),
    primary key (item_id, user_id, rev_id)
)
without rowid;


-- view definitions below


create view log as
select
    r.id as rcpt_id,
    datetime(added_on, 'unixepoch') as added_on,
    uab.name as added_by,
    date(paid_on*24*60*60, 'unixepoch') as paid_on,
    upb.name as paid_by,
    i.id as item_id,
    c.category,
    notes,
    cost / 100.0 as item_cost,
    cost / 100.0 * coalesce(share * 1.0 /
        sum(share) over (partition by i.id),
        1) as share,
    coalesce(ush.name, upb.name) as paid_to
from receipts r
inner join users uab on r.added_by = uab.id
inner join users upb on r.paid_by = upb.id
inner join items i on r.id = i.rcpt_id
inner join categories c on c.id = i.cat_id
left join item_shares sh on sh.item_id = i.id
left join users ush on sh.user_id  = ush.id
where r.status_id = 0 and  i.status_id  = 0
order by paid_on;


create view balance_detailed as
select paid_by, paid_to, paid_on, sum(share) as daily_sum
from log
where paid_by != paid_to
group by paid_on, paid_by, paid_to
order by paid_by, paid_to, paid_on;


create view balance_total as
select paid_by, paid_to, sum(daily_sum) as balance
from balance_detailed
group by paid_by, paid_to;


-- create view consumption as --monthly view needed, with recursive cte somehow...
-- select paid_to, category, sum(share) as share
-- from log
-- group by category, paid_to
-- order by paid_to, share desc;
