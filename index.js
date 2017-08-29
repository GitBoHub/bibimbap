/**
 * Created by reycastaneda on 8/29/17.
 */
var request = require('request');


const frizzFactor = {
    reallyLow: {
        defaultResponse: "the same",
        response: [
            "Straight hair don’t care.",
            "",
            ""
        ],
        level: [15]
    },
    low: [],
    medium: [],
    mediumHigh: { response: ["Go on, let your hair down. Today is perfect for curls. Yassss.", "", ""], level: [40, 60]},
    high: [],
};

exports.handler = function(event, context) {
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
            this.getWeatherForecast(this.event.request);
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
 * @param request
 */
FrizzForecast.prototype.getWeatherForecast = function (request) {
    // call weather API get info for frizzFactor keys.level > 54  < 54
    // proccess code dewpoint
    // frizzFactorRandom = frizzFactor.mediumhigh.random
    console.log(request);
    // request('http://api.wunderground.com/api/4a9c079f1cdb5b80/geolookup/conditions/q/IA/Cedar_Rapids.json', function (error, response, body) {
    //     console.log('statusCode:', response['location']['city']);
    // });

    var response = {
        version: "1.0",
        response: {
            shouldEndSession: true,
            outputSpeech: {
                type: "SSML",
                ssml: "<speak> Your frizz forecast for today is frizz.defaultResponse, FrizzFactorRandom</speak>"
            }
        }
    };
    this.context.succeed(response);
};
