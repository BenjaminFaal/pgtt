# pgtt
pgtt is a time traveling tool for PostgreSQL to help speedup development and testing of various applications by enabling the user to easily travel between points in time. This can be useful when for example you have to test a certain mutation multiple times and want to quickly rollback to before the mutation to make changes to the behaviour and test again. This will save time and avoids setting up the data over and over again, especially in larger applications with complex data and flows.

### How it works
PostgreSQL supports creating databases with a [TEMPLATE](https://www.postgresql.org/docs/current/sql-createdatabase.html). pgtt utilises this to create a copy of a database. Once the user wants to time travel to a specific copy pgtt simply replaces the current database with the copy.  

PostgreSQL enforces there are no active connections to the database when copying or restoring. pgtt will simply terminate all connections to that database before these actions. This can result in your application crashing or not being able to connect to the database while copying.

## Usage
Use the [docker-compose.yml](docker-compose.yml) for a good starting point to see how to configure and use pgtt.

## Development
1. Setup a PostgreSQL database
2. Setup the [.env](.env) file accordingly
3. `npm install`
4. `npm run dev`