/**
 * Created by Linh Do on 30.03.2017.
 */
//global for network graph
var networkGraph = makeNetworkGraph();
function makeNetworkGraph() {

    var element; // widget root object

    // svg element variables
    var svg; // d3 canvas root
    var force;
    var link; // svg link data
    var node; // svg node data

    // svg data variables
    var nodes = [];
    var links = [];
    var forci = [];
    var linkDistance;

    var width = 1000;
    var height = 600;
    var radius = 20;

    var activeLayers = [];
    var colorCodes = ["#d62728", "#2ca02c", "#1f77b4"];
    var layerColors = ["#3182bd", "#5294c3", "#6baed6", "#91c4df", "#9ecae1", "#b0d1e3", "#c6dbef"];


    function init(selector) {
        element = $(selector);
        svg = d3.select(selector)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        initForce();
        restart();
    }

    function initForce() {
        force = d3.layout.force()
            .gravity(0.01)
            .charge(function(d) {return d.charge;})
            .friction(0.9)
            .linkDistance(function(l, i) {return l.source.bias ? linkDistance/10: linkDistance})
            .size([width, height]);

        // define force behaviour
        force.on("tick", function(e) {
            // give each layer an own center of attraction
            var k = .1 * e.alpha;
            nodes.forEach(function(o, i) {
                o.x += (forci[o.layer].x - o.x) * k;
                o.y += (forci[o.layer].y - o.y) * k;
            });

            // update nodes and links positioning after force influence
            node.attr("cx", function(d) { return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
                .attr("cy", function(d) { return d.y = Math.max(radius, Math.min(height - radius, d.y)); });

            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
        });

        force.start();
    }

    // define stroke color depending on weight
    function applyStrokeColor(d) {
        var gray = 50;
        var colorValue = Math.abs(d.weight) * 120;
        var croppedValue =  Math.max(gray, Math.min(255, colorValue));
        return (d.weight >= 0) ? d3.rgb(gray, gray, colorValue)  : d3.rgb(colorValue, gray, gray);
    }

    function restart() {

        force.nodes(nodes).links(links);
        // add all loaded links to the graph
        // this is done first for layering reasons
        link = svg.selectAll("line").data(links);
        link.transition()
            .duration(1000)
            .ease("quad-in")
            .style("stroke-width", function(d) {return Math.abs(d.weight) * 1.4; })
            .style("stroke", applyStrokeColor);

        link.enter().append("line")
            .attr("class", "link")
            .style("stroke-width", function(d) {return Math.abs(d.weight) * 1.4; })
            .style("stroke",applyStrokeColor)
            .style("stroke-opacity", 0.4);
        link.exit().remove();

        // add all loaded nodes to the graph
        node = svg.selectAll("circle").data(nodes);
        node.enter().append("circle")
            .attr("class", function(d){ return d.fCenter ? "force_center" : ""})
            .attr("r", function(d) {return 20 - (d.bias ? 10:0);})
            .style("fill", function(d) { return d.color ? d.color : layerColors[d.layer]; })
            .style("stroke", "white")
            .style("stroke-width", "2px")
            .call(force.drag);
        node.exit().remove();

        force.start();
    }

    // load the mlp network data
    function load(graph) {
        // clear graph
        reset()
        restart();

        extractLayerInformation(graph, false);
        extractLayoutInformation(graph.layers.length);
        restart();
    }

    // update the network data with given mlp
    function update(graph) {
        extractLayerInformation(graph, true);
        restart();
    }

    // extracts all nodes and links from the layer weights input
    // im not proud of this method, but it seems to work
    function extractLayerInformation(mlp, update) {
        var layerStartId = 0;
        var nodeCount = 0;
        // iterate over layer format and generate nodes and links
        for (var i = 0; i < mlp.layers.length; i++) {

            var layer = mlp.layers[i];
            var layerLength = mlp.layers.length;
            var numberOfBiasNeurons = 0;

            // extract basic nodes and links information for basic nodes
            if (i != 0 && i != layerLength-1) activeLayers.push(layer.numberOfNeurons);
            for (var j = 0; j < layer.numberOfNeurons; j++) {
                var node = update ? updateNode(nodeCount) : createNode(nodeCount, i, -700, false, (i==layerLength-1), j);
                nodeCount += 1;
                if (i != layerLength - 1) { // exclude last layer, since it has no weights
                    var numberOfBiasNeurons = mlp.layers[i+1].numberOfNeurons
                    var targetStartId = layerStartId + layer.numberOfNeurons + numberOfBiasNeurons
                    var neuron = layer.weights.data[j];
                    createLinks(node, neuron, targetStartId, update);
                }
            }
            // extract bias nodes and links
            if (i != layerLength - 1) { // exclude last layer, since bias weights are kept in i-1
                var bias = layer.weights.data[layer.numberOfNeurons];
                var targetStartId =  layerStartId + layer.numberOfNeurons + numberOfBiasNeurons;
                for (var k = 0; k < bias.length; k++) {
                    var node = update ? updateNode(nodeCount) : createNode(nodeCount, i+1, true, -50, (i+1==layerLength-1), k);
                    nodeCount += 1;
                    var targetId = targetStartId+k;
                    var link = update ? updateLink(node.id, targetId, bias[k]) : createLink(node.id, targetId, bias[k]);
                }
            }
            layerStartId += layer.numberOfNeurons + numberOfBiasNeurons;
        }
    }

    // create multiple links from weight matrix
    function createLinks(source, weights, targetStartId, update) {
        for (var k = 0; k < weights.length; k++) {
            var link = update ? updateLink(source.id, targetStartId + k, weights[k]) : createLink(source.id, targetStartId + k, weights[k]);
        }
    }
    function createNode(nodeId, layerNo, charge, bias, lastLayer, iInLayer) {
        var node = {
            "id": nodeId,
            "layer": layerNo,
            "bias": bias,
            "charge": charge,
        };

        // set special colors for ouput nodes
        if (lastLayer) { node.color = colorCodes[iInLayer];}
        nodes.push(node);
        return node;
    }
    function updateNode(nodeId) {
        return nodes[nodeId];
    }

    function createLink(sourceId, targetId, weight) {
        var link = {
            "source": sourceId,
            "target": targetId,
            "weight": weight,
        };
        links.push(link);
        return link;
    }
    function updateLink(sourceId, targetId, weight) {

        var link = $.grep(links, function(l){ return (l.source.id == sourceId) && (l.target.id == targetId); })[0];
        link.weight = weight;
        return link;
    }

    // information needed for graph posiitoning
    function extractLayoutInformation(numLayers) {
        for (var i=0; i<numLayers; i++) {
            var w = width/(numLayers+1);
            var h = height*0.5;
            var forceCenter = {layer: i, x: (i+1)*w, y: h, fixed: true, fCenter: true, charge: 0};
            forci.push(forceCenter);
            nodes.push(forceCenter);
        }
        linkDistance = width/numLayers*0.8;
    }

    // clears graph
    function reset() {
        nodes = [];
        links = [];
        forci = [];
        activeLayers = [];
    }

    function getActiveLayers() {
        return activeLayers;
    }

    return {
        init: function (selector) {
            return init(selector);
        },
        load: function (graph) {
            return load(graph);
        },
        update: function (graph) {
            return update(graph);
        },
        reset: function () {
            return reset();
        },
        getActiveLayers: function () {
            return getActiveLayers();
        }
    }
}
