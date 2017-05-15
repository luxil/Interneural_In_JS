/**
 * Created by Linh Do on 01.04.2017.
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
            percLayers.push(myPerceptron.layers.input);
            for (var layer in myPerceptron.layers.hidden)  percLayers.push(myPerceptron.layers.hidden[layer]);
            percLayers.push(myPerceptron.layers.output);
        }
        else if(layers.length==2) {
            myPerceptron=applyToConstructor(twoLayerPerceptron, layers);
            for (var layer in myPerceptron.layers)  percLayers.push(myPerceptron.layers[layer]);
        }
        myTrainer = new Trainer(myPerceptron);

        perceptronDat = {
            "percLayers": percLayers,
            "numberOfNeurons": myPerceptron.neurons().length
        }
        return perceptronDat;
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

    function trainTest(/*trainingSamples, iteration*/message){
        var trainingSet = []

        //var samples = trainingSamples;
        var samples = message.samples;
        // train the network
        output = [];
        for (var j = 0; j < samples.length; j++) {
            var x = samples[j].x / WIDTH;
            var y = samples[j].y / HEIGHT;
            var r = samples[j].r / 255;
            var g = samples[j].g / 255;
            var b = samples[j].b / 255;
            trainingSet.push({input:[x, y],output:[r, g, b]});
        }

        myTrainer.train(trainingSet,{
            rate: .1,
            /*iterations: iteration,*/
            iterations: message.iterations,
            error: .005,
            shuffle: true,
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
        // console.log(myPerceptron.activate([0,1]));
        // console.log(myPerceptron.activate([samples[10].x/100,samples[10].y/100]));
        return output;
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





