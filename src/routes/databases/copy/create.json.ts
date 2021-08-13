import type {RequestHandler} from '@sveltejs/kit';

import {createCopy, commentOnDatabase} from "$lib/postgres/client";

// POST /databases/copy/create.json
export const post: RequestHandler<any, any, {databaseName: string, comment: string}> = async (request) => {
    const databaseName = request.body.databaseName;
    try {
        const copyName = await createCopy(databaseName);
        if (typeof request.body.comment === 'string') {
            await commentOnDatabase(copyName, request.body.comment);
        }
        return {
            status: 200,
            body: `Copy "${copyName}" created`
        };
    } catch (error) {
        console.error('Error creating copy from ' + databaseName, error);
        return {
            status: 500,
            body: {
                message: error.message
            }
        }
    }
};
