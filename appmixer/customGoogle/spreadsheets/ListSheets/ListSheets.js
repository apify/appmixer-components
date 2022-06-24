'use strict';
const commons = require('../../google-commons');
const google = require('googleapis');
const Promise = require('bluebird');

/**
 * ListSheets
 * @extends {Component}
 */
module.exports = {

    async receive(context) {

        const drive = google.drive('v3');
        const listFiles = Promise.promisify(drive.files.list);
        google.options({ auth: commons.getOauth2Client(context.auth) })
        const sheets = await listFiles({
            q: `mimeType='application/vnd.google-apps.spreadsheet'`
        });
        return context.sendJson(sheets, 'out');
    },

    /**
    * @param {Object|string} message
    * @param {Object} message.items
    */
    sheetsToSelectArray(message) {

        const transformed = [];
        const { files } = message || {};
        if (!files) {
            return transformed;
        }

        if (Array.isArray(files)) {
            files.forEach((sheetItem) => {

                transformed.push({
                    label: sheetItem.name,
                    value: sheetItem.id
                });
            });
        }

        return transformed;
    }
};
