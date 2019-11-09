/**
 * in this module there are all the functions needed to create the print view
 */

/**
 * import modules
 */

import functions from './functions'
import marker from './marker'

/**
 * global var to reuse in the module
 */

let printmap

/**
 * initialize the print tool
 */

const initPrint = (getFixed, getMap, dataLayer, invdataLayer = {}, amdataLayer = {}) => {
  /**
   * !!we don 't use an arrow function because the this is not bind !!
   * on change event that fire the print function and load the correct print template
   */

  $('#tlprint').change(function () {
  /**
   * initialize the fixed settings
   * get the value of the select item
   * attache the source of the iframe
   * open the modal
   */

    let fixed = getFixed
    let map = getMap
    let pUrl = this.value
    $('#ifprint').attr('src', pUrl)
    $('#printMod').modal('show')

    /**
     * attach an on load event to the iframe
     */

    $('#ifprint').on('load', () => {
      /**
       * append a new div to the print modal
       * get the content of the iframe
       * replace the new div with the body of the iframe
       * remove the iframe
       */

      const newFrame = $('<div id="newFrame"></div>')
      $('#printMod .modal-body').append(newFrame)

      let body = $('#ifprint').contents()
      $('#newFrame').replaceWith(body.find('#printBody'))

      $('#ifprint').remove()

      /**
       * create the map view
       * set the modal size after 100 ms
       */

      if (fixed.app === 'invmap') {
        print(fixed, map, dataLayer, invdataLayer, amdataLayer)
      }
      else {
        print(fixed, map, dataLayer)
      }

      setTimeout(() => {
        setModalSize()
      }, 100)
    })

    /**
     * change to the default value and hide the div
     */

    $('#tlprint').val('Print...')
    $('.printopt').toggleClass('hidden')
  })

  /**
   * close event on the modal
   *  - remove the print template and append a new iframe
   * this is because the content is written permanently and when
   * you open the modal again the content will be duplicate
   */

  $('#printMod').on('hidden.bs.modal', function (e) {
    $('#printBody').remove()
    const iframe = $('<iframe src="" id="ifprint"></iframe>')
    $('#printMod .modal-body').append(iframe)
  })

  /**
   * force to open the browser print dialog whne you click on the button
   */

  $('#printBtn').click(() => {
    window.print()
  })

  /**
   * end const initPrint = (getFixed, getMap, dataLayer, pmdataLayer = {}, amdataLayer = {}) => {
   */
}

/**
 * create the print view
 */

const print = (fixed, map, dataLayer, invdataLayer = {}, amdataLayer = {}) => {
  /**
   * populate the pdatetext text, the date of creation that is today
   * populate the dataFilter text, the data came from the datepicker in the main page
   */

  const today = new Date()
  let todayDate = today.getDate()
  let todayMonth = today.getMonth() + 1

  $('#pdatetext').html(`Date created: ${functions.leadZero(todayDate)}/${functions.leadZero(todayMonth)}/${today.getFullYear()}`)

  /**
   * populate the pdatetext text, the date of creation that is today
   * populate the dataFilter text, the data came from the datepicker in the main page
   */

  if (fixed.app === 'parkmap') {
    $('.dataFilter').html(`Date displayed: ${$('#activedate').val()}`)
  }
  else if (fixed.app === 'accsmap_plus') {
    $('.dataFilter').html($('.amdisclaimer .accfiltsel').text().replace('Displaying ', ''))
  }
  else if (fixed.app === 'invmap') {
    $('.dataFilter').html(`Parking Date displayed: ${$('#activedate').val()}`)
  }

  /**
   * create the map for the print
   */

  printmap = new ol.Map({
    /**
     * remove the interactions
     * extend the controls
     * get the layers from the main map
     * get the view from the main map
     */

    interactions: ol.interaction.defaults({
      altShiftDragRotate: false,
      shiftDragZoom: false,
      mouseWheelZoom: false,
      pinchZoom: false,
      doubleClickZoom: false
      // dragPan: false
    }),
    controls: ol.control.defaults({
      attributionOptions: ({
        collapsible: false
      })
    }).extend([
      new ol.interaction.DragRotateAndZoom({
        target: 'printmap'
      }),
      // add the actual scale in "m"
      new ol.control.ScaleLine({
        units: 'metric',
        target: 'print_scale_line'
      })
    ]),
    layers: map.getLayers().getArray(),
    view: map.getView(),
    target: 'printmap'
  })

  /**
   * force the map t oupdate the size after 300ms
   * for some reason sometimes the map doesn't display even if is there
   */

  setTimeout(() => {
    printmap.updateSize()
  }, 300)

  /**
   * move end event handler
   */

  printmap.on('moveend', () => {
    drag()
    if (fixed.app === 'parkmap') {
      refreshLegend(fixed, dataLayer)
    }
    else if (fixed.app === 'accsmap_plus') {
      refreshLegend(fixed, dataLayer.twlayers)
    }
    else if (fixed.app === 'invmap') {
      refreshLegend(fixed, dataLayer, invdataLayer.twlayers, amdataLayer.twlayers)
    }
    addMarkers(marker.markerSource())
  })

  /**
   * end const print = () =>
   */
}

/**
 * refresh the Legend when the map has finish to move
 */

const refreshLegend = (fixed, layer, invlayers = {}, amlayers = {}) => {
/**
 * if the legend is already created remove it before to create the new one
 */

  $('.legendlist').empty()
  $('.legendlist').remove()

  /**
   * get the visibles restrictions form the BD and create the legend
   */
  if (fixed.app === 'invmap') {
    ajaxVisibleLayers(fixed, layer, invlayers, amlayers)
  }
  else {
    ajaxVisibleLayers(fixed, layer)
  }
}

/**
 * get the ID of the visible restriction in the print view
 */

const ajaxVisibleLayers = (fixed, sQLayers, invlayers = {}, rtctwlayers = {}) => {
  /**
   * get the map extents and extract coords
   */

  // console.log(sQLayers)
  // console.log(invlayers)
  // console.log(rtctwlayers)

  const bcoords = printmap.getView().calculateExtent(printmap.getSize())

  /**
   * send the request to the php file with 3 params
   *  - boundaries (bccords)
   *  - the layers to query (orderl, orderp, etc)
   *  - the date in US format
  */

  let queryString = ''

  if (fixed.app === 'parkmap') {
    queryString = `?bbox=${bcoords}&layers=${sQLayers}&date=${$('#activedate').val().split('/').reverse().join('-')}`
  }
  else if (fixed.app === 'accsmap_plus') {
    queryString = `?bbox=${bcoords}&layers=${sQLayers}`
  }
  else if (fixed.app === 'invmap') {
    queryString = {'bbox': [bcoords], 'pmlayers': sQLayers, 'invlayers': invlayers, 'amlayers': rtctwlayers, 'date': '0'}
    // queryString = `?bbox=${bcoords}&pmlayers=${sQLayers}&invlayers=${invlayers}&amlayers=${rtctwlayers}&date=${dDTo}`
  }

  /**
   * initialize the theUrl var to empty
   * check if it's a parkmap or accsmap TW
   * check if it's a local dev environment
   * update theUrl var accordingly
   */

  let theUrl = ''

  /**
   * parkmap TW
   */

  if (fixed.app === 'parkmap') {
    if (window.location.href.indexOf('localhost') > -1) {
      theUrl = `https:www.traffwebdev.uk/php/getlayers.php${queryString}`
    }
    else {
      theUrl = `/php/getlayers.php${queryString}`
    }
  }

  /**
   * accsmap TW
   */

  else if (fixed.app === 'accsmap_plus') {
    if (window.location.href.indexOf('localhost') > -1) {
      theUrl = `https:www.traffwebdev.uk/php/getlayersam.php${queryString}`
    }
    else {
      theUrl = `/php/getlayersam.php${queryString}`
    }
  }

  /**
   * invmap TW
   */

  else if (fixed.app === 'invmap') {
    if (window.location.href.indexOf('localhost') > -1) {
      theUrl = 'https:www.traffwebdev.uk/php/getinvlayers.php'
    }
    else {
      theUrl = '/php/getinvlayers.php'
    }
  }

  /**
   * check if it's a parkamp accsmap or invmap tw
   * send the request in get method
   * send the tequest in post method if it's invmap
   */

  if (fixed.app === 'invmap') {
    $.ajax({
      url: theUrl,
      method: 'POST',
      data: queryString
    })
      .done((data) => {
        layerHandler(data, fixed)
      })
  }
  else {
    $.ajax({
      url: theUrl
    })
      .done((data) => {
        layerHandler(data, fixed)
      })
  }

  /**
   * end const ajaxVisibleLayers = (fixed, sQLayers) => {
   */
}

/**
 * display the visible features and create the legend
 * this function it's called inside ajaxVisibleLayers
 */

const layerHandler = (featIDs, fixed) => {
/**
 * set fullLegend to false
 */

  let fullLegend = false

  /**
   * set:
   *  - visGroup the same as $('#featclick') or $('#rtcfeatclick') or $('#Invfeatclick') that contains all the visible restrictions ID in the map
   * this is based on the type of TW
   */

  let visGroup

  if (fixed.app === 'parkmap' || fixed.app === 'accsmap_plus') {
    visGroup = `${$('#featclick').val()}`
  }

  else {
    /**
     * initialize to empty the visibles IDs
     * chcek if the legend it's shown or not
     * popuplate the IDs accordingly
     */

    let invfeat = ''
    let amfeat = ''
    let pmfeat = ''

    if ($('#invlegend').css('display') !== 'none') {
      invfeat = $('#Invfeatclick').val()
    }
    if ($('#rtclegend').css('display') !== 'none') {
      amfeat = $('#rtcfeatclick').val()
    }
    if ($('#pmlegend').css('display') !== 'none') {
      pmfeat = $('#featclick').val()
    }

    /**
     * depending on which visible layer you have you can have double commas or a starting or ending comma
     * remove the duplicate and uneccessary commas
     */

    visGroup = `${pmfeat},${amfeat},${invfeat}`.replace(',,', ',')

    if (visGroup.charAt(0) === ',') {
      visGroup = visGroup.slice(1, visGroup.length)
    }
    if (visGroup.charAt(visGroup.length - 1) === ',') {
      visGroup = visGroup.slice(0, visGroup.length - 1)
    }
  }

  /**
   * set groupFromDb the same as the parameter that contains the visible restriction in the actual view
   */

  let groupFromDb = ''

  if (fixed.app === 'invmap') {
    groupFromDb = JSON.parse(featIDs)
  }
  else {
    groupFromDb = featIDs.slice(0, -1).split(',')
  }

  /**
   * check the orientation of the print template and set the maxLegendItems var
   */

  let maxLegendItems

  if ($('#title').attr('orientation') === 'portrait') {
    maxLegendItems = 4
  }
  else {
    maxLegendItems = 10
  }

  /**
   * check if it's a invmap TW or not
   * check if the restrictions to dipslay are more than the allows and:
   *  - dipslay/hide the second page
   *  - set the fullLegend var to true or false
   */

  if (fixed.app === 'invmap') {
    let maxItem = groupFromDb.parkmap.length + groupFromDb.invmap.length + groupFromDb.accsmap.length
    if (maxItem > maxLegendItems) {
      $('#pllegwrapper').css('display', 'block')
      $('#pagesplit').addClass('secpage')
      fullLegend = true
    }
    else {
      $('#pllegwrapper').css('display', 'none')
      $('#pagesplit').removeClass('secpage')
      fullLegend = false
    }
  }
  else {
    if (groupFromDb.length > maxLegendItems) {
      $('#pllegwrapper').css('display', 'block')
      $('#pagesplit').addClass('secpage')
      fullLegend = true
    }
    else {
      $('#pllegwrapper').css('display', 'none')
      $('#pagesplit').removeClass('secpage')
      fullLegend = false
    }
  }

  /**
   * check the orientation of the print template and if the legend is full and set the maxLegendItems var
   */

  if (fullLegend && $('#title').attr('orientation') === 'portrait') {
    maxLegendItems = 49
  }
  else if (fullLegend && $('#title').attr('orientation') === 'landscape') {
    maxLegendItems = 32
  }

  /**
   * check if the legend is full and set the target for the legend
   */

  let targetDiv = ''
  let targetLeg = ''

  if (fullLegend) {
    targetDiv = 'orderdisplaycol1'
    targetLeg = 'legend_list1'
  }
  else {
    targetDiv = 'orderdisplay'
    targetLeg = 'legend_list'
  }

  /**
   * create and append the list to the target
   */

  $('<ul>', {
    id: targetLeg
  }).addClass('legendlist').appendTo(`#${targetDiv}`)

  /**
   * set the legend item count to 0
   */

  let legendItemCnt = 0

  /**
   * check if it'a parkmap or accsmap plus TW
   */

  if (fixed.app === 'parkmap' || fixed.app === 'accsmap_plus') {
    /**
     * get the features.json to create the legend
     */

    $.getJSON(fixed.urlmain + 'data/features.json', function (data) {
      /**
       * check if there are features in the json file
       * for each element create the restriction in the list
       */

      if ('features' in data) {
        $.each(data.features, function () {
          /**
           * assign the actual restriction to data
           */

          data = this

          /**
           * initialize the tmpid var to empty
           * check if it's a parkmap or accsmap TW
           * update the tmpid accordingly
           */

          let tmpid = ''

          if (fixed.app === 'parkmap') {
            tmpid = data.order_id
          }
          else if (fixed.app === 'accsmap_plus') {
            tmpid = data.name
          }

          /**
           * for some reason the second time you open the print map
           * the request is send twice, this prevent to create duplicates
           * check if it's a parkmap accsmap plus or invmap app
           * check if it's already present the item
           * return or continue
           */

          if (fixed.app === 'parkmap') {
            if ($(`#printli${data.order_id}`).length === 1) {
              return
            }
          }
          else if (fixed.app === 'accsmap_plus') {
            if ($(`#printli${data.name}`).length === 1) {
              return
            }
          }

          /**
           * check if the ID is visible in the map and in the array from the DB
           */

          if (featIDs.search(tmpid) !== -1 && visGroup.search(tmpid) !== -1) {
          /**
           * increment the legend item count plus 1
           * check if the legend is full or not
           * assign the correct target
           */

            legendItemCnt += 1

            if (legendItemCnt > maxLegendItems) {
              if (targetDiv === 'orderdisplaycol1') {
                targetDiv = 'orderdisplaycol2'
                targetLeg = 'legend_list2'
              }
              else {
                targetDiv = 'orderdisplaycol3'
                targetLeg = 'legend_list3'
              }

              legendItemCnt = 0

              $('<ul>', {
                id: targetLeg
              }).addClass('legendlist').appendTo(`#${targetDiv}`)
            }

            /**
             * check if it's a parkmap TW
             */

            if (fixed.app === 'parkmap') {
              /**
               * append the item to the list
               */

              $('<li>', {
                id: `printli${data.order_id}`
              }).addClass('leglist clearfix').appendTo(`#${targetLeg}`)

              /**
               * check if the item is a line
               * apply the correct style
               * append it to the li element
               */

              if (data.type === 'line') {
                $('<img>', {
                  src: 'https://cdn.traffweb.uk/cdn/css/images/transparent.png',
                  style: `float:right;background-color:${data.stroke};border:solid 1px black;`
                }).addClass(`line${data.line_id}_${data.stroke_width}`).appendTo(`#printli${data.order_id}`)
              }

              /**
               * check if the item is a point
               * apply the correct style
               * append it to the li element
               */

              else if (data.type === 'point') {
                $('<img>', {
                  src: `../../${data.image}`,
                  style: 'float:right;background-color:none;'
                }).appendTo(`#printli${data.order_id}`)
              }

              /**
               * check if the item is a region
               * apply the correct style
               * append it to the li element
               */

              else if (data.type === 'region') {
                $('<img>', {
                  src: 'https://cdn.traffweb.uk/cdn/css/images/transparent.png',
                  style: `float:right;background-color:${data.stroke};border:none;`
                }).addClass(`region${data.region_id}`).appendTo(`#printli${data.order_id}`)
              }

              /**
               * append the name of the item
               * append it to the li element
               */

              $('<span>', {
                style: 'display: block;',
                text: data.name,
                id: `lb${data.order_id}`
              }).appendTo(`#printli${data.order_id}`)
            }

            /**
             * else if it's an accsmap TW
             */

            else if (fixed.app === 'accsmap_plus') {
              /**
               * append the item to the list
               * aadd the name of the item
               */

              $('<li>', {
                id: `printli${data.name}`,
                text: data.name
              }).addClass('leglist').appendTo(`#${targetLeg}`)

              /**
               * check if the item is a camera
               * apply the correct style
               * append it to the li element
               */

              if (data.name === 'Camera') {
                $('<img>', {
                  src: `../../symbols/speed_camera.gif`,
                  style: `float:right;background-color:${data.stroke};border:none;`
                })
                  .appendTo(`#printli${data.name.replace(' ', '_')}`)
              }

              /**
               * check if the item is a camera
               * apply the correct style
               * append it to the li element
               */

              else {
                $('<div>', {
                  style: `width:35px;height:24px;float:right;background-color:${data.stroke};`
                })
                  .appendTo(`#printli${data.name}`)
              }

              /**
               * end else it's an accsmap TW
               */
            }

            /**
             * end if (featIDs.search(tmpid) !== -1 && visGroup.search(tmpid) !== -1)
             */
          }

          /**
           * end $.each(data.features, function ()
           * end if ('features' in data)
           * end getJSON
           * end if (fixed.app === 'parkmap' || fixed.app === 'accsmpa_plus') {
           */
        })
      }
    })
  }

  /**
   * invmap TW
   */

  else {
  /**
   * check if the parkmap legend it's visible
   * get the features for parkmap
   */

    if ($('#pmlegend').css('display') !== 'none') {
      $.getJSON(fixed.pmpath.replace('../', '/') + 'features.json', function (data) {
        /**
         * check if there are features in the json file
         * for each element create the restriction in the list
         */

        if ('features' in data) {
          $.each(data.features, function () {
            /**
             * assign the actual restriction to data
             */

            data = this

            /**
             * initialize the tmpid with data.order_id
             */

            let tmpid = data.order_id

            /**
             * for some reason the second time you open the print map
             * the request is send twice, this prevent to create duplicates
             * check if it's already present the item
             * return or continue
             */

            if ($(`#printli${data.order_id}`).length === 1) {
              return
            }

            /**
             * check if the ID is visible in the map and in the array from the DB
             */

            if (groupFromDb.parkmap.indexOf(tmpid) !== -1 && $('#featclick').val().split(',').map(function (item) {
              return parseInt(item, 10)
            }).indexOf(tmpid) !== -1) {
              /**
               * increment the legend item count plus 1
               * check if the legend is full or not
               * assign the correct target
               */

              legendItemCnt += 1

              if (legendItemCnt > maxLegendItems) {
                if (targetDiv === 'orderdisplaycol1') {
                  targetDiv = 'orderdisplaycol2'
                  targetLeg = 'legend_list2'
                }
                else {
                  targetDiv = 'orderdisplaycol3'
                  targetLeg = 'legend_list3'
                }

                legendItemCnt = 0
                $('<ul>', {
                  id: targetLeg
                }).addClass('legendlist').appendTo(`#${targetDiv}`)
              }

              /**
               * append the item to the list
               */

              $('<li>', {
                id: `printli${data.order_id}`
              }).addClass('leglist clearfix').appendTo(`#${targetLeg}`)

              /**
               * check if the item is a line
               * apply the correct style
               * append it to the li element
               */

              if (data.type === 'line') {
                $('<img>', {
                  src: 'https://cdn.traffweb.uk/cdn/css/images/transparent.png',
                  style: `float:right;background-color:${data.stroke};border:solid 1px black;`
                }).addClass(`line${data.line_id}_${data.stroke_width}`).appendTo(`#printli${data.order_id}`)
              }

              /**
               * check if the item is a point
               * apply the correct style
               * append it to the li element
               */

              else if (data.type === 'point') {
                $('<img>', {
                  src: '../../' + data.image,
                  style: 'float:right;background-color:none;'
                }).appendTo(`#printli${data.order_id}`)
              }

              /**
               * check if the item is a region
               * apply the correct style
               * append it to the li element
               */

              else if (data.type === 'region') {
                $('<img>', {
                  src: 'https://cdn.traffweb.uk/cdn/css/images/transparent.png',
                  style: `float:right;background-color:${data.stroke};border:none;`
                }).addClass(`region${data.region_id}`).appendTo(`#printli${data.order_id}`)
              }

              /**
               * append the name of the item
               * append it to the li element
               */

              $('<span>', {
                style: 'display: block;',
                text: data.name,
                id: `lb${data.order_id}`
              }).appendTo(`#printli${data.order_id}`)
            }

          /**
           * end if ('features' in data) {
           * end $.each(data.features, function () {
           * end $.getJSON(fixed.pmpath.replace('../', '/') + 'features.json', function (data) {
           * end if ($('#pmlegend').css('display') !== 'none') {
           */
          })
        }
      })
    }

    /**
     * check if the accsmap legend it's visible
     * get the features for accsmap
     */

    if ($('#rtclegend').css('display') !== 'none') {
      $.getJSON(fixed.rtcpath.replace('../', '/') + 'features.json', function (data) {
        /**
         * check if there are features in the json file
         * for each element create the restriction in the list
         */

        if ('features' in data) {
          $.each(data.features, function () {
            /**
             * assign the actual restriction to data
             */

            data = this

            /**
             * initialize the tmpid with data.name and convert it to lower case
             * convert also all the result from the DB to lower case
             */

            let tmpid = data.name.toLowerCase()

            groupFromDb.accsmap = groupFromDb.accsmap.map(function (value) {
              return value.toLowerCase()
            })

            let sSevSeltmp = $('#rtcfeatclick').val().split(',').map(function (value) {
              return value.toLowerCase().replace(/['"]+/g, '')
            })

            /**
             * for some reason the second time you open the print map
             * the request is send twice, this prevent to create duplicates
             * check if it's already present the item
             * return or continue
             */

            if ($(`#printli${data.name}`).length === 1) {
              return
            }

            /**
             * check if the ID is visible in the map and in the array from the DB
             */

            if (groupFromDb.accsmap.indexOf(tmpid) > -1 && sSevSeltmp.indexOf(tmpid) > -1) {
              /**
               * increment the legend item count plus 1
               * check if the legend is full or not
               * assign the correct target
               */

              legendItemCnt += 1

              if (legendItemCnt > maxLegendItems) {
                if (targetDiv === 'orderdisplaycol1') {
                  targetDiv = 'orderdisplaycol2'
                  targetLeg = 'legend_list2'
                }
                else {
                  targetDiv = 'orderdisplaycol3'
                  targetLeg = 'legend_list3'
                }

                legendItemCnt = 0

                $('<ul>', {
                  id: targetLeg
                }).addClass('legendlist').appendTo(`#${targetDiv}`)
              }

              /**
               * append the item to the list
               */

              $('<li>', {
                id: `printli${data.name}`,
                text: data.name.replace(' ', '_')
              }).addClass('leglist').appendTo(`#${targetLeg}`)

              /**
               * check if the item is a camera
               * apply the correct style
               * append it to the li element
               */

              if (data.name === 'Camera') {
                $('<img>', {
                  src: `../../symbols/speed_camera.gif`,
                  style: `float:right;background-color:${data.stroke};border:none;`
                })
                  .appendTo(`#printli${data.name.replace(' ', '_')}`)
              }

              /**
               * check if the item is a camera
               * apply the correct style
               * append it to the li element
               */

              else {
                $('<div>', {
                  style: `width:35px;height:24px;float:right;background-color:${data.stroke};`
                })
                  .appendTo(`#printli${data.name.replace(' ', '_')}`)
              }

              /**
               * end if (groupFromDb.accsmap.indexOf(tmpid) > -1 && sSevSeltmp.indexOf(tmpid) > -1) {
               * end $.each(data.features, function () {
               * end if ('features' in data) {
               * end $.getJSON(fixed.rtcpath.replace('../', '/') + 'features.json', function (data) {
               * end if ($('#rtclegend').css('display') !== 'none') {
               */
            }
          })
        }
      })
    }

    /**
     * check if the invmap legend it's visible
     * get the features for invmap
     */

    if ($('#invlegend').css('display') !== 'none') {
      $.getJSON('/invmap/data/features.json', function (data) {
        /**
         * check if there are features in the json file
         * for each element create the restriction in the list
         */

        if ('features' in data) {
          $.each(data.features, function () {
            /**
             * assign the actual restriction to data
             */

            data = this

            /**
             * initialize the tmpid with data.order_id
             */

            let tmpid = data.order_id

            /**
             * for some reason the second time you open the print map
             * the request is send twice, this prevent to create duplicates
             * check if it's already present the item
             * return or continue
             */

            if ($(`#printli${data.order_id}`).length === 1) {
              return
            }

            /**
             * check if the ID is visible in the map and in the array from the DB
             */

            if (groupFromDb.invmap.indexOf(tmpid) > -1 && $('#Invfeatclick').val().split(',').map(function (item) {
              return parseInt(item, 10)
            }).indexOf(tmpid) > -1) {
              /**
               * increment the legend item count plus 1
               * check if the legend is full or not
               * assign the correct target
               */

              legendItemCnt += 1

              if (legendItemCnt > maxLegendItems) {
                if (targetDiv === 'orderdisplaycol1') {
                  targetDiv = 'orderdisplaycol2'
                  targetLeg = 'legend_list2'
                }
                else {
                  targetDiv = 'orderdisplaycol3'
                  targetLeg = 'legend_list3'
                }

                legendItemCnt = 0

                $('<ul>', {
                  id: targetLeg
                }).addClass('legendlist').appendTo(`#${targetDiv}`)
              }

              /**
               * append the item to the list
               */

              $('<li>', {
                id: `invprintli${data.order_id}`
              }).addClass('leglist clearfix').appendTo(`#${targetLeg}`)

              /**
               * check if the item is a line
               * apply the correct style
               * append it to the li element
               */

              if (data.type === 'line') {
                $('<img>', {
                  src: 'https://cdn.traffweb.uk/cdn/css/images/transparent.png',
                  style: `float:right;background-color:${data.stroke};border:solid 1px black;`
                }).addClass(`line${data.line_id}_${data.stroke_width}`).appendTo(`#invprintli${data.order_id}`)
              }

              /**
               * check if the item is a point
               * apply the correct style
               * append it to the li element
               */

              else if (data.type === 'point') {
                $('<img>', {
                  src: data.image,
                  style: 'float:right;background-color:none;'
                }).appendTo(`#invprintli${data.order_id}`)
              }

              /**
               * check if the item is a region
               * apply the correct style
               * append it to the li element
               */

              else if (data.type === 'region') {
                $('<img>', {
                  src: 'https://cdn.traffweb.uk/cdn/css/images/transparent.png',
                  style: `float:right;background-color:${data.stroke};border:none;`
                }).addClass(`region${data.region_id}`).appendTo(`#invprintli${data.order_id}`)
              }

              $('<span>', {
                style: 'display: block;',
                text: data.name,
                id: `lb${data.order_id}`
              }).appendTo(`#invprintli${data.order_id}`)

            /**
             * end if (groupFromDb.invmap.indexOf(tmpid) !== -1 && $('#Invfeatclick').val().split(',').map(function (item) {
             * end $.each(data.features, function () {
             * end if ('features' in data) {
             * end $.getJSON('/invmap/data/features.json', function (data) {
             * end if ($('#invlegend').css('display') !== 'none') {
             */
            }
          })
        }
      })
    }

  /**
   * end invamp TW
   */
  }

  /**
   * end const layerHandler = (featIDs, fixed) =>
   */
}

/**
 * add the marker popup on top of the map
 */

const addMarkers = (Msource) => {
  /**
   * check if there are some text areas in the drawing section
   */

  if ($('.textDiv')[0].children === 0) {
    return
  }

  /**
   * get the marker text from the drawing section
   * it's an HTML collection, array
   */

  let markerText = $('.textDiv')[0].children

  /**
   * remove all the markers popup if present so we can recreate them later
   */

  if ($('.marker').length > 0) {
    $('.marker').remove()
  }

  /**
   * set the initial position of the marker popup to 1
   * get the coordinates from the map
   */

  let markerInitialpos = 1
  let bcoords = printmap.getView().calculateExtent(printmap.getSize())

  /**
   * create the marker popup
   */

  for (let i = 0; i < markerText.length; i++) {
    /**
     * check if the marker is visible in the actual view and create the popup
     */

    if (Msource.getFeatures()[i].getGeometry().getCoordinates()[0] > bcoords[0] && Msource.getFeatures()[i].getGeometry().getCoordinates()[0] < bcoords[2] && Msource.getFeatures()[i].getGeometry().getCoordinates()[1] > bcoords[1] && Msource.getFeatures()[i].getGeometry().getCoordinates()[1] < bcoords[3]) {
    /**
     * get the text from each textarea in the markerText
     * add 60 px to the markerInitialpos
     */

      let text = markerText[i].value
      markerInitialpos += 60

      /**
       * create the popup div
       * append it to the map
       */

      $('<div>', {
        id: 'd' + i,
        style: `top:${markerInitialpos}px;`
      }).addClass('marker').appendTo($('#printmap'))

      /**
       * get the image from the drawing source
       * append it to the popup
       */

      $('<div>', {
        id: i,
        style: `background-image:url('${Msource.getFeatures()[i].getProperties().mysource}');`
      }).addClass('markerIcon').appendTo($(`#d${i}`))

      /**
       * add the text to the popup
       */

      $('<span>', {
        id: 's' + i,
        text: text
      }).appendTo($(`#d${i}`))

      /**
       * end if marker is in the visible map
       * end for loop
       * end const addMarkers = (Msource) =>
       */
    }
  }
}

/**
 * enable the drag on the marker popup
 */

const drag = () => {
/**
 * enable the drag on the marker popup
 */

  let dragging = false
  let iX
  let iY
  let movdiv

  $('#printmap').on('mousedown', '.marker', function (e) {
    dragging = true
    movdiv = $(this)
    iX = e.clientX - this.offsetLeft
    iY = e.clientY - this.offsetTop
    this.setCapture && this.setCapture()
    return false
  })

  $('#printmap').on('mousemove', function (e) {
    if (dragging) {
      let x = e || window.event
      let oX = x.clientX - iX
      let oY = x.clientY - iY
      $(`#${movdiv.attr('id')}`).css({
        'left': `${oX}px`,
        'top': `${oY}px`
      })
      return false
    }
  })

  $('#printmap').on('mouseup', function (e) {
    dragging = false
    e.cancelBubble = true
  })
}

const setModalSize = () => {
  let maxHeight = window.innerHeight - 175
  let maxWidth = window.innerWidth - 100
  let mapWidth = $('#plwrapper').width() + 70
  $('#printMod .modal-body').css('max-height', `${maxHeight}px`)
  $('#printMod .modal-lg').css('width', `${mapWidth}px`)
  $('#printMod .modal-lg').css('max-width', `${maxWidth}px`)
}

/**
 * EXPORT
 */

export default {
  initPrint,
  setModalSize
}
