/*
 * In this module there is the Ruler behaviour
 */

const initRuler = (mapView, overlay) => {
  /**
   * ruler vector layer sources
   */

  let Rsource = new ol.source.Vector()

  /**
   * ruler layer
   * set the z-index of the layer to 7 to be sure that is on top of all the others one
   */

  let rulerLayer = new ol.layer.Vector({
    source: Rsource,
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(0, 0, 0, 0.7)'
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
  })

  rulerLayer.setZIndex(7)

  /**
   * add the ruler layer to the map
   */

  mapView.addLayer(rulerLayer)

  /**
   * ruler tool handler
   */

  /**
   * click event listener on the button
   */

  $('#tlruler').on('click', () => {
    /**
     * disable the drawing buttons
     * hide the popup
     */
    $('#drawing button').prop('disabled', true)

    overlay.setPosition(undefined)

    /**
     * add remove ruler interaction on button click
     */

    if ($('#tlruler').hasClass('removeRuler')) {
      removeRuler()
      $('#tlruler').removeClass('removeRuler')
    }
    else {
      addRuler()
      $('#tlruler').addClass('removeRuler')
    }
    // old hack
    // return (this.x = !this.x) ? addRuler() : removeRuler()
  })

  /**
   * remove interaction and ruler element
   */

  const removeRuler = () => {
    /**
     * remove the ruler interaction
     * clean the ruler source
     */

    mapView.removeInteraction(ruler)
    rulerLayer.getSource().clear(true)

    /**
     * remove the tooltip parent
     * remove the select class to the ruler button
     */

    $('.tooltip').parent().remove()
    $('#tlruler').removeClass('custbtnsel')

    /**
     * enable the drawing buttons
     */

    $('#drawing button').prop('disabled', false)
  }

  /**
   * these ruler var are needed to create the ruler tooltip and the ruler interaction
   */

  let sketch
  let helpTooltipElement
  let helpTooltip
  let measureTooltipElement
  let measureTooltip
  let ruler

  /**
   * cursor pointer handler
   */

  const pointerMoveHandler = (evt) => {
    /**
     * if the mouse is dragging the map return
     */

    if (evt.dragging) {
      return
    }

    /**
     * default message to display
     */

    let helpMsg = 'Click to start drawing'

    /**
     * check the message if you are measuring
     */

    if (sketch) {
      helpMsg = 'Click to continue drawing the line or double click to stop.'
    }

    /**
     * attach to the tooltip the correct message
     * set the position near the mouse cursor
     * display the tooltip
     */

    helpTooltipElement.innerHTML = helpMsg
    helpTooltip.setPosition(evt.coordinate)
    helpTooltipElement.classList.remove('hidden')
  }

  /**
   * display the actual measured length
   */

  const formatLength = (line) => {
    const length = ol.Sphere.getLength(line)
    let output

    if (length > 100) {
      output = `${Math.round(length / 1000 * 100) / 100} km`
    }
    else {
      output = `${Math.round(length * 100) / 100} m`
    }
    return output
  }

  /**
   * create a new tooltip
   */

  const createHelpTooltip = () => {
    helpTooltipElement = document.createElement('div')
    helpTooltipElement.className = 'tooltip hidden'
    helpTooltip = new ol.Overlay({
      element: helpTooltipElement,
      offset: [15, 0],
      positioning: 'center-left'
    })
    mapView.addOverlay(helpTooltip)
  }

  /**
   * Creates a new measure tooltip
   */

  const createMeasureTooltip = () => {
    measureTooltipElement = document.createElement('div')
    measureTooltipElement.className = 'tooltip tooltip-measure'
    measureTooltip = new ol.Overlay({
      element: measureTooltipElement,
      offset: [0, -15],
      positioning: 'bottom-center'
    })
    mapView.addOverlay(measureTooltip)
  }

  /**
   * add the ruler when you click on the button
   */

  const addRuler = () => {
    /**
     * add a selected class to the ruler button to make it visible that it's in use
     */

    $('#tlruler').addClass('custbtnsel')

    /**
     * styling ruler
     */

    ruler = new ol.interaction.Draw({
      source: Rsource,
      type: 'LineString',
      style: new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'rgba(0, 0, 0, 0.5)',
          lineDash: [10, 10],
          width: 2
        }),
        image: new ol.style.Circle({
          radius: 5,
          stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 0, 0.7)'
          })
        })
      })
    })

    /**
     * call the pointerMoveHandler to create the element on the screen when the ruler it's in use
     */

    mapView.on('pointermove', pointerMoveHandler)

    /**
     * mouseout event listener to hide the popup
     */

    mapView.getViewport().addEventListener('mouseout', () => {
      helpTooltipElement.classList.add('hidden')
    })

    /**
     * add the ruler interaction to the map
     */

    mapView.addInteraction(ruler)

    /**
     * create the tooltip
     */

    createMeasureTooltip()
    createHelpTooltip()

    let listener

    /**
     * drawstart event
     */

    ruler.on('drawstart', function (evt) {
      /**
       * set sketch
       * tooltip coordinate
       */

      sketch = evt.feature

      let tooltipCoord = evt.coordinate

      /**
       * sketch event listener on change
       * called during a mouse move
       */

      listener = sketch.getGeometry().on('change', function (evt) {
        let geom = evt.target

        /**
         * as we don't use polygon we check justfor line
         * get last position of the cursor and the length
         */

        let output

        if (geom instanceof ol.geom.LineString) {
          output = formatLength(geom)
          tooltipCoord = geom.getLastCoordinate()
        }

        /**
         * append to the tooltip the measure
         * set the position of the tooltip to the last cursor coord
         */

        measureTooltipElement.innerHTML = output
        measureTooltip.setPosition(tooltipCoord)
      })
    }, this)

    /**
     * drawend event
     */

    ruler.on('drawend', () => {
      /**
       * create the static tooltip with the last measure
       */

      measureTooltipElement.className = 'tooltip tooltip-static'
      measureTooltip.setOffset([0, -7])

      /**
       * set sketch and the tooltip element to null
       * so that a new one tooltip can be created
       */

      sketch = null
      measureTooltipElement = null
      createMeasureTooltip()
      ol.Observable.unByKey(listener)
    }, this)

    /**
     * end addRuler function
     */
  }
  /**
   * end initRuler() =>
   */
}

/**
 * EXPORT
 */

export default {
  initRuler
}
