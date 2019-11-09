/**
 * in this module there is the overlay,
 * is used on the map to create the popup
 */

const container = document.getElementById('popup')

let overlay = new ol.Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250
  }
})

/**
 * EXPORT
 */

export default {
  overlay
}
