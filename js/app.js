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

// marker var
var iterator = 0;
var mySource = ['./img/marker1.png', './img/marker2.png', './img/marker3.png', './img/marker4.png'];

function styleFn(f) {

  var retSytle;

  if (typeof(f.get('mysource')) !== 'undefined') {

    retSytle = new ol.style.Style({
      image: new ol.style.Icon({
        opacity: 0.95,
        src: f.get('mysource')
      })
    });

  } else {

    f.set('mysource', mySource[iterator]);

    retSytle = new ol.style.Style({
      image: new ol.style.Icon({
        src: mySource[iterator]
      })
    });

    // remove the plotted element from the array
    mySource.shift();

  }
  return [retSytle];
}

var mSource = new ol.source.Vector();

 var markLayer = new ol.layer.Vector({
   source: mSource,
   style: styleFn
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
      overviewMapControl,
       // Add a zoom slider.
      new ol.control.ZoomSlider(),
  ]),

  layers: [
    mapLayer,
    rulerLayer,
    markLayer
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
 * Style the mouse position div.
 */

$(".ol-mouse-position").addClass("ol-control");

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
  $(".ol-tools button").prop('disabled', false);
  $(".ol-Marker button").prop('disabled', false);
}

/**
* Ruler button event.
*/

$("#ruler").click(function() {

  // disable the buttons
  $(".ol-tools button").prop('disabled', true);
  $(".ol-Marker button").prop('disabled', true);
  $("#ruler").prop('disabled', false);

  // hidden the popup
  overlay.setPosition(undefined);

  return (this.tog = !this.tog) ? addRuler() : removeRuler();
});

/**
* Marker tools Handler.
*/

var mark;
var counter = "true";

function addMark(Type) {

  counter = true;

  mark = new ol.interaction.Draw({
    source: mSource,
    type: Type
  });

  // limit the marker to 4
  if (mSource.getFeatures().length < 4) {

    // disable the buttons to prevent to launch more instances of the function
  $(".ol-tools button").prop('disabled', true);
  $(".ol-Marker button").prop('disabled', true);

    skipCoordinatesPopup = true;
    map.addInteraction(mark);

    // occurs when you finish to draw the current element
    mark.on("drawend", function() {
      counter = true;
      drawingMarker();

    });

    // occurs just after you finish to draw the current element
    markLayer.on("change", function() {
      map.removeInteraction(mark);

      setTimeout(function() {
        skipCoordinatesPopup = false;
      }, 1000);

      // re enable the buttons
      $(".ol-tools button").prop('disabled', false);
      $(".ol-Marker button").prop('disabled', false);

      if (counter === true) {
        counter = false;
        var ind = mSource.getFeatures().length - 1;
        mSource.getFeatures()[ind].setId(MarkId - 1);
      }
    });

  } else {

    map.removeInteraction(mark);
    // show max marker message
    $(".maxmarkers").css("display", "inline");
  }

} // end addDraw

/**
* Create a select element.
*/

var MarkId = 0;

function drawingMarker() {

  counter = true;
  // at this point in the source there is still nothing, so the first ID it will be 0
  var markText = mSource.getFeatures().length + 1;
  // the ID it's not related with the text
  MarkId += 1;

  $('<option>', { 'value': (MarkId -1), 'text': 'Marker ' +(markText) }).attr('id', MarkId - 1).appendTo('.plotMarkers');

} // end drawing

/**
* Marker button event.
*/

$("#marker").click(function(e) {
  e.preventDefault();

  addMark("Point");
  // hidden the popup
  overlay.setPosition(undefined);
});

/**
* Delete button event.
*/

$("#mDel").on("click", function(e) {

  e.preventDefault();

  // hidden the popup
  overlay.setPosition(undefined);
  counter = "false";

  // prevent error enabling the click just if the value of the option selected is not empty
  if ($('#plotMarkers').val() !== null) {

    // get the ID od the selected element
    var s = document.getElementById('plotMarkers');

    //add the properties to the main array
    mySource.unshift(mSource.getFeatureById(s.value).getProperties().mysource);

    // remove the feature connected to that ID
    mSource.removeFeature(mSource.getFeatureById(s.value));

    // remove selcted option and switch to the defaul option
    $("#" + s[s.selectedIndex].id).remove();
    $('#plotMarkers').val('');

    // get max length of the selected element
    var maxlen = document.getElementById("plotMarkers").options.length;

    // iterate through the options of the list and change the TEXT
    for (i = 1; i < maxlen; i++) {
      document.getElementById("plotMarkers").options[i].innerHTML = "Marker " + i;
    }

    if (mSource.getFeatures().length < 4) {
      $(".maxmarkers").css("display", "none");
    }

  } // end if != null

}); // end #markdel click

/**
* Locate button event.
*/

$("#mLoc").click(function(e) {

  e.preventDefault();

  // hidden the popup
  overlay.setPosition(undefined);

  // prevent error enabling the click just if the value of the option selected is not empty
  if ($('#plotMarkers').val() !== null) {

    var sel = document.getElementById('plotMarkers');
    // get ID of the current marker
    var selIds = sel[sel.selectedIndex].id;

    var coord = mSource.getFeatureById(parseInt(selIds)).getGeometry().getCoordinates();

    // center the map on the new coordinates
    map.getView().centerOn( [parseFloat(coord[0]), parseFloat(coord[1])], map.getSize(),  [($("#map").innerWidth()/2), ($("#map").innerHeight()/2)]);
  }

}); // end #mLoc click


/**
* Drag button event.
*/

$("#mDrag").click(function(e) {

  e.preventDefault();

  // hidden the popup
  overlay.setPosition(undefined);

  map.removeInteraction(mark);

  // prevent error enabling the click just if the value of the option selected is not empty
  if ($('#plotMarkers').val() !== null) {

    skipCoordinatesPopup = true;

    // disable the buttons to prevent to launch more instances of the function
    $(".ol-tools button").prop('disabled', true);

    var sel = document.getElementById('plotMarkers');
    // get ID of the current marker
    var ids = sel[sel.selectedIndex].id;

    //var pointFeature = new ol.Feature(new ol.geom.Point([0, 0]));
    var dragInteraction = new ol.interaction.Modify({
        features: new ol.Collection([mSource.getFeatureById(parseInt(ids))]),
        style: null
    });

    map.addInteraction(dragInteraction);

    map.on('pointermove', function(evt) {

      if (evt.dragging) {
        return;
      }

      var pixel = map.getEventPixel(evt.originalEvent);
      var hit = map.forEachLayerAtPixel(pixel, function() { return true; }, null, function(layer) { return layer === markLayer; });
      map.getTargetElement().style.cursor = hit ? 'pointer' : '';
    });

    // remove the interaction when the translate of the feature end
    dragInteraction.on("modifyend", function() {

      map.removeInteraction(dragInteraction);

      // disable the buttons to prevent to launch more instances of the function
      $("#Marker").prop('disabled', false);
      $("#tlruler").prop('disabled', false);

      setTimeout(function() {
        skipCoordinatesPopup = false;
      }, 1000);

      map.on('pointermove', function(evt) {
        if (evt.dragging) {
          return;
        }
        var pixel = map.getEventPixel(evt.originalEvent);
        var hit = map.forEachLayerAtPixel(pixel, function() { return true; }, null, function(layer) { return layer === markLayer; });
        map.getTargetElement().style.cursor = hit ? 'default' : '';
      });

    }); // end dragInteraction.on
  }

}); // end #markdrag click


$("#print").click(function() {
  window.open("https://sebalaini.github.io/Map_ol4/print/print.html");
});
