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
    // var userId = this.event.context ? this.event.context.System.user.userId : this.event.session.user.userId;

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
        const country = body.countryCode || "CA";
        const zipCode = body.postalCode || "94016";
        const url = 'http://api.wunderground.com/api/4a9c079f1cdb5b80/conditions/q/' + country + '/' + zipCode + '.json';
        let userFactor;
        request(url, function (wuError, wuResponse, wuBody) {
            const parsed = JSON.parse(wuBody);
            const dewpoint = parsed.current_observation && parsed.current_observation.dewpoint_f;
            for (i = 0; i < frizzFactorArray.length; i++) {
                console.log(i);
                if (frizzFactorArray[i].level > dewpoint) {
                    userFactor = frizzFactorArray[i];
                    break;
                } else if (i === 4) {
                    userFactor = frizzFactorArray[i];
                }
            }
            const finalMessage = "Your frizz forecast for today is, " + userFactor.defaultResponse + getRandomQuote(userFactor);
            const temperature = " today temperature is " + parsed.current_observation.temp_f + ", the weather will be " + parsed.current_observation.weather;
            console.log(finalMessage);
            var response = {
                version: "1.0",
                response: {
                    shouldEndSession: true,
                    outputSpeech: {
                        type: "SSML",
                        ssml: "<speak>" + finalMessage + temperature + "</speak>"
                    }
                }
            };
            currentContext.succeed(response);
        });
    });
};

function getRandomQuote(userFactor) {
    return userFactor.response[Math.floor(Math.random() * userFactor.response.length)];
}
