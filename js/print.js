
/**
* Marker layer.
*/

var mainWin = window.opener;
var mSource = mainWin.mSource;
var markLayer = mainWin.markLayer;

/**
* Map layer.
*/


var mapLayer = new ol.layer.Tile({
  source: new ol.source.TileJSON({
    url: 'https://api.tiles.mapbox.com/v3/mapbox.natural-earth-hypso-bathy.json?secure',
    crossOrigin: 'anonymous'
  })
});

/**
* Map.
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
/*
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
*/
  layers: [
    mapLayer
//    markLayer
  ]

});





/**************************************
DRAG MARKER DIV
**************************************/
/*
$(function() {
var dragging = false;
var iX;
var iY;
var mdiv;

	$("#map").on("mousedown", ".marker", function(e) {
		dragging = true;
		mdiv = $(this);
		iX = e.clientX - this.offsetLeft;
		iY = e.clientY - this.offsetTop;
		this.setCapture && this.setCapture();
		return false;
	});
	document.onmousemove = function(e) {
		if (dragging) {
			var e = e || window.event;
			var oX = e.clientX - iX;
			var oY = e.clientY - iY;
			$("#" + mdiv.attr('id')).css({"left": oX + "px", "top": oY + "px"});
			return false;
		}
	};
	$(document).mouseup(function(e) {
		dragging = false;
//		$(".marker")[0].releaseCapture();
		e.cancelBubble = true;
	});
});
*/
