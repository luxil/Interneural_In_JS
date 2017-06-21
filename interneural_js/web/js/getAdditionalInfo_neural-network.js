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
        WIDTH = 250,
        HEIGHT = 250,
        perceptronDat;


    function init(bla) {
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
        output = [];
        // myTrainer = new Trainer(myPerceptron);

        var samples = message.samples;
        // train the network

        console.log(samples[0]);
        console.log(samples[1]);
        var rgbArr = [[255,0,0],[0,255,0],[0,0,255]];
        //var samplePoint = {x: x, y: y, r: rgbArr[picked][0], g: rgbArr[picked][1], b: rgbArr[picked][2], color:picked};

        for (var j = 0; j < samples.length; j++) {
            var x = samples[j].x / WIDTH;
            var y = samples[j].y / HEIGHT;
            // var r = samples[j].r / 255;
            // var g = samples[j].g / 255;
            // var b = samples[j].b / 255;
            var r = rgbArr[samples[j].color][0] / 255;
            var g = rgbArr[samples[j].color][1] / 255;
            var b = rgbArr[samples[j].color][2] / 255;
            trainingSet.push({input:[x, y],output:[r, g, b]});
        }

        myTrainer.train(trainingSet,{
            rate: .1,
            iterations: message.iterations,
            error: .005,
            shuffle: false,
            log: 1000,
            cost: Trainer.cost.CROSS_ENTROPY
        });

        for (var i=0; i <WIDTH; i++){
            for (var j=0; j <HEIGHT; j++){
                var rgb = myPerceptron.activate([j/HEIGHT, i/WIDTH]);
                output.push([rgb[0]*255, rgb[1]*255, rgb[2]*255]);
            }
        }

        var test = myPerceptron.activate([90/WIDTH,90/HEIGHT]);
        console.log("test: "+ test);
        // console.log(myPerceptron.activate([0,1]));
        // console.log(myPerceptron.activate([samples[10].x/100,samples[10].y/100]));
        //console.log(myPerceptron);
        returnObj = {
            "output":output,
            "myPerceptron":myPerceptron
        }
        return JSON.stringify(returnObj);
    }


    var getOutput = function () {
        return output;
    }

    var getPerceptronDat = function () {
        return perceptronDat;
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
