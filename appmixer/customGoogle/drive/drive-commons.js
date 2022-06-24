const { google } = require('googleapis');

let defaultExportFormats = {
    'application/vnd.google-apps.site': {
        extension: 'zip',
        mimeType: 'application/zip'
    },
    'application/vnd.google-apps.document': {
        extension: 'docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    },
    'application/vnd.google-apps.spreadsheet': {
        extension: 'xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
    'application/vnd.google-apps.presentation': {
        extension: 'pptx',
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    },
    'application/vnd.google-apps.drawing': {
        extension: 'png',
        mimeType: 'image/png'
    }
};

/**
 * helper to get/parse environment variables
 * reason for this:
 * $ VAR1=321 node -e 'console.log("VAR1 =", process.env.VAR1, "is type:", typeof process.env.VAR1)'
 * > VAR1 = 321 is type: string
 * @param {string} name
 * @param {*} [defaultValue]
 * @param {?function} [parser]
 * @return {*}
 */
const getEnvVar = (name, defaultValue, parser) => {

    let envVar = process.env[name];
    return envVar ? (typeof parser === 'function' ? parser(envVar) : envVar) : defaultValue;
};

module.exports = {

    defaultExportFormats,

    getOauth2Client(auth) {

        const { clientId, clientSecret, accessToken } = auth;
        let OAuth2 = google.auth.OAuth2;
        let oauth2Client = new OAuth2({
            clientId,
            clientSecret
        });

        oauth2Client.setCredentials({
            'access_token': accessToken
        });

        return oauth2Client;
    },

    getCredentials(credentials) {
        return {
            accessToken: credentials.accessToken,
            expiryDate: credentials.expDate
        };
    }
};
