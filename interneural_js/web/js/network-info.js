//global for network info
var networkInfo = makeNetworkInfo();
function makeNetworkInfo() {

  var trainedElement // element to store trained information in
  var samplesTrained;

  var weightChangeElement; // element to store mean weight change
  var weightChange;
  var weightChanges = [];
  var SAVED_WEIGHT_CHANGES = 100; // store up to this much weight changes
  var CHANGE_PRECISION = 5; // precision of weight changes

  var sampleCoverageElement; // element to store label coverage
  var sampleCoverage;

  var weightSparklineElement;


  // init by setting the root element
  function init(selector) {
    // set up elements
    element = $(selector);
    element.append(createHeader());

    // show total number of samples presented to the network
    trainedElement = createInfoText("samples total:");
    element.append(trainedElement);

    // how how many samples are classified correctly
    sampleCoverageElement = createInfoText("sample coverage:");
    element.append(sampleCoverageElement);

    // show the average weight change
    weightChangeElement = createInfoText("mean weight change:");
    element.append(weightChangeElement);

    // show weight change over time
    weightSparklineElement = createWeightSparkline();
    updateSparkline();
    element.append(weightSparklineElement);

    return true;
  }

  function createInfoText(text) {
    var info = $('<div/>');
    info.addClass("info-text");
    var textElement = $('<div/>');
    textElement.text(text);
    info.append(textElement);
    var value = $('<div/>');
    value.addClass('info-number');
    info.append(value);

    return info;
  }

  function createWeightSparkline() {
    var sparkline = $('<div/>');
    sparkline.addClass('weight-sparkline');
    for (var i=0; i<SAVED_WEIGHT_CHANGES; i++) {
      weightChanges.push(0);
    }
    return sparkline;
  }

  function createHeader() {
    var header = $('<button/>',
    {
      text: 'network info',
      click: function () {
        console.log('collapse?');
      }
    });
    header.addClass('header');
    return header;
  }

  function updateInfo(graph) {
    samplesTrained = graph.samplesTrained;
    fSamples = samplesTrained.toLocaleString('de-DE', {
      minimumIntegerDigits: 9
    });
    trainedElement.find('.info-number').text(fSamples);

    addToWeightChanges(graph.weightChange);
    fWeightChange = weightChange.toLocaleString('de-DE', {
      maximumFractionDigits: CHANGE_PRECISION
    });
    weightChangeElement.find('.info-number').text(fWeightChange);
    updateSparkline();

    sampleCoverage = graph.sampleCoverage;
    fSampleCoverage = sampleCoverage.toLocaleString('de-DE', {
      style: 'percent'
    });
    sampleCoverageElement.find('.info-number').text(fSampleCoverage);
  }

  function updateSparkline() {
    weightSparklineElement.sparkline(weightChanges,
       {composite: false,
        height: '1.5em',
       fillColor:false,
       lineColor:'black',
       tooltipPrefix: 'change: ',
       width: '250px'});
  }

  // saves the last weight changes
  function addToWeightChanges(delta) {
    weightChange = delta;
    if (weightChanges.length >= SAVED_WEIGHT_CHANGES) {
      weightChanges.shift();
    }
    var prec = Math.pow(10, CHANGE_PRECISION);
    var roundedWeight = Math.round(weightChange * prec) / prec;
    weightChanges.push(roundedWeight);
  }

  // expose public functions
  return {
    init: function (selector) {
      return init(selector);
    },
    updateInfo: function(graph) {
      return updateInfo(graph);
    }
  }
}
