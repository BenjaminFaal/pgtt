import type {RequestHandler} from '@sveltejs/kit';
import {listDatabases} from "$lib/postgres/client";

// GET /databases.json
export const get: RequestHandler = async () => {
    try {
        const databases = await listDatabases();
        return {
            status: 200,
            body: databases
        };
    } catch (error) {
        console.error('Error listing databases', error);
        return {
            status: 500,
            body: {
                message: error.message
            }
        }
    }
};