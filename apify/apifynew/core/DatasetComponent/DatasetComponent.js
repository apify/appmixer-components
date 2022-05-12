
'use strict';

const { ApifyClient } = require('apify-client');

module.exports = {

    async receive(context) {
        const datasetId = context.messages.actorData.content.resource.defaultDatasetId;
        await context.log({ datasetId });

        const client = new ApifyClient();
        const datasetClient = client.dataset(datasetId);
        const dataset = await datasetClient.downloadItems('json').then((res) => JSON.parse(res.toString()));
        await context.log({ json: dataset });
        for (const datasetItem of dataset) {
            context.sendJson(datasetItem, 'datasetItem');
        }
    }
}
