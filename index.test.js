const assert = require("chai").assert;
const virtualAlexa = require("virtual-alexa");

let alexa = virtualAlexa.VirtualAlexa.Builder()
    .applicationID("amzn1.ask.skill.273e5e26-7a84-4c2c-b8b7-b85c90478a66")
    .handler("index.handler") // Lambda function file and name
    .intentSchemaFile("./speechAssets/IntentSchema.json") // Path to IntentSchema.json
    .sampleUtterancesFile("./speechAssets/SampleUtterances.txt") // Path to SampleUtterances
    .create();
alexa.context().device().setID("testDeviceID");

describe("Frizz Forecast Tests", function() {
    this.timeout(10000);
    
    it("Launches", (done) => {
        alexa.launch().then((payload) => {
            assert.include(payload.response.outputSpeech.ssml, "Hello there");
            done();
        });
    });

    it("Gets Forecast With Skillbot", (done) => {
        alexa.filter((request) => {
          request.skillbot = {
            countryCode: "US",
            postalCode: "19801"
          };
        }).utter("will I have a good hair day").then((payload) => {
            assert.include(payload.response.outputSpeech.ssml, "Your frizz forecast for today is");
            done();
        });
    });
});
