'use strict';
const GoogleApi = require('googleapis');
const Promise = require('bluebird');

module.exports = {

    type: 'oauth2',

    definition: initData => {

        let googleApi = new GoogleApi.auth.OAuth2(
            initData.clientId,
            initData.clientSecret,
            initData.callbackUrl
        );

        return {

            clientId: initData.clientId,
            clientSecret: initData.clientSecret,

            scope: ['profile', 'email'],

            accountNameFromProfileInfo: function(context) {

                return context.profileInfo.email;
            },

            emailFromProfileInfo: function(context) {

                return context.profileInfo.email;
            },

            authUrl: function(context) {

                return googleApi.generateAuthUrl({
                    ['access_type']: 'offline',
                    scope: context.scope,
                    state: context.ticket,
                    ['approval_prompt']: 'force'
                });
            },

            requestProfileInfo: function(context) {

                return new Promise((resolve, reject) => {
                    let oauth2 = GoogleApi.oauth2('v2');
                    oauth2.userinfo.get({
                        'access_token': context.accessToken
                    }, (error, result) => {
                        if (error) {
                            return reject(error);
                        }
                        if (!result) {
                            return reject('No profile info from google');
                        }
                        resolve(result);
                    });
                });
            },

            requestAccessToken: function(context) {

                return new Promise((resolve, reject) => {
                    try {
                        googleApi.getToken(
                            context.authorizationCode,
                            (error, tokens) => {
                                if (error) {
                                    return reject(error);
                                }
                                googleApi.credentials = tokens;
                                resolve({
                                    accessToken: tokens['access_token'],
                                    accessTokenExpDate: new Date(tokens['expiry_date']),
                                    refreshToken: tokens['refresh_token']
                                });
                            });
                    } catch (error) {
                        return reject(error);
                    }
                });
            },

            refreshAccessToken: function(context) {

                return new Promise((resolve, reject) => {
                    try {
                        googleApi.credentials = {
                            ['access_token']: context.accessToken,
                            ['refresh_token']: context.refreshToken
                        };
                    } catch (error) {
                        return reject(error);
                    }

                    googleApi.refreshAccessToken((error, tokens) => {
                        if (error && error.message === 'invalid_grant') {
                            return reject(new context.InvalidTokenError(`invalid_grant while refreshing`, {
                                googleErr: error
                            }));
                        }
                        if (error) {
                            return reject(error);
                        }

                        resolve({
                            accessToken: tokens['access_token'],
                            accessTokenExpDate: tokens['expiry_date']
                        });
                    });
                });
            },

            validateAccessToken: function(context) {

                return new Promise((resolve, reject) => {
                    let oauth2 = GoogleApi.oauth2('v2');
                    oauth2.tokeninfo({
                        ['access_token']: context.accessToken
                    }, (error, response) => {
                        if (error && error.message === 'invalid_grant') {
                            return reject(new context.InvalidTokenError(`invalid_grant while validating`, {
                                googleErr: error
                            }));
                        }
                        if (error) {
                            return reject(error);
                        }
                        if (!response) {
                            return reject('No response from google API.');
                        }
                        if (response['expires_in']) {
                            return resolve(response['expires_in']);
                        }
                        if (response['error_description'] === 'Invalid Value') {
                            return reject(new context.InvalidTokenError('Token invalidated'));
                        }
                        return reject(new Error('token expired'));
                    });
                });
            }
        };
    }
};
