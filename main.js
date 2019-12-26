require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/GraphicsLayer",
  "esri/Graphic",
  "esri/geometry/Point",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/SimpleFillSymbol",
  "esri/tasks/Geoprocessor",
  "esri/tasks/support/FeatureSet",
  "dojox/widget/Standby",
  "esri/geometry/Polyline",
  "dojo/dom-construct",
  "dojo/domReady!"
], function(
  Map,
  SceneView,
  GraphicsLayer,
  Graphic,
  Point,
  SimpleMarkerSymbol,
  SimpleLineSymbol,
  SimpleFillSymbol,
  Geoprocessor,
  FeatureSet,
  Standby,
  Polyline,
  domConstruct
) {
  // API service endpoint
  var gpService =
    "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_Currents_World/GPServer/MessageInABottle";

  // HTML user input textbox element
  var drift = document.getElementById("drift");

  // Create map & assign basemap style
  var map = new Map({
    basemap: "streets-night-vector",
    ground: "world-elevation"
  });

  // Create view for SceneView
  var view = new SceneView({
    container: "viewDiv",
    map: map,
    center: [-40, 20],
    zoom: 5
  });

  // Create Standby Spinner
  var standby = new Standby({
    target: "viewDiv",
    color: null
  });

  // Spin up standby widget
  document.body.appendChild(standby.domNode);
  standby.startup();

  // Create Graphics Layer
  var driftLayer = new GraphicsLayer();
  map.add(driftLayer);

  // Create Point Marker Symbol
  var markerSym = new SimpleMarkerSymbol({
    color: "#9ACD32"
  });

  // Create Line Symbol
  var driftLine = new SimpleLineSymbol({
    color: "#9ACD32",
    width: 2
  });

  // Instantiate Service
  var gp = new Geoprocessor({
    url: gpService
  });

  // On Click action instantiated/defined
  view.on("click", driftTime);

  function driftTime(evt) {
    standby.show();
    driftLayer.removeAll();

    // Create new point graphic where user clicks map
    var pt = new Point({
      longitude: evt.mapPoint.longitude,
      latitude: evt.mapPoint.latitude
    });

    var ptGraphic = new Graphic({
      geometry: pt,
      symbol: markerSym
    });

    driftLayer.add(ptGraphic);

    // Create empty feature set to hold response
    var featureSet = new FeatureSet();
    featureSet.features = [ptGraphic];

    // Input parameters, and user-entered value, for GP Service
    var params = {
      Input_Point: featureSet,
      Days: parseFloat(drift.value)
    };
    gp.execute(params).then(drawLine);
  }

  // Draw polyline of drift from GP response
  function drawLine(gpResponse) {
    var driftPoly = gpResponse.results[0].value.features;

    var driftGraphics = driftPoly.map(function(line) {
      line.symbol = driftLine;
      return line;
    });

    driftLayer.addMany(driftGraphics);

    // Zoom to drift line
    view.goTo({
      target: driftGraphics
    });

    // Hide Standby Spinner
    standby.hide();
  }
});
