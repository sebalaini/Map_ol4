/*
 * In this module there is the marker behaviour
 */
/**
 * marker vector layer sources
 */

const Msource = new ol.source.Vector()

const initMarker = (mapView, overlay, getLayer) => {
  /**
   * hide the markers button
   * set the marker ID to 0
   */

  $('.markerdiv').hide()

  let MarkId = 0

  /**
   * marker variable for the symbols
   */

  const myColors = ['rgba(255,255,255,0.1)']
  const mySource = ['/symbols/marker1.png', '/symbols/marker2.png', '/symbols/marker3.png', '/symbols/marker4.png', '/symbols/marker5.png']

  /**
   * add the correct symbols and prevent duplicates
   */

  let iterator = 0

  const styleFn = (symbol) => {
    let retSytle

    /**
     * get the current style if is already setup
     */

    if (typeof (symbol.get('styledwithcolor')) !== 'undefined') {
      retSytle = new ol.style.Style({
        image: new ol.style.Icon({
          // opacity: 0.95,
          src: symbol.get('mysource'),
          color: symbol.get('styledwithcolor')
        })
      })
    }
    /**
     * else set the new style
     */

    else {
      symbol.set('styledwithcolor', myColors[iterator])
      symbol.set('mysource', mySource[iterator])

      retSytle = new ol.style.Style({
        image: new ol.style.Icon({
          src: mySource[iterator],
          color: myColors[iterator]
        })
      })
      /**
       * removing the last symbols prevent to add duplicates
       */

      mySource.shift()
    }
    return [retSytle]
  }

  /**
   * marker layer
   * set the z-index of the layer to 6 to be sure that is on top of all the others one
   */

  const markLayer = new ol.layer.Vector({
    source: Msource,
    style: styleFn
  })

  markLayer.setZIndex(6)

  /**
   * add the markLayer layer to the map
   */

  mapView.addLayer(markLayer)

  /**
   * hide the drawing button
   */

  $('.fmarkers').hide()

  /**
   * marker tool handler
   */

  /**
   * marker click event
   */

  $('#Marker').on('click', function (e) {
    /**
     * prevent default behaviour
     * add the mark interaction to the map
     * hide the popup
     */

    e.preventDefault()

    addMark('Point')

    overlay.setPosition(undefined)
  })

  /**
   * we override the style of the button to bypass the rules that enter in conflict with FRA in CSS
   */

  $('.markers button').css({'margin': '5px 7px', 'padding': '0 10px'})
  $('#markloc').css('margin-left', '5px')

  /**
   * these var are for the creation of the marker
   * they are global so we can remove it later
   */

  let mark
  let counter = true

  /**
   * add the marker
   */

  const addMark = (Type) => {
    /**
     * set counter to true
     * we use it to prevent error when we remove a marker
     */

    counter = true

    /**
     * set the mark interaction
     */

    mark = new ol.interaction.Draw({
      source: Msource,
      type: Type
    })

    /**
     * limit the number of markers to 4
     */

    if (Msource.getFeatures().length < 5) {
      /**
       * disable the buttons to prevent multiple instances
       */

      $('#drawing button').prop('disabled', true)
      $('#tlruler').prop('disabled', true)

      /**
       * add the mark interaction to the map
       */

      mapView.addInteraction(mark)

      /**
       * this occurs when you finish to draw the marker
       */

      mark.on('drawend', () => {
        counter = true
        drawingMarker()
      })

      /**
       * this occurs after you finish to draw the marker
       */

      markLayer.on('change', () => {
        mapView.removeInteraction(mark)

        /**
         * enable the buttons to prevent multiple instances
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
          let ind = Msource.getFeatures().length - 1
          Msource.getFeatures()[ind].setId(MarkId - 1)
        }
        /**
         * end markLayer.on('change', () => {
         */
      })
      /**
       * end if (Msource.getFeatures().length < 5)
       */
    }
    /**
     * if the Msource.getFeatures().length is > 5
     */

    else {
      /**
       * remove the mark interaction
       * display the max plotted markers message
       */

      mapView.removeInteraction(mark)

      $('.maxmarkers').css('display', 'inline')
    }

    /**
     * end function addMark (Type)
     */
  }

  /**
   * create the marker list
   */

  const drawingMarker = () => {
    /**
     * set counter to true
     */

    counter = true

    /**
     * at this point the source is empty, so the first ID it will be 0
     * we add 1 to start from 1
     */

    let markText = Msource.getFeatures().length + 1

    /**
     * we add a new option to the select element
     */

    $('<option>', {
      'value': MarkId,
      'text': `Marker ${markText}`
    }).attr('id', MarkId).appendTo('#tlfeature')

    /**
     * we add a new textarea for each option
     */

    $('<textarea>', {
      'name': `Marker ${markText}`,
      'rows': '4',
      'class': MarkId,
      'maxlength': '100',
      'value': '',
      'placeholder': 'enter text...'
    }).appendTo('.textDiv')

    /**
     * we select to default the last marker in the select element
     * we hide all the textareas
     * we display the current textarea
     */

    $('#tlfeature').val(MarkId)
    $('.textDiv textarea').hide()
    $(`.${MarkId}`).show()

    /**
     * we display the markers buttons
     * we display the complete marker div that included select/textarea/buttons
     */

    $('.markers').css('display', 'inline-block')
    $('.markers').css('height', '28px')
    $('.markerdiv').show()

    /**
     * we increase the marker ID plus 1
     */

    MarkId += 1

    /**
     * end drawingMarker = () =>
     */
  }

  /**
   * display the correct textarea when the select elemet change
   */

  $(function () {
    $('#tlfeature').change(function () {
      /**
       * hide the popup
       */

      overlay.setPosition(undefined)

      /**
       * we hide all the textareas
       * we display the current textarea
       */

      $('.textDiv textarea').hide()
      $('.' + $(this).val()).show()

      /**
       * display the marker buttons if the tlfeature element is not empty
       */

      if ($('#tlfeature').val() !== null) {
        $('.markers').css('display', 'inline-block')
        $('.markers').css('height', '28px')
      }
    })
  })

  /**
   * markers button handler
   */

  /*
   * marker location button
   */

  $('#markloc').on('click', function (e) {
    /**
     * prevent default behaviour
     * hide the popup
     */

    e.preventDefault()

    overlay.setPosition(undefined)

    /**
     * prevent error enabling the click just if the value of the option selected is not empty
     */

    if ($('#tlfeature').val() !== null) {
      /**
       * get the select element
       * get the actual selected option
       * get the coordinates from the marker source checking the ID
       */

      let sel = document.getElementById('tlfeature')
      let selIds = sel[sel.selectedIndex].id
      let coord = Msource.getFeatureById(parseInt(selIds)).getGeometry().getCoordinates()

      /**
       * move the map to the exact location of the marker
       * we don't move the zoom, we use the same level the customer is
       */

      mapView.getView().centerOn([parseFloat(coord[0]), parseFloat(coord[1])], mapView.getSize(), [($('#map').innerWidth() / 2), ($('#map').innerHeight() / 2)])
    }
  })

  /**
   * marker drag button
   */

  $('#markdrag').on('click', function (e) {
    /**
     * prevent default behaviour
     * hide the popup
     */

    e.preventDefault()

    overlay.setPosition(undefined)

    /**
     * prevent error enabling the click just if the value of the option selected is not empty
     */

    if ($('#tlfeature').val() !== null) {
      /**
       * disable the buttons to prevent to launch more instances of the function
       */

      $('#drawing button').prop('disabled', true)
      $('#tlruler').prop('disabled', true)

      /**
       * get the select element
       * get the actual selected option
       */

      let sel = document.getElementById('tlfeature')
      let ids = sel[sel.selectedIndex].id

      /**
       * create the drag interaction
       * add it to the map
       */

      let dragInteraction = new ol.interaction.Modify({
        features: new ol.Collection([Msource.getFeatureById(parseInt(ids))]),
        style: null
      })

      mapView.addInteraction(dragInteraction)

      /**
       * pointermove event listen
       */

      mapView.on('pointermove', function (evt) {
        /**
         * if you are moving the map return
         */

        if (evt.dragging) {
          return
        }

        /**
         * change the pointer style to match the marker layer
         */

        let pixel = mapView.getEventPixel(evt.originalEvent)
        let hit = mapView.forEachLayerAtPixel(pixel, () => {
          return true
        }, null, (layer) => {
          return layer === markLayer
        })
        mapView.getTargetElement().style.cursor = hit ? 'move' : ''
      })

      /**
       * modifyend event listener
       */

      dragInteraction.on('modifyend', () => {
        /**
         * remove the interaction when the customer finish to drag the marker
         */
        mapView.removeInteraction(dragInteraction)

        /**
         * enable the buttons
         */

        setTimeout(() => {
          $('#drawing button').prop('disabled', false)
          $('#tlruler').prop('disabled', false)
        }, 300)

        /**
         * pointermove event listen
         */

        mapView.on('pointermove', function (evt) {
          /**
           * if you are moving the map return
           */

          if (evt.dragging) {
            return
          }

          /**
           * change the pointer style to match the data layer
           */

          let pixel = mapView.getEventPixel(evt.originalEvent)
          let hit = mapView.forEachLayerAtPixel(pixel, () => {
            return true
          }, null, (layer) => {
            return layer === getLayer
          })
          mapView.getTargetElement().style.cursor = hit ? 'pointer' : ''
        })

        /**
         * end dragInteraction.on('modifyend', () =>
         * end if ($('#tlfeature').val() !== null)
         * end $('#markdrag').on('click', function (e) {
         */
      })
    }
  })

  /**
   * marker delete button
   */

  $('#markdel').on('click', function (e) {
    /**
     * prevent default behaviour
     * hide the popup
     * set counter to false
     */

    e.preventDefault()

    overlay.setPosition(undefined)

    counter = false

    /**
     * prevent error enabling the click just if the value of the option selected is not empty
     */

    if ($('#tlfeature').val() !== null) {
      /**
       * get the select element
       */

      let sel = document.getElementById('tlfeature')

      /**
       * add the last symbols to the main symbols array
       */

      mySource.unshift(Msource.getFeatureById(sel.value).getProperties().mysource)

      /**
       * remove the marker connected to that ID
       */

      Msource.removeFeature(Msource.getFeatureById(sel.value))

      /**
       * remove the connected textarea
       * remove the connected selected option
       * set the selected option to the default one ''
       */

      $('.' + parseInt(sel.value)).remove()

      $('#' + sel[sel.selectedIndex].id).remove()
      $('#tlfeature').val('')

      /**
       * hide the buttons as there is nothing selected
       */

      $('.markers').hide()

      /**
       * get max length of the select element
       */

      let maxlen = document.getElementById('tlfeature').options.length

      /**
       * iterate through the options of the select element and change the text
       * we start from 1 to don't touch the default view or edit.. option
       */

      for (let i = 1; i < maxlen; i++) {
        document.getElementById('tlfeature').options[i].innerHTML = 'Marker ' + i
      }

      if (maxlen === 1) {
        /**
         * if there is just the default option
         * hide the marker div
         */

        $('.markerdiv').css('display', 'none')
      }

      /**
       * if the markers are < 5 remove the max plotted markers message
       */

      if (Msource.getFeatures().length < 5) {
        $('.maxmarkers').css('display', 'none')
      }

      /**
       * end if ($('#tlfeature').val() !== null)
       * end $('#markdel').on('click', function (e)
       */
    }
  })

  /**
   * end initMarker () =>
   */
}

/**
 * export the marker source to use it in the print
 */

const markerSource = () => {
  return Msource
}

/**
 * EXPORT
 */

export default {
  initMarker,
  markerSource
}
