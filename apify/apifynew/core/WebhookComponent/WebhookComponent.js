
'use strict';

module.exports = {

    async receive(context) {
        // just log the webhookUrl 
        const webhookUrl = context.getWebhookUrl();
        await context.log({ webhookUrl });
        // just log the triggerType
        const { triggerType } = context.properties;
        await context.log({ triggerType });
        // get the body of the webhook POST request. it's already parsed to JS object.
        const { data } = context.messages.webhook.content;
        // log the data we got for sanity check
        await context.log(data);
        // send the data object to the `actorData` outPort
        // the `value` in `options` of `actorData` outPort references properties of this `data` object
        context.sendJson(data, 'actorData');
    }
}
