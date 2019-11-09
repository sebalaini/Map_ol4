/**
 * in this module you can find all the code related with OpenLayer 4, layers, maps and getSettings
 */

/**
 * import modules
 */

import functions from './functions'
import overlay from './overlay'

/**
 * global var to reuse for export
 */

let map
const resolutions = []

/**
 * openlayers mapInit
 */

const mapInit = (getFixed) => {
  /**
   * get the settings from the functions module
   */

  let fixed = getFixed

  /**
   * get the resolutions from the scales
   */

  // temp scale array
  const scaleArray = []
  // scales array from fixed.json
  const scales = fixed.scales.split(',')
  // create a temporary array of scales in number
  functions.getScale(scales, scaleArray)
  // create the final resolutions array
  functions.setResolution(scaleArray, resolutions)

  // center of the map when session storage position is not set
  const setPos = fixed.defpos.split(',')

  // extent of the visible map
  const setExt = fixed.bounds.split(',')
  const ext = [parseInt(setExt[0]), parseInt(setExt[1]), parseInt(setExt[2]), parseInt(setExt[3])]

  /**
   * PROJECTION
   */

  const projection = new ol.proj.Projection({
    code: 'EPSG:27700',
    getPointResolution: (r) => {
      return r
    },
    units: 'm'
  })

  /**
   * map layers
   */

  /**
   * mapcache layer
   */

  const cachelayer = new ol.layer.Tile({
    // this extent limit the visible map
    extent: ext,
    // Load low-resolution tiles up to preload levels. By default preload is 0, which means no preloading
    preload: Infinity,
    source: new ol.source.TileWMS({
      url: 'https://www.buchananmapping.co.uk/mapcache/?',
      params: {
        'LAYERS': fixed.cachelayer,
        'TILED': true
      },
      ratio: 1,
      projection: 'EPSG:27700',
      tileGrid: new ol.tilegrid.TileGrid({
        resolutions: resolutions,
        extent: ext,
        tileSize: [128, 128]
      })
    // resolutions doesn't work in the layer, has to stay in the view
    })
  })

  /**
   * copyright layer
   */

  const copylayer = new ol.layer.Tile({
    // this extent limit the visible map
    extent: ext,
    // Load low-resolution tiles up to preload levels. By default preload is 0, which means no preloading
    preload: Infinity,
    source: new ol.source.TileWMS({
      url: 'https://www.buchananmapping.co.uk/cgi-bin/wms_bccopy?&amp;service=WMS',
      params: {
        'LAYERS': 'copyright',
        'TILED': true
      },
      ratio: 1,
      gutter: 40,
      projection: 'EPSG:27700',
      tileGrid: new ol.tilegrid.TileGrid({
        resolutions: resolutions,
        extent: ext,
        tileSize: [280, 280]
      })
    // resolutions doesn't work in the layer, has to stay in the view
    })
  })

  /**
   * mastermap layer
   */

  const maplayer = new ol.layer.Tile({
    // this extent limit the visible map
    extent: ext,
    // Load low-resolution tiles up to preload levels. By default preload is 0, which means no preloading
    preload: Infinity,
    source: new ol.source.TileWMS({
      url: fixed.wmsmap,
      params: {
        // the layers is a random layer in the map that we need to call in order to load the map
        'LAYERS': fixed.wmslayer,
        'TILED': true
      },
      ratio: 1,
      projection: 'EPSG:27700',
      tileGrid: new ol.tilegrid.TileGrid({
        resolutions: resolutions,
        extent: ext,
        tileSize: [128, 128]
      })
    // resolutions doesn't work in the layer, has to stay in the view
    })
  })

  /**
   * overview map layer
   */

  const ovlayers = new ol.layer.Tile({
    source: new ol.source.TileWMS({
      url: fixed.ovmap,
      params: {
        'LAYERS': fixed.ovlayer,
        'TILED': true
      },
      ratio: 1,
      projection: 'EPSG:27700'
    // resolutions doesn't work in the layer, has to stay in the view
    })
  })

  /**
   * mouse coordinate on the screen
   */

  // this code has to stay before the creation of the map
  const mousePositionControl = new ol.control.MousePosition({
    // the number pass as a parameter is the precision of the coordinates (the numbers before the comma, max 12 )
    coordinateFormat: ol.coordinate.createStringXY(1),
    projection: projection,
    // custom target
    target: document.getElementById('mapcoords'),
    // blank value when the mouse pointer is outside of the map
    undefinedHTML: '000000.0, 000000.0'
  })

  /**
   * overview map creation
   */

  const zoomLv = parseInt(fixed.defpos.split(',')[2])

  let overviewMapControl = new ol.control.OverviewMap({
    className: 'ol-overviewmap ol-custom-overviewmap',
    layers: [ovlayers],
    view: new ol.View({
      projection: projection
    }),
    collapseLabel: '\u00BB',
    label: '\u00AB',
    collapsed: false,
    // custom target
    target: document.getElementById('ovmap')
  })

  /**
   * map view
   */

  const view = new ol.View({
    projection: projection,
    center: [parseInt(setPos[0]), parseInt(setPos[1])],
    // this extent limit the max accessible area, but it's not the same as the layer extent, is bigger
    extent: ext,
    resolution: resolutions[zoomLv],
    resolutions: resolutions
  })

  map = new ol.Map({
    interactions: ol.interaction.defaults({
      altShiftDragRotate: false,
      shiftDragZoom: false,
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
      // mouseWheel function to force constrainResolution
      new ol.interaction.MouseWheelZoom({
        constrainResolution: true
      })
    ]),

    /**
     * add controls to the map view
     */

    controls: ol.control.defaults({
      attributionOptions: ({
        collapsible: false
      })
    }).extend([
      // add the actual scale in "m" and target a custom div
      new ol.control.ScaleLine({
        units: 'metric',
        target: document.getElementById('scale_line')
      }),
      // add the pointer coordinate on the screen
      mousePositionControl,
      // add a minimap preview
      overviewMapControl
    ]),

    // this option it doesn't work at the moment, maybe need HTTP/2
    // maxTilesLoading: 30,

    /**
     * add layers to the map view
     */

    layers: [cachelayer, maplayer, copylayer],
    overlays: [overlay.overlay],
    target: 'map',
    view: view

  }) // end new ol.Map

  /**
   * update the size of the map as we resize the container on load and resize
   */

  map.updateSize()

  /**
   * check if it's a fra or psa website
   * hide some openlayers elements like:
   *  - scale line
   *  - mouse position
   *  - overview map
   * this is because we use a common map module with those elements
   */

  if (fixed.app === 'fra' || fixed.app === 'psa') {
    $('.ol-scale-line').remove()
    $('.ol-mouse-position').remove()
    $('.ol-overviewmap').remove()
  }

  /**
   * set the visibility of the cachelayers based on zoom level and client specific
   */

  map.on('moveend', () => {
    /**
     * check it's a parkmap traffweb
     */

    if (fixed.app === 'parkmap') {
      /**
       * barnet use a custom road map on the first couple of levels so there is no cache map
       */

      if (window.location.href.indexOf('barnet') > -1) {
        if (map.getView().getResolution() > 0.8 && map.getView().getResolution() < 6.5) {
          cachelayer.setVisible(true)
        }
        else {
          cachelayer.setVisible(false)
        }
      }

      /**
       * cambridge use austin map instead of bcmapping
       */

      else if (window.location.href.indexOf('cambridge') > -1) {
        cachelayer.setVisible(false)
      }

      /**
       * everyone else
       */

      else {
        if (map.getView().getResolution() > 0.8) {
          cachelayer.setVisible(true)
        }
        else {
          cachelayer.setVisible(false)
        }
      }
    }

    /**
     * check it's a parkmap traffweb
     */

    else if (fixed.app === 'accsmap' || fixed.app === 'accsmap_plus') {
      // getAccTab()

      if (window.location.href.indexOf('devon') !== -1 || window.location.href.indexOf('traffwebdemo') !== -1 || window.location.href.indexOf('traffwebdev') !== -1 || window.location.href.indexOf('localhost') !== -1) {
        if (map.getView().getResolution() > 0.8) {
          cachelayer.setVisible(true)
        }
        else {
          cachelayer.setVisible(false)
        }
      }
      else {
        cachelayer.setVisible(true)
      }
    }

    /**
     * all other apps
     */

    else {
      if (map.getView().getResolution() > 0.8) {
        cachelayer.setVisible(true)
      }
      else {
        cachelayer.setVisible(false)
      }
    }

  /**
   * end map.on('moveend', () => {
   */
  })

  /**
   * end map init
   */
}

/**
 * export:
 *  - map
 *  - resolutions array
 */

const getMap = () => map

const getResolution = () => resolutions

/**
 * EXPORT
 */

export default {
  mapInit,
  getMap,
  getResolution,
}
