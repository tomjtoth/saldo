create schema id;
create table id.users (id int2 primary key);
create table id.categories (id int2 primary key);
create table id.receipts (id int4 primary key);
create table id.items (id int8 primary key);


-- `generated always as identity` is not in use as it makes insertions more cumbersome in JS


create table statuses
(
    id int2 primary key,

    status text not null
);


-- for database migrations
create table migrations
(
    id int2 primary key generated always as identity,
    status_id int2 default 0 references statuses(id),

    migration text not null,
    applied timestamp default current_timestamp
);


create table revisions
(
    id int8 primary key,

    rev_on timestamp default current_timestamp,
    rev_by int2 references id.users(id)
);


create table users
(
    id int2 references id.users,
    rev_id int8 references revisions(id),
    primary key(id, rev_id),
    status_id int2 default 0 references statuses(id),

    email text not null,
    name text not null,
    passwd text not null
);


create table sessions
(
    id int8 primary key generated always as identity,
    status_id int2 default 0 references statuses(id),
    user_id int2 references id.users(id),
    ipv4 text not null
);


create table categories
(
    id int2 references id.categories,
    rev_id int8 references revisions(id),
    primary key(id, rev_id),
    status_id int2 default 0 references statuses(id),

    category text not null
);


create table receipts
(
    id int4 references id.receipts,
    rev_id int8 references revisions(id),
    primary key(id, rev_id),
    status_id int2 default 0 references statuses(id),

    paid_on date default current_date,
    paid_by int2 references id.users(id)
);


create table items
(
    id int8 references id.items,
    rev_id int8 references revisions(id),
    primary key(id, rev_id),
    status_id int2 default 0 references statuses(id),

    rcpt_id int4 references id.receipts(id),
    cat_id int2 references id.categories(id),
    cost int4 not null,
    notes text
);


create table item_shares
(
    item_id int8 references id.items(id),
    user_id int2 references id.users(id),
    rev_id int8 references revisions(id),
    primary key (item_id, user_id, rev_id),
    status_id int2 default 0 references statuses(id),

    share int2 not null
);


-- view definitions below


create view log_now as
select
    r.id as rcpt_id,
    rr.rev_on as added_on,
    uab.name as added_by,
    paid_on,
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
inner join revisions rr on rr.id = r.rev_id
inner join users uab on rr.rev_by = uab.id
inner join users upb on r.paid_by = upb.id
inner join items i on r.id = i.rcpt_id
inner join categories c on c.id = i.cat_id
left join item_shares sh on sh.item_id = i.id
left join users ush on sh.user_id = ush.id
order by paid_on;


create view balance_detailed as
select paid_by, paid_to, paid_on, sum(share) as daily_sum
from log_now
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
