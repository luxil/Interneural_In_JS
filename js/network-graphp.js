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
            var k = 1 * e.alpha;
            var l = 0.1 * e.alpha;
            nodes.forEach(function(o, i) {
                // console.log(o.id+ " "+ o.layer + " "+ o.x + " " + forci[o.layer].x + " " + (forci[o.layer].x - o.x) * k + " " + e.alpha);
                o.x += (forci[o.layer].x - o.x) * k;
                o.y += (forci[o.layer].y - o.y) * l;
            });

            // update nodes and links positioning after force influence
            node.attr("cx", function(d) { return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
                .attr("cy", function(d) { return d.y = Math.max(radius, Math.min(height - radius, d.y)); });

            link.attr("x1", function(d) { return d.source.x; })//nodes[d.id].x
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x })
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
            .style("stroke-width", function(d) {return Math.abs(d.weight) * 100; })
            .style("stroke", applyStrokeColor);

        link.enter().append("line")
            .attr("class", "link")
            .style("stroke-width", function(d) {return Math.abs(d.weight) * 15; })
            .style("stroke",applyStrokeColor)
            .style("stroke-opacity", 10);
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
    function load(data) {
        // clear graph
        reset()
        restart();

        extractLayerInformation(data, false);
        extractLayoutInformation(data.percLayers.length);
        restart();
    }

    // update the network data with given mlp
    function update(data) {
        console.log("update");
        extractLayerInformation(data, true);
        restart();
    }

    // extracts all nodes and links from the layer weights input
    // im not proud of this method, but it seems to work
    function extractLayerInformation(data, update) {
        var percLayers = data.percLayers;
        var numberOfNeurons = data.numberOfNeurons;
        var biasNodeId = numberOfNeurons;

        for (var lInt=0; lInt < percLayers.length; lInt++){
            if (lInt > 0 && lInt < percLayers.length-1) activeLayers.push(percLayers[lInt].size);

            for (var j = 0; j < percLayers[lInt].size; j++) {

                // extract basic nodes and links information for basic nodes
                update ? updateNode(percLayers[lInt].list[j].ID) : createNode(percLayers[lInt].list[j].ID, lInt, -700, false, lInt == percLayers.length-1, j);
                // exclude last layer, since it has no weights
                if (lInt != percLayers.length-1)    createLinks(percLayers[lInt].list[j].connections.projected, update);

                //extract bias nodes and links
                if(lInt != 0){
                    var node = update ? updateNode(biasNodeId) : createNode(biasNodeId, lInt, true, -50, lInt == percLayers.length-1, j);
                    var link = update ? updateLink(node.id, percLayers[lInt].list[j].ID, percLayers[lInt].list[j].bias) : createLink(node.id, percLayers[lInt].list[j].ID, percLayers[lInt].list[j].bias);
                    biasNodeId++;
                }
            }
        }
    }


    function createNode(nodeId, layerNo, charge, bias, lastLayer, iInLayer) {

        //console.log(nodes);
        var node = {
            "id": nodeId,
            "layer": layerNo,
            "bias": bias,
            "charge": charge
        };

        // set special colors for output nodes
        if (lastLayer) { node.color = colorCodes[iInLayer];}
        nodes[nodeId] = node;
        return node;
    }
    function updateNode(nodeId) {
        return nodes[nodeId];
    }


    /// create multiple links from weight matrix
    function createLinks(projected, update) {
        for (var prop in projected){
            var link = update ? updateLink(projected[prop].from.ID, projected[prop].to.ID, projected[prop].weight) : createLink(projected[prop].from.ID, projected[prop].to.ID, projected[prop].weight);
        }
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
