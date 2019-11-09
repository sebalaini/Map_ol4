/*
 * In this module there are:
 *  - the Ruler behaviour
 *  - the marker behaviour
 *  - the drawing behaviour
 */

const initVector = (mapView, fixed, overlay, getLayer) => {
  /**
   * vector layers sources:
   * ruler
   * marker
   * drawing
   */

  let Rsource = new ol.source.Vector()
  const Msource = new ol.source.Vector()
  const Dsource = new ol.source.Vector()

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
   * set the drawing area Id to 0
   * set the accsmap filter to false
   */

  $('.fmarkers').hide()

  let areaId = 0

  let amFilter = false

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
   * ruler tool handler
   */

  /**
   * click event listener on the button
   */

  $('#tlruler').on('click', () => {
    /**
     * disable the drawing buttons
     * hidden the popup
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
     * mouseout event listener to hidden the popup
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
   * marker tool handlet
   */

  /**
   * marker click event
   */

  $('#Marker').on('click', function (e) {
    /**
     * prevent default behaviour
     * add the mark interaction to the map
     * hidden the popup
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
        }, 500)

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
     * remove the mark interaction to the map
     * we do this in case you want to plot a marker but instead of finishing the plot action you click drag
     */

    mapView.removeInteraction(mark)

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
        mapView.getTargetElement().style.cursor = hit ? 'pointer' : ''
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
        }, 500)

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
     * hidden the popup
     */

    e.preventDefault()

    addDraw('Polygon')

    overlay.setPosition(undefined)
  })

  $('#Circle').on('click', function (e) {
    /**
     * prevent default behaviour
     * add interaction
     * hidden the popup
     */

    e.preventDefault()

    addDraw('Circle')

    overlay.setPosition(undefined)
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

    let limit
    if (fixed.app === 'parkmap') {
      limit = 5
    }
    else {
      limit = 1
    }

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
        }, 500)

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
      // hidden the popup
      overlay.setPosition(undefined)

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
     * hidden the popup
     */

    e.preventDefault()

    overlay.setPosition(undefined)

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
     * hidden the popup
     */

    e.preventDefault()

    overlay.setPosition(undefined)

    /**
     * remove possible interaction that were selected
     */

    mapView.removeInteraction(draw)
    mapView.removeInteraction(mark)

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
        mapView.getTargetElement().style.cursor = hit ? 'pointer' : ''
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
        }, 500)

        /**
         * pointermove event listener
         */

        mapView.on('pointermove', function (evt) {
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
         * we check if it's an accsmap traffweb
         * if is true we clcik twice on the filter button to update the filter view
         */

        if (fixed.app === 'accsmap' && amFilter === true) {
          $('#fmarkfil').click()
          $('#fmarkfil').click()
        }

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
     * hidden the popup
     * set counter to false
     */

    e.preventDefault()

    overlay.setPosition(undefined)

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

      let limit
      if (fixed.app === 'parkmap') {
        limit = 5
      }
      else {
        limit = 1
      }

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
       * check if is an accsmap traffweb
       * and the layer filter is ON
       */

      if (fixed.app === 'accsmap' && $('#fmarkfil').val() === 'on') {
        /**
         * reset the filter button icon and value
         * reset the amFilter to false
         * update the data layer
         */

        $('#fmarkfil').removeClass('fa-check').addClass('fa fa-times').attr('value', 'off')
        amFilter = false
        // !!!!!!!!! TO DO !!!!!!!!!!!
        // !!!!!!!!! TO DO !!!!!!!!!!!
        // !!!!!!!!! TO DO !!!!!!!!!!!
        // updateLayerParams()
      }

      /**
       * end if ($('#ftlfeature').val() !== null)
       * end $('#fmarkdel').on('click', function (e)
       */
    }
  })

  /**
   * drawing filter button
   * !!!!!!!!!! TO DO !!!!!!!!!!!
   * !!!!!!!!!! TO DO !!!!!!!!!!!
   * !!!!!!!!!! TO DO !!!!!!!!!!!
   */

  $('#fmarkfil').on('click', function (e) {
    /**
     * prevent default behaviour
     * hidden the popup
     * set counter to false
     */

    e.preventDefault()

    overlay.setPosition(undefined)

    const setCharAt = (str, index, chr) => {
      if (index > str.length - 1) return str
      return str.substr(0, index) + chr + str.substr(index + 1)
    }

    let POLYGON
    // check if the draw was a polygon or a circle and get the correct parameter to send in the request
    if (Dsource.getFeatures()[0].getGeometry().getType() === 'Polygon') {
      POLYGON = Dsource.getFeatures()[0].getGeometry().getCoordinates()
    }
    else {
      POLYGON = ol.geom.Polygon.fromCircle(Dsource.getFeatures()[0].getGeometry()).getCoordinates()
    }

    // convert the array back from the previous function into a string and remove the unseccessary commas
    POLYGON = POLYGON.toString()
    let allComma = []

    for (let i = 0; i < POLYGON.length; i++) {
      if (POLYGON[i] === ',') allComma.push(i)
    }

    for (let i = 0; i < allComma.length; i++) {
      if (i % 2 === 0) {
        POLYGON = setCharAt(POLYGON, allComma[i], ' ')
      }
    }

    // add the polygon to the twSettings
    fixed.filterobj = `POLYGON((${POLYGON}))`

    if ($('#ftlfeature').val() !== null) {
      // change class and attribute
      if ($(this).attr('value') === 'on') {
        $(this).removeClass('fa-check').addClass('fa fa-times').attr('value', 'off')
        $('#filterregion').text('Polygon Filter Off')
        amFilter = false
        // !!!!!!!!! TO DO !!!!!!!!!!!
        // !!!!!!!!! TO DO !!!!!!!!!!!
        // !!!!!!!!! TO DO !!!!!!!!!!!
        // updateLayerParams()
      }
      else {
        $(this).removeClass('fa-times').addClass('fa fa-check').attr('value', 'on')
        $('#filterregion').text('Polygon Filter On')
        amFilter = true
        // !!!!!!!!! TO DO !!!!!!!!!!!
        // !!!!!!!!! TO DO !!!!!!!!!!!
        // !!!!!!!!! TO DO !!!!!!!!!!!
        // updateLayerParams()
      }
    } // end if != null
  })

  /**
   * end initVector () =>
   */
}

/**
 * EXPORT
 */

export default {
  initVector
}
