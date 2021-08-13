import type {RequestHandler} from '@sveltejs/kit';
import {getDatabase} from "$lib/postgres/client";

// GET /databases/:datname.json
export const get: RequestHandler = async (request) => {
    try {
        const database = await getDatabase(request.params.datname);
        return {
            status: 200,
            body: database
        };
    } catch (error) {
        console.error('Error getting database', error)
        return {
            status: 500,
            body: {
                message: error.message
            }
        }
    }
};