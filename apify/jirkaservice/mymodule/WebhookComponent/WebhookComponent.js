
'use strict';

module.exports = {

    async receive(context) {
        // just log the webhookUrl 
        const webhookUrl = context.getWebhookUrl();
        await context.log({ webhookUrl });
        // get the body of the webhook POST request. it's already parsed to JS object.
        const { data } = context.messages.webhook.content;
        // log the data we got for sanity check
        await context.log(data);
        // send the eventData object to the `eventData` outPort
        // the `value` in `options` of `eventData` outPort references properties of this `data.eventData` object
        context.sendJson(data.eventData, 'eventData');
    }
}
