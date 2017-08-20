/**
 * Created by Linh Do on 18.06.2017.
 */
var neuralNetwork = makeNeuralNetwork();
function makeNeuralNetwork() {

    var myPerceptron;
    var weightsDataList = [];
    var weightsData = [];
    var samplesTrained = 0;
    var messageForApp;
    var weightArray;
    var weightChange;
    var gcallback;

    //variables for nn-config
    var activationFunction;

    //neural network parameters
    var Neuron = synaptic.Neuron,
        Layer = synaptic.Layer,
        Network = synaptic.Network,
        Trainer = synaptic.Trainer,
        // Architect = synaptic.Architect,

        myPerceptron, myTrainer,
        output = [],
        WIDTH = 200,
        HEIGHT = 200,
        trainingOutput
    ;


    function init(callback) {
        gcallback = callback;
    }

    function reset() {
        samplesTrained = 0;
        weightArray= [];
        trainingOutput = new Array(WIDTH);
        //create trainingOutputArray trainingOutput[][]
        for (var i = 0; i < trainingOutput.length; i++) {
            trainingOutput[i] = new Array(HEIGHT);
        }

        for (var i=0; i <WIDTH; i++){
            for (var j=0; j <HEIGHT; j++){
                output.push([255,255,255]);
            }
        }
    }

    function updateMaxIterations(msg){
        var message = JSON.parse(msg);
        messageForApp.nnConfigInfo.maxIterations = message.maxIterations;
    }

    //for newNetworkhandler
    function setConfig(msg){
        reset();
        var message = JSON.parse(msg);
        myPerceptron = createPerceptron(message.layers, message.activationFunction);
        var percLayers;

        reOrderLayers(createMessageForApp);

        function reOrderLayers(callback){
            percLayers = [];
            var biasArr = [];
            if(Object.keys(myPerceptron.layers).length >2) {
                percLayers.push(myPerceptron.layers.input);
                for (var layer in myPerceptron.layers.hidden)  percLayers.push(myPerceptron.layers.hidden[layer]);
                percLayers.push(myPerceptron.layers.output);
            }
            else if(Object.keys(myPerceptron.layers).length ===2) {
                for (var layer in myPerceptron.layers)  percLayers.push(myPerceptron.layers[layer]);
            }

            var oldFromIndex=-1;
            weightsDataList = [];
            weightsData = [];
            for(var i = 0; i< percLayers.length; i++) {
                var layer = percLayers[i];
                var fromIndex=-1;
                var bias = [];
                for (var j = 0; j < layer.list.length; j++) {
                    var neuron = layer.list[j];
                    Object.keys(neuron.connections.projected).forEach(function (key) {
                        var weight = neuron.connections.projected[key].weight;
                        var to = neuron.connections.projected[key].to.ID;
                        var from = neuron.connections.projected[key].from.ID;
                        var bias = neuron.connections.projected[key].to.bias;
                        weightsDataList.push({"layerid":i,"weight":weight,"to":to,"from":from});
                        if (weightsData[i] === undefined) {
                            weightsData[i] = [];
                            biasArr[i]=[]
                        }
                        if(oldFromIndex!=from){
                            oldFromIndex=from;
                            fromIndex++;
                        }
                        if (weightsData[i][fromIndex] === undefined) {
                            weightsData[i][fromIndex] = [];
                            biasArr[i][fromIndex]=[];

                        }
                        weightsData[i][fromIndex].push(weight*12);
                        biasArr[i][fromIndex].push(bias*12);

                    });
                }
                if(weightsData[i]!=undefined) {
                    var len = weightsData[i].length;
                    weightsData[i][len] = biasArr[i][0];
                }
            }
            weightsData[percLayers.length]=undefined;
            callback();
        }

        function createMessageForApp() {
            //add layers
            var layers = [];
            message.layers.forEach(function (p1, p2) { //p2 = index of the layer
                if(p2 < percLayers.length-1) {
                    layers[p2] = {
                        "numberOfNeurons": message.layers[p2],
                        "weights": {
                            "data": weightsData[p2]
                        }
                    };
                }else{
                    layers[p2] = {
                        "numberOfNeurons": message.layers[p2],
                        "weights": null
                    };
                }
            });

            var graphObj = {
                "layers": layers,
                "sampleCoverage": 0,
                "samplesTrained":0,
                "weightChange":0
            }

            var outputObj = {
                "data": resetOutput()
            }

            var nnConfigInfoObj = {
                "activationFunction": message.activationFunction,
                "learningRate": message.learningRate,
                "maxIterations": message.maxIterations
            }

            messageForApp = {
                "bMaxIterationsReached": false,
                "nnConfigInfo": nnConfigInfoObj,
                "id": message.id,
                "graph": graphObj,
                "output":outputObj
            }
        }

        return JSON.stringify(messageForApp);
    }

    function resetOutput() {
        output = [];
        for (var i = 0; i < WIDTH; i++) {
            for (var j = 0; j < HEIGHT; j++) {
                if ((i % 2 === 0) && (j % 2 === 0)) {
                    output.push([255, 255, 255]);
                }
            }
        }
        return output;
    }

    function startTraining(msg){
        //first check whether max Iterations is reached
        var message = JSON.parse(msg);
        var maxIterations = message.maxIterations;
        messageForApp.nnConfigInfo.maxIterations = message.maxIterations;
        var diffIterations = (maxIterations!="") ? (maxIterations -samplesTrained): message.iterations;
        var iterations = (diffIterations<=message.iterations) ? diffIterations : message.iterations;

        //max Iterations is reached, don't train the network
        if(iterations<=0){
            messageForApp.bMaxIterationsReached= true;
            gcallback(messageForApp);
        }else {
            //create TrainingsSet
            var trainingSet = [];
            var samples = message.samples;
            var rgbArr = [[255, 0, 0], [0, 255, 0], [0, 0, 255]];
            for (var j = 0; j < samples.length; j++) {
                var x = samples[j].x / WIDTH;
                var y = samples[j].y / HEIGHT;
                var r = rgbArr[samples[j].color][0] / 255;
                var g = rgbArr[samples[j].color][1] / 255;
                var b = rgbArr[samples[j].color][2] / 255;
                trainingSet.push({
                    input: [x, y],
                    output: [r, g, b]
                });
                trainingOutput[Math.floor(samples[j].x)][Math.floor(samples[j].y)] = [r, g, b];
            }

            //train the network
            myTrainer.trainAsync(trainingSet, {
                rate: messageForApp.nnConfigInfo.learningRate,
                // rate: .01 / (1 + .0005 * samplesTrained),
                iterations: iterations,
                error: .005,
                // shuffle: true,
                cost: Trainer.cost.MSE
            }).then(function (results) {
                // console.log('done!', results.error);
                // error = results.error;

                returnObj = {
                    "myPerceptron": myPerceptron,
                    "samplesTrained": (samplesTrained += iterations)
                }
                updateAndSendMessageForApp(JSON.stringify(returnObj));
            });
        }
    }

    function getOutputArrayAndSampleCoverage(trainingsSetLength){
        var countTrueMatches = 0;
        output = [];
        for (var i = 0; i < WIDTH; i++) {
            for (var j = 0; j < HEIGHT; j++) {
                if (trainingOutput[i][j] != undefined) {
                    var rgb = myPerceptron.activate([j / HEIGHT, i / WIDTH]);
                    if (clipTo_0_or_1(rgb[0]) === trainingOutput[i][j][0] && clipTo_0_or_1(rgb[1]) === trainingOutput[i][j][1] && clipTo_0_or_1(rgb[2]) === trainingOutput[i][j][2]) {
                        countTrueMatches++;
                    }
                }
                if ((i % 2 === 0) && (j % 2 === 0)) {
                    var rgb = myPerceptron.activate([j / HEIGHT, i / WIDTH]);
                    output.push([rgb[0] * 255, rgb[1] * 255, rgb[2] * 255]);
                }
            }
        }
        var sampleCoverage = (countTrueMatches / trainingsSetLength);
        return output;
    }

    function updateAndSendMessageForApp(returnobj){
        var trainingsResults = JSON.parse(returnobj);
        updateWeightInfos(trainingsResults, updateMessageForApp);

        function updateMessageForApp() {
            messageForApp.id = 1;
            messageForApp.bMaxIterationsReached= false;
            messageForApp.graph.samplesTrained = trainingsResults.samplesTrained;
            messageForApp.graph.weightChange = weightChange;
            messageForApp.graph.sampleCoverage=0;
            messageForApp.output.data = getOutputArrayAndSampleCoverage();
        }
        gcallback(messageForApp);
    }

    function updateWeightInfos(trainingsResults, callback) {
        var newWeightChange = 0;
        if(trainingsResults.myPerceptron.connections!=undefined && weightArray.length!=0){
            for (var i = 0; i < trainingsResults.myPerceptron.connections.length; i++ ) {
                newWeightChange += Math.abs(trainingsResults.myPerceptron.connections[i].weight-weightArray[i]);
                weightArray[i]=trainingsResults.myPerceptron.connections[i].weight;
            }
        }else if (trainingsResults.myPerceptron.connections!=undefined){
            for (var i = 0; i < trainingsResults.myPerceptron.connections.length; i++ ){
                weightArray.push(trainingsResults.myPerceptron.connections[i].weight)
            }
        }
        weightChange = newWeightChange;

        var oldFromNeuronID = -1;
        var dataID = 0;
        var layerIndex;

        for(var i = 0; i< trainingsResults.myPerceptron.connections.length; i++) {

            var layerNameOfNeuron_i = trainingsResults.myPerceptron.neurons[parseInt(trainingsResults.myPerceptron.connections[i].from)].layer;
            var fromNeuronID = parseInt(trainingsResults.myPerceptron.connections[i].from);
            var oldLayerIndex=layerIndex;
            if( layerNameOfNeuron_i=== "input"){
                layerIndex = 0;
            } else if(layerNameOfNeuron_i=== "output"){
                layerIndex = messageForApp.graph.layers.length-1;
            } else{
                layerIndex = parseInt(layerNameOfNeuron_i)+1;
            }

            if(layerIndex!=oldLayerIndex){
                dataID=0;
            }

            if(oldFromNeuronID===-1 ){
                messageForApp.graph.layers[layerIndex].weights.data[dataID] = [];
            }
            else if(oldFromNeuronID!=fromNeuronID && oldFromNeuronID!=-1){
                dataID ++;
                messageForApp.graph.layers[layerIndex].weights.data[dataID] = [];
            }
            oldFromNeuronID = fromNeuronID;
            messageForApp.graph.layers[layerIndex].weights.data[dataID].push(parseFloat(trainingsResults.myPerceptron.connections[i].weight));
        }
        callback();
    }


    /**
     *
     * neuronal network functions
     *
     */
    function createPerceptron(layers, sActFunc) {

        switch(sActFunc) {
            case "logistic":
                activationFunction = Neuron.squash.LOGISTIC;
                break;
            case "relu":
                activationFunction = Neuron.squash.RELU;
                break;
            case "tanh":
                activationFunction = Neuron.squash.TANH;
                break;
            case "identity":
                activationFunction = Neuron.squash.IDENTITY;
                break;
        }

        if(layers.length > 2)           myPerceptron = applyToConstructor(Architect.Perceptron, layers);
        else if(layers.length === 2)    myPerceptron = applyToConstructor(Architect.OneLayerPerceptron, layers);

        //to use apply method() with a constructor; apply() method calls a function with a given this value and arguments provided as an array
        function applyToConstructor(constructor, argArray) {
            var args = [null].concat(argArray);
            var factoryFunction = constructor.bind.apply(constructor, args);
            return new factoryFunction();
        }

        myTrainer = new Trainer(myPerceptron);
        return myPerceptron;
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

    var Architect = {

        // Multilayer Perceptron
        Perceptron: function Perceptron() {

            var args = Array.prototype.slice.call(arguments); // convert arguments to Array
            if (args.length < 3)
                throw new Error("not enough layers (minimum 3) !!");

            var inputs = args.shift(); // first argument
            var outputs = args.pop(); // last argument
            var layers = args; // all the arguments in the middle

            var input = new Layer(inputs);
            input.set({squash: activationFunction});
            var hidden = [];
            var output = new Layer(outputs);
            output.set({squash: activationFunction});

            var previous = input;

            // generate hidden layers
            for (var level in layers) {
                var size = layers[level];
                var layer = new Layer(size);
                layer.set({squash: activationFunction});
                hidden.push(layer);
                previous.project(layer);
                previous = layer;
            }
            previous.project(output);

            // set layers of the neural network
            this.set({
                input: input,
                hidden: hidden,
                output: output
            });

            // trainer for the network
            this.trainer = new Trainer(this);
        },

        OneLayerPerceptron: function OneLayerPerceptron(input, output) {
            // create the layers
            var inputLayer = new Layer(input);
            inputLayer.set({squash: activationFunction});
            var outputLayer = new Layer(output);
            outputLayer.set({squash: activationFunction});

            // connect the layers
            inputLayer.project(outputLayer);

            // set the layers
            this.set({
                input: inputLayer,
                output: outputLayer
            });
        },
        OneLayerPerceptronx: function OneLayerPerceptron(input, output) {
            // create the layers
            var inputLayer = new Layer(input);
            inputLayer.set({squash: activationFunction});
            var outputLayer = new Layer(output);
            outputLayer.set({squash: activationFunction});

            // connect the layers
            inputLayer.project(outputLayer);

            // set the layers
            this.set({
                input: inputLayer,
                output: outputLayer
            });
        }
    }
    for (var architecture in Architect) {
        Architect[architecture].prototype = new Network();
        Architect[architecture].prototype.constructor = Architect[architecture];
    }


    // expose public functions
    return {
        init: function (selector) {
            return init(selector);
        },
        setConfig: function (message) {
            return setConfig(message)
        },
        startTraining: function (message) {
            return startTraining(message)
        },
        updateMaxIterations: function (message) {
            return updateMaxIterations(message)
        }
    }
}
