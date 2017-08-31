$(function() {
    var Neuron = synaptic.Neuron,
        Layer = synaptic.Layer,
        Network = synaptic.Network,
        Trainer = synaptic.Trainer;
    var WIDTH = 200;
    var HEIGHT = 200;
    output = [];


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
        }
    }
    for (var architecture in Architect) {
        Architect[architecture].prototype = new Network();
        Architect[architecture].prototype.constructor = Architect[architecture];
    }

//create TrainingsSet
    var trainingSet = [];
    var samples = [{x: 46, y: 29, color: 0}, {x: 168, y: 161, color: 2}];
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
    }

//prepare training
    var activationFunction = Neuron.squash.LOGISTIC;
    var myPerceptron = new Architect.Perceptron(2, 8, 8, 3);
    var myTrainer = new Trainer(myPerceptron);
    var iterations = 300000;
    var dynamicRate = 0.01;

    var t0 = performance.now();
    train();
//miniBatchTrain(3800, myTrainer, trainingSet, 20, {iterations: 380000, rate: 0.001});



    function train() {
        myTrainer.trainAsync(trainingSet, {
            rate: dynamicRate,
            iterations: iterations,
            cost: Trainer.cost.MSE,
            error: 0.00000000000000000000000000000000000000000000000000000000000001
        }).then(function (results) {
            var t1 = performance.now();
            $("#div1").text('Trainingtime: ' + (t1 - t0).toString());
            var rgb = myPerceptron.activate([49 / HEIGHT, 29 / WIDTH]);
            $("#div2").text("rgb for point (" + 49 + ", " + 29 +") which should be red" );
            $("#div3").text("r: " + (rgb[0]*255).toFixed(3) + ", g: " + (rgb[1]*255).toFixed(3)+ ", b: " + (rgb[2]*255).toFixed(3));
            var rgb = myPerceptron.activate([168 / HEIGHT, 161 / WIDTH]);
            $("#div4").text("rgb for point (" + 168  + ", " + 161 +") which should be blue" );
            $("#div5").text("r: " + (rgb[0]*255).toFixed(3) + ", g: " + (rgb[1]*255).toFixed(3)+ ", b: " + (rgb[2]*255).toFixed(3));
            $("#div6").text("iterations: " + results.iterations);
            $("#div7").text("error: " + results.error);
        });
    }
});