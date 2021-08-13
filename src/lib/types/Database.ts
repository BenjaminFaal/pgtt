/**
 * https://www.postgresql.org/docs/current/catalog-pg-database.html
 */
interface PostgresDatabase {
    oid: number
    datname: string
    datdba: number
    encoding: number
    datcollate: string
    datctype: string
    datistemplate: boolean
    datallowcon: boolean
    datconnlimit: number
    datlastsysoid: number
    datfrozenxid: number
    datminmxid: number
    dattablespace: number
    datacl: object[]
}

export interface Copy extends PostgresDatabase {
    comment?: string
}

export interface Database extends PostgresDatabase {
    copies: Copy[]
}