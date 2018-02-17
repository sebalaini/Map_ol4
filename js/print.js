/**
 * Layers.
 */

 const projection = new ol.proj.Projection({
  code: 'EPSG:3857',
  getPointResolution: function(r) {
    return r;
  },
  units: 'm'
});

const mapLayer = new ol.layer.Tile({
  source: new ol.source.TileJSON({
    url: 'https://api.tiles.mapbox.com/v3/mapbox.natural-earth-hypso-bathy.json?secure',
    crossOrigin: 'anonymous'
  })
});

const mainWin = window.opener;
const mSource = mainWin.mSource;
const markLayer = mainWin.markLayer;

/**
 * Create the map.
 */

const map = new ol.Map({
  interactions: ol.interaction.defaults({ altShiftDragRotate: true, shiftDragZoom: true, mouseWheelZoom: false, pinchZoom: false }).extend([
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
      mapLayer
    ],

    target: 'map',
    view: new ol.View({
      projection: projection,
      center: [ 0, 0 ],
      zoom: 3,
      minZoom: 3,
      maxZoom: 8
    })

});
