'use strict;';

const { ApifyClient } = require('apify-client');

module.exports = {

    async receive(context) {

        let auth = context.auth;
        const message = context.messages.in.content;

        const client = new ApifyClient({ token: auth.apiToken });

        const input = JSON.parse(message.input);

        const options = {
            build: message.build,
            memory: message.memoryMbytes,
            timeout: message.timeoutSecs,
            waitSecs: message.waitSecs
        };

        // Run the actor and wait for it to finish
        const run = await client.actor(message.actId).call(input, options);
        await context.log(run);

        const pageSize = context.config.defaultPageLimit || 1000;

        let itemIndex = 1;

        let items, total, offset, limit, count;
        // First page.
        ({ items, total, offset, limit, count } = await client.dataset(run.defaultDatasetId).listItems({ limit: pageSize }));

        await context.log({ total: total, offset: offset, limit: limit, count: count });
        
        for (const item of items) {
            await context.sendJson({ item, total, itemIndex: itemIndex++ }, 'out');
        }
        // Other pages.
        while (offset + count < total) {
            ({ items, total, offset, limit, count } = await client.dataset(run.defaultDatasetId).listItems({ limit: pageSize, offset: offset + pageSize }));
            for (const item of items) {
                await context.sendJson({ item, total, itemIndex: itemIndex++ }, 'out');
            }
        }
    }
};
