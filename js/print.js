
/**
 * Layers.
 */

var mapLayer = new ol.layer.Tile({
  source: new ol.source.TileJSON({
    url: 'https://api.tiles.mapbox.com/v3/mapbox.natural-earth-hypso-bathy.json?secure',
    crossOrigin: 'anonymous'
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

  layers: [
    mapLayer,
    markLayer
  ],

  target: 'map',
  view: new ol.View({
    center: [0, 0],
    zoom: 3,
    minZoom: 3,
    maxZoom: 8
  })

});
