/**
 * Popup variables.
 */

var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');
var skipCoordinatesPopup = false;

/**
 * Create an overlay to anchor the popup to the map.
 */

var overlay = new ol.Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250
  }
});

/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */

closer.onclick = function() {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};

/**
 * Layers.
 */

var mapLayer = new ol.layer.Tile({
  source: new ol.source.TileJSON({
    url: 'https://api.tiles.mapbox.com/v3/mapbox.natural-earth-hypso-bathy.json?secure',
    crossOrigin: 'anonymous'
  })
});

var rulerLayer = new ol.layer.Vector({
  source: new ol.source.Vector(),
  style: new ol.style.Style({
    fill: new ol.style.Fill({
    color: 'rgba(255, 255, 255, 0.2)'
  }),
  stroke: new ol.style.Stroke({
    color: 'rgba(0, 0, 0, 0.7)',
    width: 3
  }),
  image: new ol.style.Circle({
    radius: 7,
    fill: new ol.style.Fill({
      color: 'rgba(0, 0, 0, 0.7)'
    })
  })
  })
});

/**
 * Mouse coordinates.
 */

// this code has to stay before the creation of the map
var mousePositionControl = new ol.control.MousePosition({
  // the number pass as a parameter is the precision of the coordinates (the numbers before the comma, max 12 )
  coordinateFormat: ol.coordinate.createStringXY(1),
  // blank value when the mouse pointer is outside of the map
  undefinedHTML: '000000.0, 000000.0'
});

/**
 * Minimap.
 */

var overviewMapControl = new ol.control.OverviewMap({
  className: 'ol-overviewmap ol-custom-overviewmap',
/*  layers: [layers],
  view: new ol.View({
    projection: projection,
    extent: ext,
    resolution: ovresolutions[1],
    resolutions: ovresolutions
  }), */
  collapseLabel: '\u00BB',
  label: '\u00AB',
  collapsed: false
});

/**
 * Create the scale bar.
 */

var scaleLineControl = new ol.control.ScaleLine();

/**
 * Create the map.
 */

var map = new ol.Map({
  interactions: ol.interaction.defaults({altShiftDragRotate: true, shiftDragZoom: true, mouseWheelZoom: false, pinchZoom: false}).extend([
      //  drag for overview map
      new ol.interaction.DragRotateAndZoom(),
      // mobile function to force constrainResolution
      new ol.interaction.PinchZoom({
        // force zooming to a integer zoom
        constrainResolution: true
      }),
      new ol.interaction.MouseWheelZoom({
        constrainResolution: true
      })
    ]),

  controls: ol.control.defaults({
//  		attributionOptions: ({
  //			collapsible: false
  //		})
  }).extend([
      // add the actual scale in "m" and target a custom div
      new ol.control.ScaleLine({units: 'metric'}),
      // add the pointer coordinate on the screen
      mousePositionControl,
      // add a minimap preview
      overviewMapControl
  ]),

  layers: [
    mapLayer,
    rulerLayer
  ],

  overlays: [overlay],
  target: 'map',
  view: new ol.View({
    center: [0, 0],
    zoom: 3,
    minZoom: 3,
    maxZoom: 8
  })

});

/**
 * Add a click handler to the map to render the popup.
 */

map.on('singleclick', function(evt) {

  if (skipCoordinatesPopup) {
    return;
  }

  var coordinate = evt.coordinate;
  var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(
    coordinate, 'EPSG:3857', 'EPSG:4326'));

  content.innerHTML = '<p>You clicked here:</p><code>' + hdms +
    '</code>';
  overlay.setPosition(coordinate);
});

/**
* Ruler tool handler
*/

var sketch;
var helpTooltipElement;
var helpTooltip;
var measureTooltipElement;
var measureTooltip;
var continueLineMsg = 'Click to continue to measure or double click to stop.';
var typeSelect = "LineString"

var pointerMoveHandler = function(evt) {
  if (evt.dragging) {
    return;
  }
  var helpMsg = 'Click to start measuring';

  if (sketch) {
    var geom = (sketch.getGeometry());
    helpMsg = continueLineMsg;
  }

  helpTooltipElement.innerHTML = helpMsg;
  helpTooltip.setPosition(evt.coordinate);
  helpTooltipElement.classList.remove('hidden');
};

var formatLength = function(line) {
  var length = ol.Sphere.getLength(line);
  var output;

  if (length > 100) {
    output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km';
  } else {
    output = (Math.round(length * 100) / 100) + ' ' + 'm';
  }
  return output;
};

function addRuler() {
  var type = 'LineString';

  skipCoordinatesPopup = true;

  // add a selected class
  $("#ruler").addClass("ol-rulerSelect");

  ruler = new ol.interaction.Draw({
    source: rulerLayer.getSource(),
    type: type,
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.2)'
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(0, 0, 0, 0.5)',
        lineDash: [10, 10],
        width: 2
      }),
      image: new ol.style.Circle({
        radius: 5,
        stroke: new ol.style.Stroke({
          color: 'rgba(0, 0, 0, 0.7)'
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        })
      })
    })
  });

  map.on('pointermove', pointerMoveHandler);

  map.getViewport().addEventListener('mouseout', function() {
    helpTooltipElement.classList.add('hidden');
  });

  map.addInteraction(ruler);

  createMeasureTooltip();
  createHelpTooltip();

  var listener;

  ruler.on('drawstart', function(evt) {

    sketch = evt.feature;

    var tooltipCoord = evt.coordinate;

    listener = sketch.getGeometry().on('change', function(evt) {
    var geom = evt.target;
    var output;
    if (geom instanceof ol.geom.Polygon) {
      output = formatArea(geom);
      tooltipCoord = geom.getInteriorPoint().getCoordinates();
    } else if (geom instanceof ol.geom.LineString) {
      output = formatLength(geom);
      tooltipCoord = geom.getLastCoordinate();
    }
    measureTooltipElement.innerHTML = output;
    measureTooltip.setPosition(tooltipCoord);
    });
  }, this);

  ruler.on('drawend', function() {
      measureTooltipElement.className = 'tooltip tooltip-static';
      measureTooltip.setOffset([0, -7]);
      sketch = null;
      measureTooltipElement = null;
      createMeasureTooltip();
      ol.Observable.unByKey(listener);
    }, this);

} //end addRuler

/**
* Create tooltips.
*/

function createHelpTooltip() {
  helpTooltipElement = document.createElement('div');
  helpTooltipElement.className = 'tooltip hidden';
  helpTooltip = new ol.Overlay({
    element: helpTooltipElement,
    offset: [15, 0],
    positioning: 'center-left'
  });
  map.addOverlay(helpTooltip);
} // end createHelpTooltip


function createMeasureTooltip() {
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'tooltip tooltip-measure';
  measureTooltip = new ol.Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center'
  });
  map.addOverlay(measureTooltip);
} // end createMeasureTooltip

/**
* Remove ruler and related elements.
*/

function removeRuler() {
  map.removeInteraction(ruler);
  rulerLayer.getSource().clear(true);
  $(".tooltip ").remove();

  skipCoordinatesPopup = false;
  // remove the selected class
  $("#ruler").removeClass("ol-rulerSelect");
}

/**
* Ruler button event.
*/

$("#ruler").click(function() {

  // disable the buttons
  $("#Marker").prop('disabled', true);

  // hidden the popup
  overlay.setPosition(undefined);

  return (this.tog = !this.tog) ? addRuler() : removeRuler();
});



/*****************************************
MARKER TOOL HANDLER
*****************************************/

// global so we can remove it later
var mark;
var counter = "true";

function addMark(Type) {

  counter = "true";

  mark = new ol.interaction.Draw({
    source: Msource,
    type: Type
  });

  // limit the marker to 4
  if (Msource.getFeatures().length < 5) {

    // disable the buttons to prevent to launch more instances of the function
    $("#ruler").prop('disabled', true);

    skipCoordinatesPopup = true;
    map.addInteraction(mark);

    // occurs when you finish to draw the current element
    mark.on("drawend", function() {
      counter = "true";
      drawingMarker();

    });

    // occurs just after you finish to draw the current element
    markLayer.on("change", function() {
      map.removeInteraction(mark);

      setTimeout(function() {
        skipCoordinatesPopup = false;
      }, 1000);

      // re enable the buttons
      $("#ruler").prop('disabled', false);

      if (counter === "true") {
        counter = "false";
        var ind = Msource.getFeatures().length - 1;
        Msource.getFeatures()[ind].setId(MarkId - 1);
      }

    });

  } else {

    map.removeInteraction(mark);

    // show max marker message
    $(".maxmarkers").css("display", "inline");

  }

} // end addDraw
