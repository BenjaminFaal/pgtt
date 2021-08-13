import pg from 'pg';
import {COPY_INFIX} from "$lib/constants";
import type {Copy, Database} from "$lib/types/Database";

const host = import.meta.env.VITE_POSTGRES_HOST || process.env['POSTGRES_HOST'] || 'localhost';
const port = import.meta.env.VITE_POSTGRES_PORT || process.env['POSTGRES_PORT'] || 5432;
const user = import.meta.env.VITE_POSTGRES_USER || process.env['POSTGRES_USER'] || 'postgres';
const password = import.meta.env.VITE_POSTGRES_PASSWORD || process.env['POSTGRES_PASSWORD'] || 'postgres';
const database = import.meta.env.VITE_POSTGRES_DB || process.env['POSTGRES_DB'] || 'postgres';

const client = new pg.Client({
    host: host,
    port: port,
    user: user,
    password: password,
    database: database
});

const connectionString = `${client.user}:${[...client.password].map(() => '*').join('')}@${client.host}:${client.port}/${client.database}`;

console.log('Connecting to', connectionString);
client.connect()
    .then(() => {
        console.log('Connected to', connectionString);
    })
    .catch(err => {
        console.error('Error connecting to', connectionString, err);
        process.exit(1);
    });

async function terminateAllConnections(databaseName: string) {
    await client.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = ${client.escapeLiteral(databaseName)}
          AND pid <> pg_backend_pid();
    `);
}

export async function createCopy(databaseName: string): Promise<string> {
    await terminateAllConnections(databaseName);
    const now = new Date().getTime();
    const copyName = `${databaseName}${COPY_INFIX}${now}`;
    await client.query(`
        CREATE DATABASE ${client.escapeIdentifier(copyName)} TEMPLATE ${client.escapeIdentifier(databaseName)};
    `);
    return copyName;
}

export async function restoreCopy(copyName: string) {
    const baseDatabaseName = copyName.split(COPY_INFIX)[0];
    await terminateAllConnections(baseDatabaseName);
    await client.query(`
        DROP DATABASE ${baseDatabaseName};
    `);
    await client.query(`
        CREATE DATABASE ${client.escapeIdentifier(baseDatabaseName)} TEMPLATE ${client.escapeIdentifier(copyName)};
    `);
}

export async function deleteCopy(copyName: string) {
    await client.query(`
        DROP DATABASE ${client.escapeIdentifier(copyName)}
    `);
}

export async function commentOnDatabase(databaseName: string, comment: string) {
    await client.query(`
        COMMENT ON DATABASE ${client.escapeIdentifier(databaseName)} IS ${client.escapeLiteral(comment)};
    `);
}

function createSelectDatabaseQuery(escapedDatnameExpression: string) {
    return `
        SELECT *, oid, pg_database_size(datname) AS size, pg_catalog.shobj_description(oid, 'pg_database') AS comment
        FROM pg_database
        WHERE NOT datistemplate AND datname ${escapedDatnameExpression}
        ORDER BY datname ASC;
    `
}

export async function getDatabase(datname: string): Promise<Database> {
    const database = (await client.query(createSelectDatabaseQuery(`= ${client.escapeLiteral(datname)}`))).rows[0];
    if (!database) {
        throw new Error(`Database ${datname} not found`);
    }
    database.copies = await listCopies(database.datname);
    return database;
}

export async function listDatabases(): Promise<Database[]> {
    return Promise.all((await client.query(createSelectDatabaseQuery(`NOT LIKE '%${COPY_INFIX}%'`))).rows.map(async database => {
        const copies = await listCopies(database.datname);
        return {...database, copies};
    }));
}

export async function listCopies(databaseName): Promise<Copy[]> {
    return (await client.query(createSelectDatabaseQuery(`LIKE ${client.escapeLiteral(databaseName + COPY_INFIX + '%')}`))).rows;
}

export async function getInfo() {
    const status = (await client.query(`
        SELECT now()                                           AS time,
               (SELECT sum(numbackends) FROM pg_stat_database) AS connections;
    `)).rows[0];

    return {
        connection: {
            host: client.host,
            port: client.port,
            username: client.user,
            password: client.password,
            database: client.database,
        },
        status: status
    }
}