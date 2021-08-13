import type {RequestHandler} from '@sveltejs/kit';
import {deleteCopy} from "$lib/postgres/client";

// DELETE /databases/copy/:name/delete.json
export const del: RequestHandler = async (request) => {
    const copyName = request.params.name;

    try {
        await deleteCopy(copyName);
        return {
            status: 200,
            body: 'Database copy "' + copyName + '" deleted'
        };
    } catch (error) {
        console.error('Error deleting' + copyName, error);
        return {
            status: 500,
            body: {
                message: error.message
            }
        }
    }
};
