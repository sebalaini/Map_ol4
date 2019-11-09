/**
 * import all the modules
 */

// import functions from './common/functions'

import height from './common/height'
import events from './common/events'
// import overlay from './common/overlay'
// import map from './common/map'
// import layers from './parkmap/pmlayers'
// import legend from './parkmap/pmlegend'
// import ruler from './common/ruler'
// import marker from './common/marker'
// import drawing from './common/drawing'
// import popup from './parkmap/pmpopup'
// import print from './common/print'

// import './css/style.css'
import './css/custom.css'

const init = () => {
//   /**
//    * Events listener
//    */

  // use the previous functions on the load event
  document.addEventListener('DOMContentLoaded', () => {
    height.sizeContent()
  })

  // use the previous functions on the window resize event
  window.addEventListener('resize', () => {
    height.sizeContent()
    // print.setModalSize()
  })

  events.initEvents()
  /**
   * initialize Traffweb
   */

  // functions.init()
//     // initialize the map
//     .then(() => map.mapInit(functions.getFixedSettings()))
//     // check for cookie
//     .then(() => cookies.checkCookie(map.getMap(), functions.getFixedSettings()))
//     // initialize the layer
//     .then(() => layers.initPmLayer(functions.getFixedSettings(), functions.getTwSettings()))
//     // add the layer
//     .then(() => layers.addlayer())
//     // initialize the legend
//     .then(() => legend.initLegend())
//     // initialize the search
//     .then(() => search.search(map.getMap(), functions.getFixedSettings(), overlay.overlay))
//     // initialize the events
//     .then(() => events.initEvents(map.getMap(), overlay.overlay))
//     // initialize the ruler layers
//     .then(() => ruler.initRuler(map.getMap(), overlay.overlay))
//     // initialize the marker layers
//     .then(() => marker.initMarker(map.getMap(), overlay.overlay, layers.pmlayer()))
//     // initialize the drawing layers
//     .then(() => drawing.initDrawing(map.getMap(), functions.getFixedSettings(), overlay.overlay, layers.pmlayer()))
//     // initialize the popup
//     .then(() => popup.infoPopup(functions.getFixedSettings(), functions.getTwSettings(), map.getMap(), layers.pmlayer(), overlay.overlay))
//     // initialize print
//     .then(() => print.initPrint(functions.getFixedSettings(), map.getMap(), layers.sQLayer()))
}

/**
 * RUN THE APP
 */

init()
