/**
 * https://developers.google.com/analytics/devguides/collection/gtagjs/events#default-event-categories-and-labels
 *
 * https://developers.google.com/analytics/devguides/collection/gtagjs/events
 */

let warnCount = 0;

const Analytics = {

    sendEvent: function (eventCategory, eventAction, eventLabel, eventValue) {

        if (typeof gtag === 'function') {
            gtag('event', eventAction, {
                'event_category': eventCategory,
                'event_label': eventLabel ? eventLabel : null,
                'value': eventValue ? eventLabel : null
            });
        } else {
            if (warnCount++ < 1)
                console.log("WARNING: analytics disabled");
        }

    }

    
};


export default Analytics;
