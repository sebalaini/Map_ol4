/*
 * In this module there is the drawing behaviour
 */

/**
 * drawing vector layers sources
 */

const Dsource = new ol.source.Vector()

const initDrawing = (mapView) => {
  /**
   * hide the drawing button
   * set the drawing area Id to 0
   * set the accsmap filter to false
   */

  $('.fmarkers').hide()

  let counter = true

  let areaId = 0

  /**
   * drawing layer
   * set the z-index of the layer to 6 to be sure that is on top of all the others one
   */

  const drawLayer = new ol.layer.Vector({
    source: Dsource,
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.2)'
      }),
      stroke: new ol.style.Stroke({
        color: '#328cc1',
        width: 4
      }),
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
          color: '#328cc1'
        })
      })
    })
  })

  drawLayer.setZIndex(6)

  /**
   * add the drawing layer to the map
   */

  mapView.addLayer(drawLayer)

  /**
   * drawing tools
   */

  /**
   * global so we can remove it later
   */

  let draw

  /**
   * button event listener
   * polygon
   * circle
   */

  $('#Polygon').on('click', function (e) {
    /**
     * prevent default behaviour
     * add interaction
     */

    e.preventDefault()

    addDraw('Polygon')
  })

  $('#Circle').on('click', function (e) {
    /**
     * prevent default behaviour
     * add interaction
     */

    e.preventDefault()

    addDraw('Circle')
  })

  /*
   * draw function
   */

  const addDraw = (Type) => {
    /**
     * set the draw interaction
     */

    draw = new ol.interaction.Draw({
      source: Dsource,
      type: Type
    })

    /**
     * we limit the number of area based on the type of traffweb
     */

    let limit = 3

    if (Dsource.getFeatures().length < limit) {
      /**
       * disable the buttons to prevent to launch more instances of the function
       */

      $('#drawing button').prop('disabled', true)
      $('#tlruler').prop('disabled', true)

      /**
       * add the draw interaction to the map
       */

      mapView.addInteraction(draw)

      /**
       * occurs just after you finish to draw the current element
       */

      drawLayer.on('change', () => {
        mapView.removeInteraction(draw)

        /**
         * enable the buttons
         */

        setTimeout(() => {
          $('#drawing button').prop('disabled', false)
          $('#tlruler').prop('disabled', false)
        }, 300)

        /**
         * we check if we are adding or removing markers
         */

        if (counter === true) {
          /**
           * we set immediately the counter to false and stop to run this function after it finish
           * apply the correct id to the last plotted marker
           */

          counter = false
          let ind = Dsource.getFeatures().length - 1
          Dsource.getFeatures()[ind].setId(areaId - 1)
        }

        /**
         * end drawLayer.on('change', () =>
         */
      })

      /**
       * occurs when you finish to draw the current element
       */

      draw.on('drawend', () => {
        counter = true
        drawing()
      })
    }
    /**
     * if the Dsource.getFeatures().length is > limit
     */

    else {
      /**
       * remove the mark interaction
       * display the max plotted filters message
       */

      mapView.removeInteraction(draw)

      $('.maxfilters').css('display', 'inline')
    }
    /**
     * end function addDraw (Type)
     */
  }

  /**
   * create the filter list
   */

  const drawing = () => {
    /**
     * set counter to true
     */

    counter = true

    /**
     * at this point the source is empty, so the first ID it will be 0
     * we add 1 to start from 1
     */

    let areaText = Dsource.getFeatures().length + 1

    /**
     * we add an option element to the select element
     */

    $('<option>', {
      'value': `Area_${areaId}`,
      'text': `Area ${areaText}`,
      'id': `Area_${areaId}`
    }).appendTo('#ftlfeature')

    /**
     * we select the current plotted area
     * we display the drawing buttons
     * we display main div that include select/buttons
     */

    $('#ftlfeature').val(`Area_${areaId}`)
    $('.fmarkers').show()
    $('.filter').css('display', 'block')

    /**
     * we increase the area ID plus 1
     */
    areaId += 1
  }

  /**
   * hide the drawing button if the drawing select element is empty
   */

  $(function () {
    $('#ftlfeature').change(function () {
      /**
       * display the drawing buttons if the tlfeature element is not empty
       */

      if ($('#ftlfeature').val() !== null) {
        $('.fmarkers').show()
      }
    })
  })

  /**
   * drawing buttons handler
   */

  /**
   * drawing location button
   */

  $('#fmarkloc').on('click', function (e) {
    /**
     * prevent default behaviour
     */

    e.preventDefault()

    /**
     * prevent error enabling the click just if the value of the option selected is not empty
     */

    if ($('#ftlfeature').val() !== null) {
      /**
       * get the select element
       * get the selected option
       */

      let sel = document.getElementById('ftlfeature')
      let selIds = sel[sel.selectedIndex].id.split('_')[1]

      /**
       * get the coordinates baesd on the type of geometry
       */

      let coord = ''

      if (Dsource.getFeatures()[0].getGeometry().getType() === 'Polygon') {
        coord = Dsource.getFeatureById(parseInt(selIds)).getGeometry().getFirstCoordinate()
      }
      else {
        coord = Dsource.getFeatureById(parseInt(selIds)).getGeometry().getCenter()
      }

      /**
       * center the map on the new coordinates
       */

      mapView.getView().centerOn([parseFloat(coord[0]), parseFloat(coord[1])], mapView.getSize(), [($('#map').innerWidth() / 2), ($('#map').innerHeight() / 2)])

      /**
       * end if ($('#ftlfeature').val() !== null)
       * end $('#fmarkloc').on('click', function (e)
       */
    }
  })

  /**
   * drawing drag button
   */

  $('#fmarkdrag').on('click', function (e) {
    /**
     * prevent default behaviour
     */

    e.preventDefault()

    /**
     * prevent error enabling the click just if the value of the option selected is not empty
     */

    if ($('#ftlfeature').val() !== null) {
      /**
       * disable the buttons to prevent to launch more instances of the function
       */

      $('#drawing button').prop('disabled', true)
      $('#tlruler').prop('disabled', true)

      /**
       * get the select element
       * get the current selected option
       */

      let sel = document.getElementById('ftlfeature')
      let ids = sel[sel.selectedIndex].id.split('_')[1]

      /**
       * set the drag interaction
       * add the interaction to the map
       */

      let fdragInteraction = new ol.interaction.Modify({
        features: new ol.Collection([Dsource.getFeatureById(parseInt(ids))]),
        style: null
      })

      mapView.addInteraction(fdragInteraction)

      /**
       * pointermove event listener
       */

      mapView.on('pointermove', function (evt) {
        if (evt.dragging) {
          return
        }

        /**
         * change the pointer style to match the drawing layer
         */

        let pixel = mapView.getEventPixel(evt.originalEvent)
        let hit = mapView.forEachLayerAtPixel(pixel, () => {
          return true
        }, null, (layer) => {
          return layer === drawLayer
        })
        mapView.getTargetElement().style.cursor = hit ? 'move' : ''
      })

      /**
       * modifyend event listener
       */

      fdragInteraction.on('modifyend', () => {
        /**
         * remove the interaction when the translate of the feature end
         */

        mapView.removeInteraction(fdragInteraction)

        /**
         * enable the buttons
         */

        setTimeout(() => {
          $('#drawing button').prop('disabled', false)
          $('#tlruler').prop('disabled', false)
        }, 300)
        /**
         * end fdragInteraction.on('modifyend', () =>
         */
      })

      /**
       * end if ($('#ftlfeature').val() !== null)
       * end $('#fmarkdrag').on('click', function (e)
       */
    }
  })

  /**
   * drawing delete button
   */

  $('#fmarkdel').on('click', function (e) {
    /**
     * prevent default behaviour
     * set counter to false
     */

    e.preventDefault()

    counter = false

    /**
     * prevent error enabling the click just if the value of the option selected is not empty
     */

    if ($('#ftlfeature').val() !== null) {
      /**
       * get the select element
       * get the id of the current selected option
       * remove the selected area
       */

      let sel = document.getElementById('ftlfeature')
      let ids = sel.value.split('_')[1]

      Dsource.removeFeature(Dsource.getFeatureById(ids))

      /**
       * we limit the number of area based on the type of traffweb
       */

      let limit = 3

      /**
       * if the limit is not reach hide the max filters message
       */

      if (Dsource.getFeatures().length < limit) {
        $('.maxfilters').css('display', 'none')
      }

      /**
       * remove the selected option and switch to the defaul option ''
       */

      $(`#Area_${ids}`).remove()
      $('#ftlfeature').val('')

      /**
       * hide the drawing div and the buttons
       */

      $('.fmarkers').hide()

      /**
       * get max length of the selected element
       */

      let maxlen = document.getElementById('ftlfeature').options.length

      /**
       * iterate through the options of the select element and change the text
       * we start from 1 to don't touch the default view or edit.. option
       */

      for (let i = 1; i < maxlen; i++) {
        document.getElementById('ftlfeature').options[i].innerHTML = `Area ${i}`
      }

      /**
       * check if the number of option is 1
       */

      if (maxlen === 1) {
        /**
         * if there is just the default option
         * hide the filter div
         */

        $('.filter').css('display', 'none')
      }
      /**
       * end if ($('#ftlfeature').val() !== null)
       * end $('#fmarkdel').on('click', function (e)
       */
    }
  })
  /**
   * end initDrawing() =>
   */
}

const getSource = () => {
  return Dsource
}

/**
 * EXPORT
 */

export default {
  initDrawing,
  getSource
}
