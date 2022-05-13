
'use strict';

const { ApifyClient } = require('apify-client');
const mime = require('mime');

module.exports = {

    async receive(context) {
        const format = context.properties.fileFormat;
        const fileName = `${context.properties.fileName}.${format}`;
        const datasetId = context.messages.actorData.content.resource.defaultDatasetId;
        await context.log({ datasetId });

        const mimeType = mime.getType(format);

        const client = new ApifyClient();
        const datasetClient = client.dataset(datasetId);
        const datasetBuffer = await datasetClient.downloadItems(format);

        const savedFile = await context.saveFile(fileName, mimeType, datasetBuffer);
        await context.log({ fileId: savedFile.fileId, fileName });
        context.sendJson({ fileId: savedFile.fileId }, 'datasetFile');
    }
}
