/**
 * Created by Linh Do on 18.06.2017.
 */

var neuralNetwork = makeNeuralNetwork();
function makeNeuralNetwork() {
    var Neuron = synaptic.Neuron,
        Layer = synaptic.Layer,
        Network = synaptic.Network,
        Trainer = synaptic.Trainer,
        Architect = synaptic.Architect,

        myPerceptron, myTrainer,
        output = [],
        WIDTH = 200,
        HEIGHT = 200,
        perceptronDat,
        trainingOutput,
        weightArray
    ;


    function init(bla) {
        weightArray= [];
        trainingOutput = new Array(WIDTH);
        for (var i = 0; i < trainingOutput.length; i++) {
            trainingOutput[i] = new Array(HEIGHT);
        }

        for (var i=0; i <WIDTH; i++){
            for (var j=0; j <HEIGHT; j++){
                output.push([255,255,255]);
            }
        }
    }

    function createPerceptron(layers) {
        Neuron.resetUid();
        var percLayers = [];
        if(layers.length>2) {
            myPerceptron = applyToConstructor(Architect.Perceptron, layers);
        }
        else if(layers.length==2) {
            myPerceptron=applyToConstructor(twoLayerPerceptron, layers);
        }
        myTrainer = new Trainer(myPerceptron);
        // console.log(myTrainer);
        return myPerceptron;
    }

    function twoLayerPerceptron(input, output){
        // create the layers
        var inputLayer = new Layer(input);
        var outputLayer = new Layer(output);

        // connect the layers
        inputLayer.project(outputLayer);

        // set the layers
        this.set({
            input: inputLayer,
            output: outputLayer
        });
    }
    // extend the prototype chain
    twoLayerPerceptron.prototype = new Network();
    twoLayerPerceptron.prototype.constructor = twoLayerPerceptron;


    //to use apply with a constructor; apply() method calls a function with a given this value and arguments provided as an array
    function applyToConstructor(constructor, argArray) {
        var args = [null].concat(argArray);
        var factoryFunction = constructor.bind.apply(constructor, args);
        return new factoryFunction();
    }

    function trainTest(message){
        var trainingSet = [];
        var tempOutput = output;
        output = [];

        var samples = message.samples;

        //create TrainingsSet
        var rgbArr = [[255,0,0],[0,255,0],[0,0,255]];
        for (var j = 0; j < samples.length; j++) {
            var x = samples[j].x / WIDTH;
            var y = samples[j].y / HEIGHT;
            var r = rgbArr[samples[j].color][0] / 255;
            var g = rgbArr[samples[j].color][1] / 255;
            var b = rgbArr[samples[j].color][2] / 255;
            trainingSet.push({
                input:[x, y],
                output:[r, g, b]});
            trainingOutput[Math.floor(samples[j].x)][Math.floor(samples[j].y)]=[r, g, b];
        }

        // train the network
        myTrainer.trainAsync(trainingSet,{
            rate: 0.001,
            iterations: (message.iterations),
            error: .05,
            shuffle: false,
            // log: 1,
            cost: Trainer.cost.CROSS_ENTROPY,
            squash: Neuron.squash.TANH()//,
            // schedule: {
            //     every: 100, // repeat this task every 500 iterations
            //     do: function(data) {
            //         // custom log
            //         console.log("error", data.error, "iterations", data.iterations, "rate", data.rate);
            //         // if (someCondition)
            //         //     return true; // abort/stop training
            //     }
            // }
        }).then(results => console.log('done!', results));

        var countTrueMatches = 0;
        for (var i=0; i <WIDTH; i++){
            for (var j=0; j <HEIGHT; j++) {
                var rgb = myPerceptron.activate([j / HEIGHT, i / WIDTH]);
                if(trainingOutput[i][j] != undefined){
                    rgb = rgb;
                    if( clipTo_0_or_1(rgb[0]) === trainingOutput[i][j][0] && clipTo_0_or_1(rgb[1]) === trainingOutput[i][j][1] && clipTo_0_or_1(rgb[2]) === trainingOutput[i][j][2]){
                        countTrueMatches++;
                    }
                }
                if ((i % 2 === 0)&&(j % 2 ===0)) {
                    output.push([rgb[0] * 255, rgb[1] * 255, rgb[2] * 255]);
                }
            }
        }
        var sampleCoverage = (countTrueMatches/trainingSet.length);



        // var test = myPerceptron.activate([90/WIDTH,90/HEIGHT]);
        // console.log("test: "+ test);
        // console.log(myPerceptron.activate([0,1]));
        // console.log(myPerceptron.activate([samples[10].x/100,samples[10].y/100]));
        returnObj = {
            "output":output,
            "myPerceptron":myPerceptron,
            "sampleCoverage":sampleCoverage
        }
        return JSON.stringify(returnObj);
    }


    var getOutput = function () {
        return output;
    }

    var getPerceptronDat = function () {
        return perceptronDat;
    }

    function clipTo_0_or_1(value) {
        var newValue=-1;
        if (value<0.10){
            newValue = 0;
        } else if (value>0.90){
            newValue = 1;
        }

        return newValue;
    }


    return {
        init: function (selector) {
            return init(selector);
        },
        createPerceptron: function (selector) {
            return createPerceptron(selector);
        },
        trainTest: function (selector) {
            return trainTest(selector);
        },
        getOutput: function () {
            return getOutput();
        },
        getPerceptronDat: function(){
            return getPerceptronDat();
        }
    }
}
