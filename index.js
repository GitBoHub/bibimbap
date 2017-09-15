/**
 * Created by reycastaneda on 8/29/17.
 */
var request = require('request');


const frizzFactorArray = [
    {
        defaultResponse: "Dry, with a chance of flat hair,",
        response: [
            "Straight hair don’t care. Have a great hair day!",
            "<prosody pitch='high' volume='x-loud'>Hot dog! Go on, warm up that hair straightener.</prosody>",
            "And a high chance of static electricity.",
            "Whip your straight hair back and forth.",
            "One does not simply straighten their hair every day. Only on days like today.",
            "I don’t always have straight hair, but when I do I check with Frizz Forecast."
        ],
        level: 15,
    },
    {
        defaultResponse: "Low, with a small chance of frizzle,",
        response: [
            "<prosody rate='x-slow' volume='medium' pitch='x-low'>Hey girl,</prosody><prosody rate='medium' pitch='x-low'>your hair is hardly frizzy at all today. </prosody>",
            "Challenge accepted, mother nature.",
            "Don’t cry over frizzy hair.",
            "Don't worry. Frizz is temporary.",
            "<prosody rate='medium' pitch='x-high'>Now watch me snip. Watch me,</prosody><prosody rate='x-fast' pitch='x-high'>spray spray.</prosody>",
            "Wake up and smell the hairspray."
        ],
        level: 30,
    },
    {
        defaultResponse: "Partly frizzy,",
        response: [
            "With enough hairspray, you’ll avoid a frizz-aster.<audio src='https://s3.amazonaws.com/sounds226/boom.mp3'/>",
            "<emphasis level=‘strong’>To kerl.</emphasis> or not to <emphasis level=‘strong’>kerl.</emphasis> That is the question.",
            "The hair tie: Never leave home without it.",
            "First world frizz problems.",
            "Make waves. Literally, make hair waves.",
            "I like to groom it groom it.",
            "I got 99 bobby pins, but I can't find one."
        ],
        level: 40,
    },
    {
        defaultResponse: "Clear for curls,",
        response: [
            "Go on, let your hair down. Today is perfect for curls. Yassss.",
            "Who run the world? Curls. Go ahead, get your curl on today.",
            "Awwwww yeah. Curly hair. Don’t care.",
            "Love is in the hair. Today brings prime curl conditions.",
            "Curlies have more fun. Now, go out there and prove it.",
            "Big hair don’t care.<amazon:effect name='whispered'> I’m Alexa and I approve this message.</amazon:effect>",
            "Footloose and frizz free."
        ],
        level: 60,
    },
    {
        defaultResponse: "Severe frizz warning,",
        response: [
            "<prosody rate='slow' volume='x-loud'>Sorry, I can’t hear you over the volume of your hair.</prosody>",
            "Is your hair big today? <amazon:effect name='whispered'>because it’s full of secrets</amazon:effect>",
            "Can I call you Miss Frizzle?",
            "There's a 100 percent chance of a ponytail.",
            "I see a ponytail in your future.",
            "Take the necessary precautions, and go for a classic bun.",
            "Let it fro. Let it fro. Let it fro.",
            "All’s fair in love and frizz.",
            "This frizz shall pass.",
            "You know what they say. Messy bun and getting stuff done.",
            "<say-as interpret-as='expletive'>shit</say-as>happens, and so does frizzy hair.",
            "Your heart will frizz on."
        ],
        level: 61,
    }
];

const firstTempResponse = [
    "In location, it’s currentTemp degrees with currentCond.",
    "Today in location, it’s currentTemp degrees with currentCond.",
    "Right now in location, it’s currentTemp degrees with currentCond.",
    "Currently, in location it’s currentTemp degrees with currentCond.",
];

const secondTempResponse = [
    "Today, you can look for forecastCond,",
    "Tonight’s forecast has forecastCond,",
    "Today, you can expect forecastCond,",
];

const thirdTempResponse = [
    "with a high of forecastHigh degrees and a low of forecastLow degrees,",
    "with a low of forecastLow degrees.",
];

const warningResponse = [
    "In {0} there’s a {1} in effect {dayS} {dateS} {timeS} to {dayF} {dateF} {timeF}."
]

exports.handler = function (event, context) {
    var player = new FrizzForecast(event, context);
    player.handle();
};

var FrizzForecast = function (event, context) {
    this.event = event;
    this.context = context;
};

// Handles an incoming Alexa request
FrizzForecast.prototype.handle = function () {
    var requestType = this.event.request.type;

    if (requestType === "LaunchRequest") {
        this.say("Hello there this is your frizz forecast, ask me if you will have a good hair day!", "You can say what is my frizz forecast?");
    } else if (requestType === "IntentRequest") {
        var intent = this.event.request.intent;
        if (intent.name === "frizzForecast") {
            const consentToken = this.event.context ?
                this.event.context.System.user.permissions && this.event.context.System.user.permissions.consentToken :
                this.event.session.user.permissions && this.event.session.user.permissions.consentToken;
            const deviceId = this.event.context ?
                this.event.context.System.device && this.event.context.System.device.deviceId :
                "";
            this.getWeatherForecast(deviceId, consentToken);
        } else if (intent.name === "AMAZON.PauseIntent") {

        } else if (intent.name === "AMAZON.ResumeIntent") {

        }
    }
};

/**
 * Creates a proper Alexa response using Text-To-Speech
 * @param message
 * @param repromptMessage
 */
FrizzForecast.prototype.say = function (message, repromptMessage) {
    var response = {
        version: "1.0",
        response: {
            shouldEndSession: false,
            card: {
                "type": "AskForPermissionsConsent",
                "permissions": [
                    "read::alexa:device:all:address:country_and_postal_code"
                ]
            },
            outputSpeech: {
                type: "SSML",
                ssml: "<speak> " + message + " </speak>"
            },
            reprompt: {
                outputSpeech: {
                    type: "SSML",
                    ssml: "<speak> " + repromptMessage + " </speak>"
                }
            }
        }
    };
    this.context.succeed(response);
};

/**
 * Gets the frizz forecast ased on the current weather
 * @param deviceId
 * @param consentToken
 */
FrizzForecast.prototype.getWeatherForecast = function (deviceId, consentToken) {
    const currentContext = this.context;
    request.get('https://api.amazonalexa.com/v1/devices/' + deviceId + '/settings/address/countryAndPostalCode', {
        'auth': {
            'bearer': consentToken
        }
    }, function (error, response, body) {
        const country = body.countryCode ? body.countryCode : "US";
        const zipCode = body.postalCode ? body.postalCode : "98121";
        const url = 'http://api.wunderground.com/api/4a9c079f1cdb5b80/conditions/q/' + country + '/' + zipCode + '.json';
        const forecast = 'http://api.wunderground.com/api/4a9c079f1cdb5b80/forecast/q/' + country + '/' + zipCode + '.json';
        console.log(url, forecast);
        let userFactor;
        request(url, function (wuError, wuResponse, wuBody) {
            request(forecast, function (foreError, foreResponse, foreBody) {
                const conditionsParsed = JSON.parse(wuBody);
                const forecastParsed = JSON.parse(foreBody);
                const dewpoint = conditionsParsed.current_observation && conditionsParsed.current_observation.dewpoint_f;
                const location = conditionsParsed.current_observation.display_location.city;
                const currentTemp = conditionsParsed.current_observation.temp_f;
                const currentCond = conditionsParsed.current_observation.weather + ' skies';
                const firstResponseValues = {location, currentTemp, currentCond};
                const secondResponseValues = {
                    forecastCond: forecastParsed.forecast.simpleforecast.forecastday[0].conditions + " skies",
                };
                const thirdResponseValues = {
                    forecastHigh: forecastParsed.forecast.simpleforecast.forecastday[0].high.fahrenheit,
                    forecastLow: forecastParsed.forecast.simpleforecast.forecastday[0].low.fahrenheit,
                };
                for (i = 0; i < frizzFactorArray.length; i++) {
                    if (frizzFactorArray[i].level > dewpoint) {
                        userFactor = frizzFactorArray[i];
                        break;
                    } else if (i === 4) {
                        userFactor = frizzFactorArray[i];
                    }
                }
                // console.log('forecastParsed', forecastParsed.forecast.simpleforecast.forecastday[0]);
                console.log(location, currentTemp, currentCond);
                const finalMessage = "Your frizz forecast for today is, " + userFactor.defaultResponse + " " + getRandomStringFromArray(userFactor) + " ";
                const condMessage = getRandomStringFromArray(firstTempResponse).replace(/location|currentTemp|currentCond/gi, match => {
                    return firstResponseValues[match];
                });
                const forecastCondMessage = getRandomStringFromArray(secondTempResponse).replace(/forecastCond/gi, function (match) {
                    return secondResponseValues[match];
                });
                const forecastTempMessage = getRandomStringFromArray(thirdTempResponse).replace(/forecastHigh|forecastLow/gi, function (match) {
                    return thirdResponseValues[match];
                });
                var response = {
                    version: "1.0",
                    response: {
                        shouldEndSession: true,
                        outputSpeech: {
                            type: "SSML",
                            ssml: "<speak>" + finalMessage + condMessage + " " + forecastCondMessage + " " + forecastTempMessage + "</speak>"
                        }
                    }
                };
                currentContext.succeed(response);
            });
        });
    });
};

function getRandomStringFromArray(array) {
    if (array.response) return array.response[Math.floor(Math.random() * array.response.length)];
    return array[Math.floor(Math.random() * array.length)];
}
