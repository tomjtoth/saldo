![CI/CD](https://github.com/tomjtoth/saldo/actions/workflows/deploy.yml/badge.svg)
[![codecov](https://codecov.io/gh/tomjtoth/saldo/graph/badge.svg?token=WKBLAW4XKP)](https://codecov.io/gh/tomjtoth/saldo)

# Saldo

A multi-user expense tracker made for making splitting the bills, keeping track of debts, and providing summary of consumption easier. Click [here](https://saldo.ttj.hu) to check it out in production (branch _main_).

## Typical usage scenarios

- Friends _A_, _B_ and _C_ spend the weekend in a rented weekend house, they travel by the same car:

  - _A_ pays for gas, which is split 3-way
  - _B_ pays for all the food and soft-drinks (split 3-way)
  - _B_ pays for alcoholic beverages, which are split 2-way, since _person A_ doesn't drink alcohol
  - _C_ books and pays for the accommodation (split 3-way)

After everyone joined the same _[group](https://saldo.ttj.hu/groups)_,
created the relevant _[categories](https://saldo.ttj.hu/categories)_,
added their _[receipts](https://saldo.ttj.hu/receipts)_ (marking shares of each _item vs. user_),
the _[balance](https://saldo.ttj.hu/balance)_ view will show each "realtion of debt" within the group,
while the _[pareto](https://saldo.ttj.hu/pareto)_ view shows the total consumption of each category/user.

## Implementation

The app uses _Next.js_, _Auth.js_, _drizzle ORM_ and custom migrations written in plain SQL, which are handled atomically (also rolling back on FK violations) during _instrumentation_. The database sports a few solutions aiming to minimize storage size.

Branch [staging](https://github.com/tomjtoth/saldo/tree/staging) is accessible [here](https://staging.saldo.ttj.hu), providing access to (the clone of) production data, while branch [dev](https://github.com/tomjtoth/saldo/tree/dev) is accessible from [here](https://dev.saldo.ttj.hu) without access to production data or _OAuth_ (any email address is viable and the password `TEST_PASSWD`).
