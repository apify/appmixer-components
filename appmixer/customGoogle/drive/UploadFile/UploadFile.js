'use strict';
const mime = require('mime-types');
const { google } = require('googleapis');
const commons = require('../drive-commons');

module.exports = {

    async receive(context) {

        const auth = commons.getOauth2Client(context.auth);
        const drive = google.drive({ version: 'v3', auth });
        const { userId } = context.auth;
        let { fileId, fileName: fileNameInput, folder } = context.messages.in.content;

        let filename;
        let contentType;

        if (fileNameInput) {
            filename = fileNameInput;
            contentType = mime.lookup(filename);
        } else {
            const fileInfo = await context.getFileInfo(fileId);
            filename = fileInfo.filename;
            contentType = fileInfo.contentType || mime.lookup(filename);
        }

        const resource = { name: filename };
        if (folder) {
            let folderId;
            if (typeof folder === 'string') {
                folderId = folder;
            } else {
                folderId = folder.id;
            }

            resource.parents = [folderId];
        }

        const fileStream = await context.getFileReadStream(fileId);
        const response = await drive.files.create({
            quotaUser: userId,
            resource,
            media: {
                mimeType: contentType,
                body: fileStream
            },
            fields: 'id, name, mimeType, webViewLink, createdTime'
        });

        return context.sendJson({
            fileId,
            googleDriveFileId: response.data.id,
            fileName: response.data.name,
            mimeType: response.data.mimeType,
            webViewLink: response.data.webViewLink,
            createdTime: response.data.createdTime
        }, 'out');
    }
};
