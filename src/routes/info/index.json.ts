import type {RequestHandler} from '@sveltejs/kit';
import {getInfo} from "$lib/postgres/client";

// GET /info.json
export const get: RequestHandler = async (request) => {
    try {
        const info = await getInfo();
        return {
            status: 200,
            body: info
        }
    } catch (error) {
        console.error('Error getting server info', error);
        return {
            status: 500,
            body: {
                message: error.message
            }
        }
    }
};