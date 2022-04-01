---
layout: post
title: "Taking the 'D' Out of CRUD with Soft Deletes"
date: '2015-08-03 06:48'
categories:
  - hipaa
  - postgres
  - databases
fb-img: http://scottsmerchek.com/img/crud-without-the-d.png
description: If you are like me, you cringe every time you see .destroy in someone's ORM code. For most businesses, data is one of the most important assets. Here, we'll use soft deletes instead.
---

If you are like me, you cringe every time you see `.destroy` in someone's ORM code. It is called **destroy** for a reason. For most businesses, your data is one of your most important assets. In the healthcare environment, we actually have a legal obligation to NOT destroy data, and we must keep tidy audit logs, as well. So, *why* would you ever want to destroy your data? Okay, so maybe you want to clean out old logs or other cruft, but you should never delete data that is core to your business.

## Compelling reasons to use soft deletes

1. Preserve history
2. Know _when_ the entity was deleted
3. Know _who_ deleted the entity
4. Undo deletions without resorting to backups

## How?

Assuming you are convinced that destroying your data is bad, let us move on to implementation.

### The common approaches

The idea in both of these approaches is to flag the row as deleted. Next, all queries are filtered by the column indicating deletion. This works pretty well at a basic level.

#### 1. Add a boolean `is_removed` column, defaults to `false`

Pretty simple solution, just update the row and set `is_removed` to `true`. This solution is nice because the column can be `NOT NULL`, however, you will want some indication of when this happened, so I would recommend adding a timestamp column as well.

An example schema might look like this:

```sql
CREATE TABLE customer (
   customer_id serial PRIMARY KEY,
   name varchar(256) NOT NULL UNIQUE,
   version_on timestamptz NOT NULL DEFAULT current_timestamp,
   created_on timestamptz NOT NULL DEFAULT current_timestamp,
   is_removed boolean NOT NULL DEFAULT(false)
);
```

#### 2. Add a nullable `removed_on` timestamp column

This solution uses the nullability of the timestamp column to represent deletion. This solution is nice since it indicates when the row was deleted, yet is only a single column. This is the method most ORM plugins use.

As far as ORMs go, there is the [Paranoia gem](https://rubygems.org/gems/paranoia) for ActiveRecord and if you happen to use DataMapper, there is also [Paranoia](http://datamapper.org/docs/misc.html). Really though, that is a terrible name use.

>par·a·noi·a: A mental condition characterized by delusions of persecution, unwarranted jealousy, or exaggerated self-importance, typically elaborated into an organized system.

### Caveat

One problem that both of these solutions have is handling unique constraints. Let's look at an example in postgres.

```sql
CREATE TABLE customer (
   customer_id serial PRIMARY KEY,
   name text NOT NULL UNIQUE,
   removed_on timestamptz NULL
);
```

Now, let's add some customers.

```sql
INSERT INTO customer (name)
VALUES ('dunder mifflin'),
       ('vance refrigeration');
```

Next, we delete one.

```sql
UPDATE customer
SET removed_on = current_timestamp
WHERE name = 'vance refrigeration';
```

Now, if we try to add `vance refrigeration` back, we get a duplicate key violation error:

```
ERROR: duplicate key value violates unique constraint "customer_name_key" Detail: Key (name)=(vance refrigeration) already exists.
```

> [Sql Fiddle](http://sqlfiddle.com/#!15/302b8/3)

To fix this in Postgres, we can use a [partial index](https://devcenter.heroku.com/articles/postgresql-indexes#partial-indexes) that only applies the unique constraint to the rows where `removed_on IS NULL`.

So, we update our schema as follows, removing the inline `UNIQUE` and adding the partial index:

```sql
CREATE TABLE customer (
   customer_id serial PRIMARY KEY,
   name text NOT NULL,
   removed_on timestamptz NULL
);

CREATE UNIQUE INDEX customer_name_index ON customer(name)
WHERE removed_on IS NULL;
```

Now, we can soft delete and re-add customers without violating our unique constraint.

> [Sql Fiddle](http://sqlfiddle.com/#!15/a10a3/1)

This is also possible in SQL Server by using [filtered indexes](https://msdn.microsoft.com/en-us/library/cc280372.aspx) in version 2008 or later.

### Querying

So, we are using soft deletes. We now need to make sure that we never return deleted rows unless that is explicitly what we intend. With the paranoia gems, they try to handle this for you.

In SQL, we just need to add a `WHERE` clause to our queries or an `AND` clause to our joins.

```sql
SELECT *
FROM customer
WHERE removed_on IS NULL;
```

```sql
SELECT *
FROM product p
   INNER JOIN customer c ON p.customer_id = c.customer_id
      AND c.removed_on IS NULL;
```

Looking forward to postgres 9.5, it should be possible to use [row-level security policies](http://www.depesz.com/2014/10/02/waiting-for-9-5-row-level-security-policies-rls/) to restrict access to these deleted rows entirely. This will greatly simplify the way we select and join these rows.

### Undo

If you need to undo a deletion, now it is a simple matter of updating the `removed_on` column back to `NULL`.

```sql
UPDATE customer
SET removed_on = NULL
WHERE name = 'vance refrigeration';
```

### Conclusion

While it takes some extra work, it can be worth it depending on your business needs. For those of us in healthcare, this is definitely worth it.

Check out the [next post in this series]({% post_url 2015-08-04-taking-the-d-out-of-crud-with-soft-updates %}), where we go one step further by extending this concept to soft updates.