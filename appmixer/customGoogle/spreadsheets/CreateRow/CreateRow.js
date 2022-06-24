'use strict';
const commons = require('../../google-commons');
const google = require('googleapis');
const Promise = require('bluebird');
const _ = require('lodash');

/**
 * GMail send email component.
 * @extends {Component}
 */
module.exports = {

    receive(context) {

        const sheets = google.sheets('v4');
        const createRow = Promise.promisify(sheets.spreadsheets.values.append, { context: sheets.spreadsheets.values });

        return createRow({
            auth: commons.getOauth2Client(context.auth),
            spreadsheetId: context.properties.sheetId,
            range: context.properties.worksheetId.split('/')[1],
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: [
                    _.values(context.messages.in.content)
                ]
            }
        }).then(response => {
            if (response && response.updates) {
                const updates = response.updates;
                return context.sendJson({
                    spreadsheetId: updates.spreadsheetId,
                    newRange: updates.updatedRange,
                    newRows: updates.updatedRows,
                    updatedColumns: updates.updatedColumns,
                    newCells: updates.updatedCells
                }, 'createdRow');
            }
        });
    }
};
