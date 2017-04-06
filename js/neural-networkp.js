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
        myPerceptron, myTrainer;


    function init(bla) {
        Neuron = synaptic.Neuron,
        Layer = synaptic.Layer,
        Network = synaptic.Network,
        Trainer = synaptic.Trainer,
        Architect = synaptic.Architect,
        myPerceptron = new Network();
        myTrainer = null;
        return true;
    }


    function createPerceptron(layers) {
        init(null);
        if(layers.length>2) myPerceptron = applyToConstructor(Architect.Perceptron, layers);
        else if(layers.length==2)myPerceptron=applyToConstructor(twoLayerPerceptron, layers);
        myTrainer = new Trainer(myPerceptron);
        var test1 = Neuron.resetUid()
        return myTrainer;
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


    return {
        init: function (selector) {
            return init(selector);
        },
        createPerceptron: function (selector) {
            return createPerceptron(selector);
        }
    }
}





