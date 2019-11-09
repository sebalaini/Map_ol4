/**
 * global var to reuse for export
 */

let map

/**
 * openlayers mapInit
 */

const mapInit = () => {
  /**
   * background mapping
   */

  let mapLayer = new ol.layer.Tile({
    source: new ol.source.OSM()
  })

  /**
   * Create the map.
   */

  map = new ol.Map({
    interactions: ol.interaction.defaults({
      altShiftDragRotate: true,
      shiftDragZoom: true,
      mouseWheelZoom: false,
      pinchZoom: false
    }).extend([
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
      center: [0, 0],
      zoom: 3,
      minZoom: 3,
      maxZoom: 12
    })
  })
  map.updateSize()
}

/**
 * export the map
 */

const getMap = () => map

/**
 * EXPORT
 */

export default {
  mapInit,
  getMap,
}
