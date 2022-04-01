---
layout: post
title: "Taking the 'D' Out of CRUD with Soft Updates"
date: '2015-08-04 06:23'
categories:
  - hipaa
  - postgres
  - databases
fb-img: 'http://scottsmerchek.com/img/crud-without-the-d.png'
description: "Soft deletes are nice, but what about updates? Updates are pretty destructive too, so let's take a look at implementing soft updates on top of soft deletes."
---

In the [previous post]({% post_url 2015-08-03-taking-the-d-out-of-crud %}), we took a look at implementing soft deletes, so that we aren't _destroying_ our data. But what about updates? Updates are pretty destructive too, since they are essentially deleting a row and replacing it. At the very least, most would want an audit log of some sort to know who updated that particular row. In healthcare, if someone updates the patient's name, that is a big deal. We need to make sure that track the history of any given entity.

If you haven't read [the previous post on soft deletes]({% post_url 2015-08-03-taking-the-d-out-of-crud %}), go do that now. We'll build on top of our understanding of soft deletes to implement soft updates.

## Going beyond soft deletes with soft updates

To handle soft updates, we'll introduce a few more concepts to our schema.

1. An integer `version` column to track versions of an entity
2. A history table will track old values of rows, referencing the original table.
3. A trigger to copy the "deleted" row on an update.

### 1. The version column

The `version` column defaults to 1 and will increment with each update.
The `version_on` column tracks the timestamp for each update.
The `version_by` column tracks the user responsible for updating the row.

Keeping `created_on` is mostly convenience, since we could get created on by querying for the `version_on` of the entity where `version = 1`.

In this case, we'll use a `is_removed` boolean column to track deletes since we have the time of the deletion with tracked in the `version_on` column.

```sql
CREATE TABLE customer (
   customer_id serial PRIMARY KEY,
   name varchar(256) NOT NULL,
   version int DEFAULT(1) NOT NULL,
   version_on timestamptz NOT NULL DEFAULT current_timestamp,
   version_by varchar(64) NOT NULL,
   created_on timestamptz NOT NULL DEFAULT current_timestamp,
   is_removed boolean NOT NULL DEFAULT(false)
);
```

### 2. The history table

The history table should track our versioning columns, as well as any columns that can change from the original table. We don't need a unique constraint here, but we do want a foreign key to reference the original table.

```sql
CREATE TABLE customer_history (
  customer_id int,
  name text NOT NULL,
  version int,
  version_on timestamptz NOT NULL DEFAULT current_timestamp,
  version_by varchar(64) NOT NULL,
  is_removed boolean NOT NULL
  PRIMARY KEY(customer_id, version)
);

ALTER TABLE customer_history
ADD CONSTRAINT fk_customer_history_customer
  FOREIGN KEY
  (
     customer_id
  )
  REFERENCES customer
  (
     customer_id
  )
ON UPDATE CASCADE ON DELETE RESTRICT;
CREATE INDEX fki_customer_history_customer ON customer_history (customer_id);
```

### 3. The trigger

On each update to our customer table, we want to trigger an insert to the history table. In postgres, there are two parts to this.

1. The trigger function
2. The trigger itself

The trigger function defines what to do. In our case, we want to increment the `version` and set the `version_on` for the new row in customer. Then we insert the old row into our history table, and return the `NEW` row. The ability in postgres to modify the `NEW` row before it is inserted is really nice, since we can keep `version` and `version_on` details hidden from most queries.

```sql
CREATE OR REPLACE FUNCTION tr_update_customer() RETURNS TRIGGER AS $$
BEGIN
  NEW.version := OLD.version + 1;
  NEW.version_on := now();

  INSERT INTO customer_history (customer_id, name, version, version_on, version_by, is_removed)
  VALUES (OLD.customer_id, OLD.name, OLD.version, OLD.version_on, OLD.version_by, OLD.is_removed);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

The trigger itself defines when to execute our trigger function. In our case, we want to run the trigger _before_ an `UPDATE` on the customer table. Then, for each row, run the trigger.

```sql
CREATE TRIGGER tr_update_customer
BEFORE UPDATE ON customer
  FOR EACH ROW EXECUTE PROCEDURE tr_update_customer();
```

### Updates as usual

Updating a table is almost the same as usual, but don't forget to include the `version_by`. We can prevent conflicts by ensuring that the version passed in is still the current version. In this case, no rows would be updated. Either the application code needs to handle this, throwing a conflict error, or the update can be [put into a stored procedure](http://stackoverflow.com/a/5448988) that throws an error.

```sql
UPDATE customer
SET name = 'sabre',
    version_by = 'Jo Bennett'
WHERE name = 'dunder mifflin'
   AND version = 1;
```

The `customer` table should now look like this:

| customer_id | name                | version | version_on               | version_by | created_on               | is_removed |
|:------------|:--------------------|:--------|:-------------------------|:-----------|:-------------------------|:-----------|
| 2           | vance refrigeration | 1       | August, 04 2015 11:46:57 | Bob Vance  | August, 04 2015 11:46:57 | false      |
| 1           | sabre               | 2       | August, 04 2015 11:52:45 | Jo Bennett | August, 04 2015 11:46:57 | false      |

And the `customer_history` table should look like this:

| customer_id | name           | version | version_on               | version_by    | is_removed |
|:------------|:---------------|:--------|:-------------------------|:--------------|:-----------|
| 1           | dunder mifflin | 1       | August, 04 2015 11:46:57 | David Wallace | false      |

So, we have our history saved and we can see who created Dunder Mifflin, as well as who updated it and when. As always, here is the [SQL Fiddle](http://sqlfiddle.com/#!15/b4cb6).

Note for this fiddle: _SQL fiddle splits queries on semi-colons, but I needed semi-colons inside the functions. So, I had to use `//` to delimit each query in the schema section._

### Querying

To find the most current version of an entity is simple. In our example, the `customer` table always represents the most current version of the entity. We still need to check for `is_removed`, though.

```sql
SELECT *
FROM customer
WHERE is_removed IS FALSE;
```

To find the first version of an entity, we want to select from `customer` or `customer_history` where the `version = 1`.

```sql
WITH original_customer AS (
	SELECT customer_id, name, version, version_on, is_removed
	FROM customer
	WHERE version = 1

	UNION ALL

	SELECT customer_id, name, version, version_on, is_removed
	FROM customer_history ch
	WHERE version = 1
)
SELECT *
FROM original_customer
```

To get the version of an entity at a specific point in time requires a little more work, but it is still possible. We want to select the latest version of customer from either the `customer` or `customer_history` tables where that version of the customer existed before the given time.

```sql
WITH customer_in_time AS (
   SELECT DISTINCT ON(customer_id) customer_id, name, version, version_on, is_removed
   FROM (
      SELECT customer_id, name, version, version_on, is_removed
      FROM customer
      WHERE version_on < '2015-08-05 06:48:52-05'

      UNION ALL

      SELECT customer_id, name, version, version_on, is_removed
      FROM customer_history ch
      WHERE version_on < '2015-08-05 06:48:52-05'
      ORDER BY version_on DESC
   ) c
   ORDER BY c.customer_id, c.version DESC
)
SELECT *
FROM customer_in_time
```

Using `DISTINCT ON` and `ORDER BY` here allows us to easily get the latest version of a customer from the resulting rows matching the `version_on` filter.

## Conclusion

If changes to your data _really_ matter, consider using soft updates in addition to soft deletes. For those of us in healthcare, this is a necessity. Of course, you can also consider alternatives like [Event Sourcing](http://martinfowler.com/eaaDev/EventSourcing.html) and [Datomic](http://www.datomic.com). CQRS is the idea of storing all the changes to an entity rather than the current state of the entity. Datomic is an immutable data store, so you get soft everything for free. I'm very interested in the potential of Datomic and systems like Datomic for this very reason (for which they might be part of a future blog post). Nevertheless, we're using an RDBMS for better or worse, and even though it takes effort to keep history in a traditional RDBMS, it's worth it for us.

#### Notable References

After posting to Hacker News, there were a lot of great suggestions and references to other implementations and examples. Check them out now at [Hacker News](https://news.ycombinator.com/item?id=10016799).

As I have time to review some of these, I'll either update this post or write some follow up articles.

#### Updates 2015-08-06

1. Removed exercises and added some example queries instead, including how to make use of the history table
2. Corrected reference of CQRS to be Event Sourcing.
3. Added `is_removed` to history table. Necessary because one could undo a deletion.
4. Improve `UPDATE` query to use `version` to prevent concurrency issues.