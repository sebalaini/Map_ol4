/**
 * import all the modules
 */

import height from './common/height'
import events from './common/events'
import map from './common/map'
import ruler from './common/ruler'
import marker from './common/marker'
import drawing from './common/drawing'

// import './scss/style.scss'

const init = () => {
  /**
   * Events listener
   */

  window.addEventListener('resize', () => {
    height.sizeContent()
  })

  height.sizeContent()
  events.initEvents()
  map.mapInit()
  ruler.initRuler(map.getMap())
  marker.initMarker(map.getMap())
  drawing.initDrawing(map.getMap())
}

/**
 * RUN THE APP
 */

init()
