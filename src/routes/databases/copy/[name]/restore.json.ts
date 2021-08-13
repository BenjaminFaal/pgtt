import type {RequestHandler} from '@sveltejs/kit';
import {restoreCopy} from "$lib/postgres/client";

// POST /databases/copy/:name/restore.json
export const post: RequestHandler = async (request) => {
    const copyName = request.params.name;

    try {
        await restoreCopy(copyName);
        return {
            status: 200,
            body: 'Restored database copy: ' + copyName
        };
    } catch (error) {
        console.error('Error restoring' + copyName, error);
        return {
            status: 500,
            body: {
                message: error.message
            }
        }
    }
};
