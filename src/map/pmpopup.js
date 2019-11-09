/*
 *in this module there are all the functions to create
 *  - the popup for TRO
 *  - the popup for FRA
 *  - the popup for FRA staff
 *  - the popup for PSA
 *  - the popup for PSA staff
 *  - hover popup
 *  - display the correct popup (TRO(inside we check which one like client, fra, psa), PC or hover)
 *  - the PC comment popup has it's own module, however it's calls in this file
 *  - the fra staff buttons in the popup also have their own module that it's calls in this file
 */

/**
 * infoPopup function
 */

const infoPopup = (fixed, getSettings, view, getLayer, getOverlay) => {
  /**
   * projection used in the change of cursor style
   */

  const projection = new ol.proj.Projection({
    code: 'EPSG:27700',
    getPointResolution: (r) => {
      return r
    },
    units: 'm'
  })

  let dataLayer = getLayer

  let overlay = getOverlay

  /**
   * hover popup container
   */

  let info = $('#info')

  /**
   * close the full info popup when you click on the X symbol
   */

  let closer = document.getElementById('popup-closer')

  closer.onclick = () => {
    overlay.setPosition(undefined)
    closer.blur()
    return false
  }

  /**
   * define the popup name
   * if is nottingham get the exemption json file
   */

  let popupname = fixed.popupname

  if (popupname === 'nottingham') {
    getExemptions()
  }

  /**
   * single click event listener
   */

  view.on('singleclick', function (evt) {
    /**
     * remove the content of the hover popup on click
     */

    info.html('')

    /**
     * check if another button is active
     * return to prevent to show the popup
     */

    if ($('#Marker').prop('disabled') === true || $('#Polygon').prop('disabled') === true || $('#tlruler').hasClass('removeRuler')) {
      return
    }

    /**
     * define the popup div
     * empty the popup content
     * get the resolution
     * get the coordinate
     * define the layer to query
     */

    let content = document.getElementById('popup-content')
    content.innerHTML = ''
    const viewResolution = view.getView().getResolution()
    let coordinate = evt.coordinate
    let url = dataLayer.getSource().getGetFeatureInfoUrl(coordinate, viewResolution, projection, {'INFO_FORMAT': 'text/html', 'FEATURE_COUNT': '10'})

    /**
     * check if url is not empty
     */

    if (url) {
      /**
       * send a XMLHttpRequest to the url and get back the xml files compiled
       */

      let xhttp = new XMLHttpRequest()
      xhttp.open('GET', url, true)
      xhttp.send()
      xhttp.onreadystatechange = function (aEvt) {
        /**
         * check the readyState and status
         */

        if (xhttp.readyState === 4 && xhttp.status === 200) {
          /**
           * get the result from the XML
           * - create a parser
           * - parse the result
           * - get the item element
           */

          let parser = new window.DOMParser()
          let res = parser.parseFromString(xhttp.responseText, 'text/xml')
          let item = res.getElementsByTagName('item')

          /**
           * in case of moving sign or no restricions in the result
           *  - hide the popup
           *  - return
           */

          if (item.length === 0 || item[0].attributes.getNamedItem('type').nodeValue === 'movingSign') {
            overlay.setPosition(undefined)
            return
          }

          /**
           * check the screen size
           */

          if (window.innerWidth < 768) {
            /**
             * check if the result is no empty
             */

            if (res.getElementsByTagName('item').length !== 0) {
              /**
               * check if is a PC website
               *  - display the correct info in the popup
               */

              if (window.location.href.indexOf('consult') !== -1) {
                fullInfoPc(fixed, getSettings, xhttp.responseText, coordinate, overlay)
              }
              else {
                fullInfo(fixed, getSettings, xhttp.responseText, coordinate, overlay)
              }
            }
            /**
             * if the result is empty hide the mobile popup
             */

            else {
              $('#mobpopup').modal('hide')
            }
          }
          /**
           * if is a tablet or pc
           */

          else if (window.innerWidth >= 768) {
            /**
             * check if the result is no empty
             */

            if (res.getElementsByTagName('item').length !== 0) {
              /**
               * check if is a PC website
               *  - display the correct info in the popup
               */

              if (window.location.href.indexOf('consult') !== -1) {
                fullInfoPc(fixed, getSettings, xhttp.responseText, coordinate, overlay)
              }
              else {
                fullInfo(fixed, getSettings, xhttp.responseText, coordinate, overlay)
              }

              /**
               * get the coordinate to positioning the popup
               */

              let coord = view.getView().calculateExtent(view.getSize())

              /**
               * set the position of the overlay
               */

              overlay.setPosition(coordinate)

              /**
               * upper half of the screen
               */

              if (coordinate[1] > ((coord[1] + coord[3]) / 2)) {
                /**
                 * apply css style
                 * add correct class
                 */

                $('#popup').css('bottom', 'auto')
                $('#popup').css('top', '12px')
                $('#popup').addClass('ol-poprot')
                $('#popup').removeClass('ol-pop')
              }
              /**
               * lower half of the screen
               */

              else {
                /**
                 * apply css style
                 * add correct class
                 */

                $('#popup').css('bottom', '12px')
                $('#popup').css('top', 'auto')
                $('#popup').removeClass('ol-poprot')
                $('#popup').addClass('ol-pop')
              }

              /**
               * reset max-height property
               */

              $('#popup-content').css('max-height', 'none')

              /**
               * apply max-height property with timeout
               * to let time at the popup to be rendered
               * check if fixed.popopen === on
               * click the button to show the list
               */

              setTimeout(() => {
                const popHeight = `${($('#popup').outerHeight() - 30)}px`
                $('#popup-content').css('max-height', popHeight)

                if (fixed.popupopen === 'on') {
                  if ($('#itembutton').length > 0) {
                    $('#itembutton').click()
                  }
                }
              }, 500)
            }
            /**
             * if the result is empty hide the mobile popup
             */

            else {
              overlay.setPosition(undefined)
            }
          } // end else if screen size

          /**
           * check if the app is not FRA or PSA
           * Copy the content of the popup in the clipboard
           */

          if (fixed.app === 'parkmap' || fixed.app === 'fra_staff' || fixed.app === 'psa_staff') {
            const copyEv = () => {
              let max = ''
              if ($('#numofdivs').length > 0) {
                max = $('#numofdivs').val()
              }
              else {
                max = $('#popup-content').children().length
              }

              for (let i = 0; i < max; i++) {
                document.getElementById(`Copy_Btn_${i}`).addEventListener('click', function () {
                  // We will need a range object and a selection.
                  let contentHolder = document.getElementById(`info_${i}`)
                  // textContent
                  // hack for FF, make editable the div
                  contentHolder.setAttribute('contenteditable', 'true')
                  let range = document.createRange()
                  let selection = window.getSelection()

                  // Clear selection from any previous data.
                  selection.removeAllRanges()

                  // Make the range select the entire content of the contentHolder paragraph.
                  range.selectNodeContents(contentHolder)

                  // Add that range to the selection.
                  selection.addRange(range)

                  // Copy the selection to clipboard.
                  document.execCommand('copy')
                  // hack for FF, make not editable the div again
                  contentHolder.setAttribute('contenteditable', 'false')
                  // Clear selection if you want to.
                  selection.removeAllRanges()

                  if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                    alert('this function doesn\'t work with Firefox')
                  }
                })
              }
            }

            /**
             * run the function with a delay to let time to the popup to be rendered
             */

            setTimeout(() => {
              copyEv()
              $('[data-toggle="tooltip"]').tooltip()
            }, 300)

            /**
             * end if fixed.app !== psa
             */
          }

          /**
           *  end if 4 && 200
           * end onreadystatechange
           * end if(url)
           * end map.on(singleclick)
           */
        }
      }
    }
  })

  /**
   * pointermove event listener
   */

  view.on('pointermove', function (evt) {
    /**
     * if you are moving the map return
     */

    if (evt.dragging) {
      return
    }

    /**
     * change the style of the cursor
     */

    let pixel = view.getEventPixel(evt.originalEvent)
    let hit = view.forEachLayerAtPixel(pixel, () => {
      return true
    }, null, (layer) => {
      return layer === dataLayer
    })
    view.getTargetElement().style.cursor = hit ? 'pointer' : ''
  })

  /**
   * pointermove event listener
   */

  /**
   * remove the hover popup if the curson is not on the map
   */

  $(window).on('pointermove', function (evt) {
    let info = $('#info')
    if ($('.ol-mouse-position').text() === '000000.0, 000000.0') {
      info.html('')
    }
  })

  /**
   * pointermove event listener for the hover popup
   */

  let stillMoving = []

  view.on('pointermove', function (evt) {
    /**
     * reset the content of the hover popup
     * reset the content if you are moving the map
     */
    let info = $('#info')
    info.html('')

    if (evt.dragging) {
      info.html('')
      return
    }

    /**
     * check if another button is active
     * return to prevent to show the popup
     */

    if ($('#Marker').prop('disabled') === true || $('#Polygon').prop('disabled') === true || $('#tlruler').hasClass('removeRuler')) {
      return
    }

    /**
     * if the full info popup is in the map reset the content of the hover popup
     */

    if (overlay.getPosition() !== undefined) {
      return
    }

    /**
     * create the hover popup with delay
     */

    $(function () {
      /**
       * add my call to array
       */

      stillMoving.push(true)

      setTimeout(() => {
        /**
         * remove my call to array
         */

        stillMoving.shift()

        /**
         * check if more calls are pending
         * if yes stop propagation
         */

        if (stillMoving[0]) {
          // return
        }
        else {
          /**
           * change the style of the cursor
           */

          let pixel = view.getEventPixel(evt.originalEvent)
          let feature = view.forEachLayerAtPixel(pixel, (feature) => {
            return true
          }, null, (layer) => {
            return layer === dataLayer
          })

          /**
           * get the resolution
           * get the coordinate
           * define the layer to query
           */

          let viewResolution = view.getView().getResolution()
          let coordinate = evt.coordinate
          let url = dataLayer.getSource().getGetFeatureInfoUrl(coordinate, viewResolution, projection, {'INFO_FORMAT': 'text/html', 'FEATURE_COUNT': '10'})

          /**
           * check if feature and url is not empty
           */

          if (feature && url) {
            /**
             * send a XMLHttpRequest to the url and get back the xml files compiled
             */

            let xhttp = new XMLHttpRequest()
            xhttp.open('GET', url, true)
            xhttp.send()
            xhttp.onreadystatechange = function (aEvt) {
              /**
               * check the readyState and status
               */

              if (xhttp.readyState === 4 && xhttp.status === 200) {
                /**
                 * get the result from the XML
                 * - create a parser
                 * - parse the result
                 * - get the item element
                 */

                let parser = new window.DOMParser()
                let res = parser.parseFromString(xhttp.responseText, 'text/xml')
                let myitems = res.getElementsByTagName('item')

                /**
                 * check the length of the result
                 */

                if (myitems.length !== 0) {
                  /**
                   * check the content of the popup
                   * if it's empty return
                   */

                  if (hover(xhttp.responseText) === '') {
                    return
                  }

                  /**
                   * get the coordinate to positioning the popup
                   */

                  let coord = view.getView().calculateExtent(view.getSize())

                  /**
                   * upper half of the screen
                   */

                  if (coordinate[1] > ((coord[1] + coord[3]) / 2)) {
                    /**
                     * add correct class
                     * create the content of the popup
                     */

                    info.html(`<div class='hoverPopup hoverPoprot'>${hover(xhttp.responseText)}</div>`).fadeIn(400)

                    /**
                     * set the position of the popup
                     */

                    info.css({
                      left: `${pixel[0] + 2}px`,
                      top: `${pixel[1] + $('.hoverPopup').height() + 54}px`
                    })
                  }
                  else {
                    /**
                     * add correct class
                     * create the content of the popup
                     */

                    info.html(`<div class='hoverPopup hoverPop'>${hover(xhttp.responseText)}</div>`).fadeIn(400)

                    /**
                     * set the position of the popup
                     */

                    info.css({
                      left: `${pixel[0]}px`,
                      top: `${pixel[1]}px`
                    })
                  }
                }

                /**
                 * if myitems.length is 0
                 */

                else {
                  /**
                   * reset the content of the popup
                   */

                  info.html('')
                }

                /**
                 *  end if 4 && 200
                 * end onreadystatechange
                 * end if(feature && url)
                 * end else if (stillMoving[0])
                 */
              }
            }
          }
        }

        /**
         *  end setTimeout(() =>
         * end $(function ()
         * end pointermove event listener
         */
      }, 500)
    })
  })

  /**
   * end const infoPopup = (fixed, getSettings, view, getLayer, getOverlay) =>
   */
}

/**
 * get fields from the xml template
 */

const getFieldValue = (myitems, i, sfield) => {
  let sval = ''
  if (myitems[i].getElementsByTagName(sfield)[0].childNodes.length !== 0) {
    sval = myitems[i].getElementsByTagName(sfield)[0].firstChild.nodeValue
  }
  else {
    sval = ''
  }
  return sval
}

/**
 * nottingham
 * functions to create the list of buttons at the end of the popup
 */

/**
 * get the exemptions list
 */

let twExemptions

const getExemptions = () => {
  /**
   * get the json file
   */

  $.ajax({
    url: '/data/excodes.json',
    dataType: 'json',
    async: false
  })
    .done((data) => {
      /**
       * assing to twExemptions the data.exemptions
       */

      twExemptions = data.exemptions
    })
    .fail((jqxhr, textStatus, error) => {
      const err = `${textStatus} , ${error}`
      alert(`fixed.json for getSettings Request Failed: ${err}`)
    })
}

/**
 * build the Exemptions list
 * we need to pass the codeList, sInfoDiv, authority
 */

const buildExemptions = (codeList, sInfoDiv, authority) => {
  /**
   * split the whole list by ,
   * assing blank to exDiv and sdecode
   */

  let exList = codeList.split(',')
  let exBtn = ''
  let sdecode = ''

  for (let j = 0; j <= (exList.length - 1); j++) {
    /**
     * remove the whitespace from the beginning and end of the exList code
     * decode the excode
     */

    exList[j] = $.trim(exList[j])
    sdecode = decodeExemption(exList[j], authority)

    /**
     * check the decoded value from the previous function
     * if there is a result:
     *  - create a button
     *  - apply the value of the decode var to it
     *  - add the name of the exlist code
     * if is empty:
     *  - create a span
     *  - add the name of the exlist code
     */

    if (sdecode !== '') {
      exBtn += `<button id='exbtn_${sInfoDiv}' class='custbtn exCodeBtn' value= '${sdecode}'>${exList[j]}</button>`
    }
    else {
      exBtn += `<span class='excode'>${exList[j]}</span>`
    }
  }
  /**
   * return the exBtn
   */

  return exBtn
}

/**
 * decode the exemptions code
 * we need to pass the exemption code and the authority
 */

const decodeExemption = (theCode, authority) => {
  /**
   * assign blank to ldecode
   */

  let ldecode = ''

  /**
   * iterate through the twExemptions list
   */

  for (let h = 0; h <= (twExemptions.length - 1); h++) {
    /**
     * check if the twExemptions.code and the twExemptions.authority match
     * assing the twExemptions.desc to ldecode
     */

    if (twExemptions[h].code === theCode && twExemptions[h].authority === parseInt(authority)) {
      ldecode = twExemptions[h].desc
    }
  }
  /**
   * return ldecode
   */

  return ldecode
}

/**
 * build the popup content
 * full popup for TRO
 * we need to pass fixed, getSettings, xml, mousePos, overlay
 */

const fullInfo = (fixed, getSettings, xml, mousePos, getOverlay) => {
  /**
   * assign the popupname value
   * assign the twSettings value
   * assign the overlay value
   */

  let popupname = fixed.popupname
  let twSettings = getSettings
  let overlay = getOverlay

  /**
   * get the result from the XML
   * - create a parser
   * - parse the result
   * - get the item element
   * - get the length of the item element
   */

  let parser = new window.DOMParser()
  let url = parser.parseFromString(xml, 'text/xml')
  let featObj = url
  let myitems = featObj.getElementsByTagName('item')
  let myitemsLength = myitems.length

  /**
   * initilaize some variable to use it in the process
   */

  let conterz = ''
  let infolink = ''
  let infoDiv = ''

  /**
   * get the popup container
   *  - normal popup
   *  - mobile popup
   */

  let content = document.getElementById('popup-content')
  let modalpop = document.getElementById('mobpopupbody')

  /**
   * other variables used in the process
   */

  var btext
  var dfrom
  var dto
  var sSignFile
  var iGif
  var iPdf
  var infoms

  /**
   * if there is no result or is a moving sign return
   */

  if (myitems.length === 0 || myitems[0].attributes.getNamedItem('type').nodeValue === 'movingSign') {
    return
  }

  /**
   * create the popup content
   */

  /**
   * check if it's a FRA website
   */

  if (fixed.app === 'fra' || fixed.app === 'psa') {
    /**
     * iterate through the result
     */

    for (let i = 0; i <= (myitemsLength - 1); i++) {
      /**
       * check if the node is Confirmed
       */

      if (myitems[i].attributes.getNamedItem('type').nodeValue === 'Confirmed') {
        /**
         * check if the length of the result is more than 1
         */

        if (myitemsLength > 1) {
          /**
           * add the restriction name and the restriction to infolink
           * this will be use in the list that display all the selected restrictions
           */

          infolink = infolink + `<li value='${i}' class='itemlist resetorder order_${i}' id='listitem_${i}'>${getFieldValue(myitems, i, 'restriction')}</li>`
        }

        /**
         * append the order_ref
         * append the restriction name
         * append the street name
         */

        conterz += `<span id='Ref${i}' class='infotitle'>${getFieldValue(myitems, i, 'order_ref')}</span><br>`
        conterz += `<span class='Type${i}'>${getFieldValue(myitems, i, 'restriction')}</span><br>`
        conterz += `<span class='Type${i}'>${getFieldValue(myitems, i, 'street_name')}</span>`
      }

      /**
       * check if the node is FRA
       */

      if (myitems[i].attributes.getNamedItem('type').nodeValue === 'fra') {
        /**
         * check if the node is Confirmed
         */

        if (myitemsLength > 1) {
          /**
           * add the restriction name and the street name to infolink
           * this will be use in the list that display all the selected restrictions
           */

          infolink = infolink + `<li value='${i}' class='itemlist resetorder order_${i}' id='listitem_${i}'>${getFieldValue(myitems, i, 'fref')}</li>`
        }

        /**
         * append the Fra ref
         */

        conterz += `<span id='Ref${i}' class='infotitle'>Ref: <span class='infotitle_norm'>${getFieldValue(myitems, i, 'fref')}</span></span><br>`

        /**
         * get the fstatus
         * convert the fstatus to the correct status
         */

        let iStatus = parseInt(getFieldValue(myitems, i, 'fstatus'))
        let stmp = ''

        if (iStatus === 1) {
          stmp = 'Pending'
        }
        else if (iStatus === 2) {
          stmp = 'Complete'
        }
        else if (iStatus === 3) {
          stmp = 'Expired'
        }

        /**
         * append the correct status
         */

        conterz += `<span id='Status${i}' class='infotitle'>Status: <span class='infotitle_norm'>${stmp}</span></span><br>`

        /**
         * get the timestamp
         * change the format of the date
         * append the correct date
         * append the fcomment field
         */

        let tstamp = (myitems[i].getElementsByTagName('tstamp')[0].firstChild.nodeValue).split(' ')
        tstamp = `${tstamp[0].split('-').reverse().join('/')} ${tstamp[1]}`

        conterz += `<span id='tstamp${i}' class='infotitle'>Log Date: <span class='infotitle_norm'>${tstamp}</span></span><br>`
        conterz += `<span id='Comment${i}' class='infotitle'>Comment: <span class='infotitle_norm'>${getFieldValue(myitems, i, 'fcomment')}</span></span>`

        /**
         * check if the node is photo
         */
        if (getFieldValue(myitems, i, 'photo')) {
          if (window.location.href.indexOf('localhost') > -1) {
            conterz += `<span id='Photo${i}' class='popPhoto'><a href="https://www.traffwebdev.uk/fra/${getFieldValue(myitems, i, 'photo')}" target='_blank' rel='noopener noreferrer'><img src='https://www.traffwebdev.uk/fra/${getFieldValue(myitems, i, 'photo')}'></a></span>`
          }
          else {
            conterz += `<span id='Photo${i}' class='popPhoto'><a href="${getFieldValue(myitems, i, 'photo')}" target='_blank' rel='noopener noreferrer'><img src='${getFieldValue(myitems, i, 'photo')}'></a></span>`
          }
        }
      }

      /**
       * check if is the first iteration, first result or not
       * append the correct div to the popup content
       */

      if (i === 0) {
        infoDiv = infoDiv + `<div id='info_${i}'>${conterz}</div>`
      }
      else {
        infoDiv = infoDiv + `<div id='info_${i}' style='display:none;'>${conterz}</div>`
      }

      /**
       * reset the conterz var as now is inside the infoDiv var
       */

      conterz = ''
    } // next feature
  }

  /**
   * check if it's a FRA PSA staff website
   */

  else if (fixed.app === 'fra_staff' || fixed.app === 'psa_staff') {
    /**
     * iterate through the result
     */

    for (let i = 0; i <= (myitemsLength - 1); i++) {
      /**
       * check if the node is fra
       */

      if (myitems[i].attributes.getNamedItem('type').nodeValue === 'fra') {
        /**
         * check if the length of the result is more than 1
         */

        if (myitemsLength > 1) {
          /**
           * add the restriction name and the fref to infolink
           * this will be use in the list that display all the selected restrictions
           */

          infolink = infolink + `<li value='${i}' class='itemlist resetorder order_${i}' id='listitem_${i}'>Fault Ref: ${getFieldValue(myitems, i, 'fref')}</li>`
        }

        /**
         * get the status save it in a variable
         * get the action save it in a variable
         * modify the action if it's empty
         */
        let status = getFieldValue(myitems, i, 'fstatus')
        let action = getFieldValue(myitems, i, 'faction')

        if (action === '') {
          action = 'Enter an action.'
        }

        /**
         * get the exp date and change the date format
         * get the date stamp and change the date format
         * get the date stamp and split it by space
         */

        let expdate = (myitems[i].getElementsByTagName('expdate')[0].firstChild.nodeValue).split('-').reverse().join('/')
        let datimstamp = (myitems[i].getElementsByTagName('tstamp')[0].firstChild.nodeValue).split(' ')
        datimstamp = `${datimstamp[0].split('-').reverse().join('/')} ${datimstamp[1]}`

        let dstamp = getFieldValue(myitems, i, 'tstamp').split(' ')

        /**
         * add the fref field
         * add the expdate var
         * add the datimstamp var
         * add the fcomment field
         */

        conterz += `<div><span class='infotitle'>Ref: </span><span class='infotitle_norm'>${getFieldValue(myitems, i, 'fref')}</span></div>`
        conterz += `<div><span class='infotitle'>Expiry: </span><span class='infotitle_norm'>${expdate}</span></div>`
        conterz += `<div><span class='infotitle'>Log Time: </span><span class='infotitle_norm'>${datimstamp}</span></div>`
        conterz += `<div><span class='infotitle'>Comment: </span><span class='infotitle_norm'>${getFieldValue(myitems, i, 'fcomment')}</span></div>`

        /**
         * check if the node photo is not empty
         * check if it's a dev environment or live
         * append the photo to the popup
         */

        if (getFieldValue(myitems, i, 'photo')) {
          if (window.location.href.indexOf('localhost') > -1) {
            conterz += `<span id='Photo${i}' class='popPhoto'><a href='https://www.traffwebdev.uk/fra/${getFieldValue(myitems, i, 'photo')}' target='_blank' rel='noopener noreferrer'><img src='https://www.traffwebdev.uk/fra/${getFieldValue(myitems, i, 'photo')}'></a></span>`
          }
          else {
            conterz += `<span id='Photo${i}' class='popPhoto'><a href='/fra/${getFieldValue(myitems, i, 'photo')}' target='_blank' rel='noopener noreferrer'><img src='/fra/${getFieldValue(myitems, i, 'photo')}'></a></span>`
          }
        }

        /**
         * append the Action text plus the button to edit
         * append the action field
         */

        conterz += `<div><span class='infotitle'>Action: </span><button id='${getFieldValue(myitems, i, 'fref')}__${getFieldValue(myitems, i, 'fstatus')}__${dstamp}__${action}' class='edit-action custbtn fa fa-pencil'></button></div>`
        conterz += `<div class='actiondiv'><span class='action' id='action_${i}'>${action}</span></div>`

        /**
         * append a spacer
         */
        conterz += `<div class='spacer'></div>`

        /**
         * append the correct list of buttons
         */

        if (status === '1') {
          conterz += `<ul id='stat_${i}' class='togle'>`
          conterz += `<li class='myview' value='1'><label class='container'>Pending<input type='radio' name='radio' checked='checked'><span class='checkmark'></span></label></li>`
          conterz += `<li class='myview' value='2'><label class='container'>Complete<input type='radio' name='radio'><span class='checkmark'></span></label></li>`
          conterz += `<li class='myview' value='3'><label class='container'>Expired<input type='radio' name='radio'><span class='checkmark'></span></label></li></ul>`
        }
        if (status === '2') {
          conterz += `<ul id='stat_${i}' class='togle'>`
          conterz += `<li class='myview' value='1'><label class='container'>Pending<input type='radio' name='radio'><span class='checkmark'></span></label></li>`
          conterz += `<li class='myview' value='2'><label class='container'>Complete<input type='radio' name='radio' checked='checked'><span class='checkmark'></span></label></li>`
          conterz += `<li class='myview' value='3'><label class='container'>Expired<input type='radio' name='radio'><span class='checkmark'></span></label></li></ul>`
        }
        if (status === '3') {
          conterz += `<ul id='stat_${i}' class='togle'>`
          conterz += `<li class='myview' value='1'><label class='container'>Pending<input type='radio' name='radio'><span class='checkmark'></span></label></li>`
          conterz += `<li class='myview' value='2'><label class='container'>Complete<input type='radio' name='radio'><span class='checkmark'></span></label></li>`
          conterz += `<li class='myview' value='3'><label class='container'>Expired<input type='radio' name='radio' checked='checked'><span class='checkmark'></span></label></li></ul>`
        }

        /**
         * append the delete button
         * append the update button
         */

        conterz += `<button id='${getFieldValue(myitems, i, 'fref')}_${dstamp}' class='custbtn delete fraDelete'>Delete</button>`
        conterz += `<button class='custbtn save fraSave' id='${getFieldValue(myitems, i, 'fref')}_${getFieldValue(myitems, i, 'fstatus')}_${dstamp}_${action}'>Save</button>`

        /**
         * end fra popup
         */
      }

      /**
       * check if the node is psa
       */

      else if (myitems[i].attributes.getNamedItem('type').nodeValue === 'psa') {
        /**
         * check if the length of the result is more than 1
         */

        if (myitemsLength > 1) {
          /**
           * add the restriction name and the suspid to infolink
           * this will be use in the list that display all the selected restrictions
           */

          infolink = infolink + `<li value='${i}' class='itemlist resetorder order_${i}' id='listitem_${i}'>Application: ${getFieldValue(myitems, i, 'suspid')}</li>`
        }

        /**
         * get the exp date and change the date format
         * get the date stamp and change the date format
         * get the date stamp and split it by space
         */

        let dexpdate = (myitems[i].getElementsByTagName('expdate')[0].firstChild.nodeValue).split('-').reverse().join('/')
        let datimstamp = (myitems[i].getElementsByTagName('tstamp')[0].firstChild.nodeValue).split(' ')
        datimstamp = `${datimstamp[0].split('-').reverse().join('/')} ${datimstamp[1].split('.')[0]}`

        let dstamp = getFieldValue(myitems, i, 'tstamp').split(' ')

        /**
         * add the suspid field
         * add the expdate var
         * add the datimstamp var
         */

        conterz += `<div><span class='infotitle'>ID: </span><span class='infotitle_norm'>${getFieldValue(myitems, i, 'suspid')}</span></div>`
        conterz += `<div><span class='infotitle'>Expiry: </span><span class='infotitle_norm'>${dexpdate}</span></div>`
        conterz += `<div><span class='infotitle'>Log Time: </span><span class='infotitle_norm'>${datimstamp}</span></div>`

        /**
         * append the delete button
         */

        conterz += `<br /><button id='${getFieldValue(myitems, i, 'suspid')}_${dstamp}' class='custbtn psadelbtn'>Delete</button>`

        /**
         * end psa popup
         */
      }

      /**
       * else if it's a parkmap popup
       */

      else {
        /**
         * check if the length of the result is more than 1
         */

        if (myitemsLength > 1) {
          /**
           * add the restriction name and the restriction and street name to infolink
           * this will be use in the list that display all the selected restrictions
           */

          infolink = infolink + `<li value='${i}' class='itemlist resetorder order_${i}' id='listitem_${i}'>${getFieldValue(myitems, i, 'restriction')} ${getFieldValue(myitems, i, 'street_name')}</li>`
        }

        /**
         * chekc if order_doc it's not empty
         */

        if (myitems[i].getElementsByTagName('order_doc')[0].childNodes.length !== 0) {
          /**
           * check if:
           *  - it 's traffwebdemo
           *  - it's a localhost
           *  - it's a live system
           * append the order_doc field
           */

          if (window.location.href.indexOf('traffwebdemo') > -1) {
            conterz += `<div><a href='https://www.traffwebdemo.co.uk/parking/"${fixed.sched}${myitems[i].getElementsByTagName('order_doc')[0].firstChild.nodeValue}' target=_blank rel='noopener noreferrer' class='infobutt custbtn'>Schedule Document</a></div>`
          }
          else if (window.location.href.indexOf('localhost') > -1) {
            conterz += `<div><a href='https://www.traffwebdev.uk/parking/${fixed.sched}${myitems[i].getElementsByTagName('order_doc')[0].firstChild.nodeValue}' target=_blank rel='noopener noreferrer' class='infobutt custbtn'>Schedule Document</a></div>`
          }
          else {
            conterz += `<div><a href='${fixed.sched}${myitems[i].getElementsByTagName('order_doc')[0].firstChild.nodeValue}' target=_blank rel='noopener noreferrer' class='infobutt custbtn'>Schedule Document</a></div>`
          }
        }

        /**
         * append the order_ref field
         * append the street_name field
         * append the restriction field
         */

        conterz += `<div><span>${getFieldValue(myitems, i, 'order_ref')}&nbsp</span>`
        conterz += `<span>${getFieldValue(myitems, i, 'street_name')}</span></div>`
        conterz += `<div><span>${getFieldValue(myitems, i, 'restriction')}</span></div>`

        /**
         * append a spacer
         */

        conterz += `<div class='spacer'></div>`

        /**
         * append the ordstart and ordfinish field
         * append a spacer
         */

        conterz += `<div><span>${getFieldValue(myitems, i, 'ordstart')} ${getFieldValue(myitems, i, 'ordfinish')}</span></div>`
        conterz += `<div class='spacer'></div>`

        /**
         * get the date_from
         * get the date_to
         */

        dfrom = (myitems[i].getElementsByTagName('date_from')[0].firstChild.nodeValue).split('-').reverse().join('/')
        dto = (myitems[i].getElementsByTagName('date_to')[0].firstChild.nodeValue).split('-').reverse().join('/')

        /**
         * check the date_to date
         * append the correct text
         */

        if (dto !== undefined && dto !== '01/01/2199' && dto !== '') {
          conterz += `<div><span>Effective from ${dfrom} to ${dto}</span></div>`
        }
        else {
          conterz += `<div><span>Effective from ${dfrom} to the present day</span></div>`
        }

        /**
         * check if the district field is not empty
         * append the correct text
         */

        if (myitems[i].getElementsByTagName('district')[0].childNodes.length !== 0) {
          conterz += `<div><span>${getFieldValue(myitems, i, 'street_name')}, ${getFieldValue(myitems, i, 'district')}</span></div>`
        }
        else {
          conterz += `<div class='accsize' style='width:260px;'><span class='accsize'>${getFieldValue(myitems, i, 'street_name')}</span></div>`
        }

        /**
         * append the Data correct at time of publication (twSettings.publishdate) text
         */

        conterz += `<div class='accsize'><span class='accsize'>Data correct at time of publication (${twSettings.publishdate})</span></div>`

        /**
         * check if blockimagefile it's not empty
         * append the correct text
         */

        if (myitems[i].getElementsByTagName('blockimagefile')[0].childNodes.length !== 0) {
          sSignFile = getFieldValue(myitems, i, 'blockimagefile')
          iGif = -1
          iPdf = -1
          iGif = sSignFile.indexOf('.gif')
          iPdf = sSignFile.indexOf('.pdf')

          if (iGif !== -1) {
            if (window.location.href.indexOf('traffwebdemo') !== -1) {
              conterz += `<div><img src='../parking/data/signs/${sSignFile}'/></div>`
            }
            else {
              conterz += `<div><img src='../images/signs/${sSignFile}'/></div>`
            }
          }
          if (iPdf !== -1) {
            conterz += `<div><a href='../data/parkmap/pdfs/${sSignFile}' target=_blank  rel='noopener noreferrer'>View pdf</a></div>`
          }
        }

        /**
         * end parkmap popup
         */
      }

      /**
       * copy button
       */

      conterz += `<button id='Copy_Btn_${i}' class='Copy_Btn btn mt-1 fa fa-clipboard' style='width:auto;' data-toggle="tooltip" data-container="#Copy_Btn_${i}" data-placement="top" title="Copy content to clipboard"></button>`

      /**
       * check if is the first iteration, first result or not
       * append the correct div to the popup content
       */

      if (i === 0) {
        infoDiv = infoDiv + `<div id='info_${i}'>${conterz}</div>`
      }
      else {
        infoDiv = infoDiv + `<div id='info_${i}' style='display:none;'>${conterz}</div>`
      }

      /**
       * reset the conterz var as now is inside the infoDiv var
       */

      conterz = ''
    } // next feature

    /**
     * end if fixed.app === fra_staf or psa_staff
     */
  }

  /**
   * else if it's a parkmap popup
   */

  else {
    /**
     * nottingham popup
     */

    if (popupname === 'nottingham') {
      /**
       * iterate through the result
       */

      for (let i = 0; i <= (myitemsLength - 1); i++) {
        /**
         * check if the node is Confirmed
         */

        if (myitems[i].attributes.getNamedItem('type').nodeValue === 'Confirmed') {
          /**
           * check if the length of the result is more than 1
           */

          if (myitemsLength > 1) {
            /**
             * add the restriction name and the street name to infolink
             * this will be use in the list that display all the selected restrictions
             */

            infolink = infolink + `<li value='${i}' class='itemlist resetorder order_${i}' id='listitem_${i}'>${getFieldValue(myitems, i, 'restriction')} ${getFieldValue(myitems, i, 'street_name')}</li>`
          }

          /**
           * check for the additonalinfo value
           */

          if (myitems[i].getElementsByTagName('addinfo')[0].childNodes.length !== 0) {
            /**
             * get the additonalinfo value
             * append it to the popup content
             */

            btext = myitems[i].getElementsByTagName('addinfo')[0].attributes[0].nodeValue
            conterz = conterz + `<div><a class='infobutt custbtn' target='_blank' rel='noopener noreferrer' href='${getFieldValue(myitems, i, 'addinfo')}'>${btext}</a></div>`
          }

          /**
           * store the ms_grid and order_ref in a hidden input
           * create the titles
           */

          conterz += `<input id='msgrid_${i}' type='hidden' value='${getFieldValue(myitems, i, 'ms_grid')}'/>`
          conterz += `<input id='orderref_${i}' type='hidden' value='${getFieldValue(myitems, i, 'order_ref')}'/>`

          conterz += `<div class='infotitle infotab'><span>${getFieldValue(myitems, i, 'order_ref')}&nbsp</span>`
          conterz += `<span class='custflotitle'>Schedule: ${getFieldValue(myitems, i, 'street_name')}</span></div>`

          /**
           * check if the node is Controlled Parking Zones
           * append a fixed text
           */

          if (getFieldValue(myitems, i, 'order_type') === 'Controlled Parking Zones') {
            conterz += "<div><span class='infotitle'>Controlled Parking Zone</span></div>"
          }

          /**
           * append the restriction name and a space
           */

          conterz += `<div><span>${getFieldValue(myitems, i, 'restriction')}</span></div>`
          conterz += `<div class='spacer'></div>`

          /**
           * check if the restriction is a region or a type
           */

          if (getFieldValue(myitems, i, 'entry_type') === 'Region' || getFieldValue(myitems, i, 'entry_type') === 'Point') {
            /**
             * append the ordlocation
             */

            if (getFieldValue(myitems, i, 'ordlocation') !== '') {
              conterz += `<div><span>${getFieldValue(myitems, i, 'ordlocation')}</span></div>`
            }
          }
          /**
           * if is a line restriction
           */

          else {
            /**
             * check the ordstart value
             * if is not empty append the ordstart and ordfinish value
             */

            if (getFieldValue(myitems, i, 'ordstart') !== '') {
              conterz += `<div><span>${getFieldValue(myitems, i, 'ordstart')} ${getFieldValue(myitems, i, 'ordfinish')}</span></div>`
            }
          }

          /**
           * get the from/to date
           * append the correct text
           */

          dfrom = (myitems[i].getElementsByTagName('date_from')[0].firstChild.nodeValue).split('-').reverse().join('/')
          dto = (myitems[i].getElementsByTagName('date_to')[0].firstChild.nodeValue).split('-').reverse().join('/')

          if (dto !== undefined && dto !== '01/01/2199' && dto !== '') {
            conterz += `<div><span>Effective from ${dfrom} to ${dto}</span></div>`
          }
          else {
            conterz += `<div><span>Effective from ${dfrom} to the present day</span></div>`
          }

          /**
           * check if the district field is not empty
           * append the correct text
           */

          if (myitems[i].getElementsByTagName('district')[0].childNodes.length !== 0) {
            conterz += `<div><span>${getFieldValue(myitems, i, 'street_name')}, ${getFieldValue(myitems, i, 'district')}</span></div>`
          }
          else {
            conterz += `<div><span>${getFieldValue(myitems, i, 'street_name')}</span></div>`
          }

          /**
           * append a newline
           */

          conterz += '<br />'

          /**
           * check the times_of_enforcement field
           */

          if (myitems[i].getElementsByTagName('times_of_enforcement')[0].childNodes.length !== 0) {
            /**
             * create the exemptions list
             * append it to the popup content
             */

            let tExemp = buildExemptions(getFieldValue(myitems, i, 'times_of_enforcement'), i, getFieldValue(myitems, i, 'authority'))
            conterz += `<div><span class='infotitle exemtitle'>Exemptions: </span><div class='tExempDiv'>${tExemp}</div><p id='exDesc_${i}' oldval='none' style='width:100%; display:none;'></p></div>`
          }

          /**
           * check the pre_description field
           * append the correct text
           */

          if (myitems[i].getElementsByTagName('pre_description')[0].childNodes.length !== 0) {
            conterz += `<div><span class='infotitle'>Permit Area: </span><span>${getFieldValue(myitems, i, 'pre_description')}</span></div>`
          }

          /**
           * check the post_description field
           * append the correct text
           */

          if (myitems[i].getElementsByTagName('post_description')[0].childNodes.length !== 0) {
            conterz += `<div><span class='infotitle'>Zone: </span><span>${getFieldValue(myitems, i, 'post_description')}</span></div>`
          }

          /**
           * append the Data correct at time of publication (date) text
           */

          conterz += `<div><span>Data correct at time of publication (${twSettings.publishdate})</span></div>`

          /**
           * check the blockimagefile field
           */

          if (myitems[i].getElementsByTagName('blockimagefile')[0].childNodes.length !== 0) {
            /**
             * get the blockimagefile value
             * check for the presence of gif or pdf in the name
             * append the correct text
             */

            sSignFile = getFieldValue(myitems, i, 'blockimagefile')
            iGif = -1
            iPdf = -1
            iGif = sSignFile.indexOf('.gif')
            iPdf = sSignFile.indexOf('.pdf')

            if (iGif !== -1) {
              conterz += `<div><img src='data/signs/${sSignFile}'/></div>`
            }
            if (iPdf !== -1) {
              conterz += `<div><a href='data/parkmap/pdfs/${sSignFile}' target=_blank rel='noopener noreferrer'>View pdf</a></div>`
            }
          }

          /**
           * append the view documents button
           * it will be populate at the end of the function
           */

          infoms = `<div style='display:none' id='docstore_${i}'><button class='infobutt custbtn'  id='docbutton_${i}'>View Documents...</button><div id='docdiv_${i}' style='display:none'></div></div>`

          /**
           * end if Confirmed node
           */
        }
        /**
         * check if the node is tariff zones or parking zones
         */

        else if (myitems[i].attributes.getNamedItem('type').nodeValue === 'Tariff Zones' || myitems[i].attributes.getNamedItem('type').nodeValue === 'Parking Zones') {
          /**
           * check if the length of the result is more than 1
           */

          if (myitemsLength > 1) {
            /**
             * add the polygon name to infolink
             * this will be use in the list that display all the selected restrictions
             */

            infolink = infolink + `<li value='${i}' class='itemlist resetorder order_${i}' id='listitem_${i}'>${getFieldValue(myitems, i, 'polyname')}</li>`
          }

          /**
           * append the polygon name
           * append the polygon info
           * append the Data correct at time of publication (date) text
           * assign blank value to infoms, no document allowed in this node
           */

          conterz += `<div><span>${getFieldValue(myitems, i, 'polyname')}</span></div>`
          conterz += `<div><span>${getFieldValue(myitems, i, 'poly_info')}</span></div>`
          conterz += `<div><span>Data correct at time of publication (${twSettings.publishdate})</span></div>`
          infoms = ''
        }
        /**
         * check if the node is a zone address
         */

        else if (myitems[i].attributes.getNamedItem('type').nodeValue === 'Zone Address') {
          /**
           * check if the length of the result is more than 1
           */

          if (myitemsLength > 1) {
            /**
             * add the property name to infolink
             * this will be use in the list that display all the selected restrictions
             */

            infolink = infolink + `<li value='${i}' class='itemlist resetorder order_${i}' id='listitem_${i}'>${getFieldValue(myitems, i, 'property')}</li>`
          }

          /**
           * append the property name
           * append the street name
           * append the Data correct at time of publication (date) text
           * assign blank value to infoms, no document allowed in this node
           */

          conterz += `<div><span class='accsize'>${getFieldValue(myitems, i, 'property')}</span></div>`
          conterz += `<div><span class='accsize'>${getFieldValue(myitems, i, 'street')}</span></div>`
          conterz += `<div><span>Data correct at time of publication (${twSettings.publishdate})</span></div>`
          infoms = ''
        }

        /**
         * copy button
         */

        conterz += `<button id='Copy_Btn_${i}' class='Copy_Btn btn mt-1 fa fa-clipboard' style='width:auto;' data-toggle="tooltip" data-container="#Copy_Btn_${i}" data-placement="top" title="Copy content to clipboard"></button>`

        /**
         * check if is the first iteration, first result or not
         * append the correct div to the popup content
         */

        if (i === 0) {
          infoDiv = infoDiv + `<div id='info_${i}'>${infoms}${conterz}</div>`
        }
        else {
          infoDiv = infoDiv + `<div id='info_${i}' style='display:none;'>${infoms}${conterz}</div>`
        }

        /**
         * reset the conterz var as now is inside the infoDiv var
         */

        conterz = ''
      } // next feature

    /**
     * finish nottingham popup
     */
    }

    /**
     * hackney popup
     */

    else if (popupname === 'hackney') {
      /**
       * iterate through the result
       */

      for (let i = 0; i <= (myitemsLength - 1); i++) {
        /**
         * check if the length of the result is more than 1
         */

        if (myitemsLength > 1) {
          /**
           * add the restriction name and the street name to infolink
           * this will be use in the list that display all the selected restrictions
           */
          infolink = infolink + `<li value='${i}' class='itemlist resetorder order_${i}' id='listitem_${i}'>${getFieldValue(myitems, i, 'restriction')} ${getFieldValue(myitems, i, 'street_name')}</li>`
        }

        /**
         * check for the additonalinfo value
         */

        if (myitems[i].getElementsByTagName('addinfo')[0].childNodes.length !== 0) {
          /**
           * get the additonalinfo value
           * append it to the popup content
           */

          btext = myitems[i].getElementsByTagName('addinfo')[0].attributes[0].nodeValue
          conterz = conterz + `<div><a class='infobutt custbtn' target=_blank rel='noopener noreferrer' href='${getFieldValue(myitems, i, 'addinfo')}'>${btext}</a></div>`
        }

        /**
         * store the ms_grid and order_ref in a hidden input
         */

        conterz += `<input id='msgrid_${i}' type='hidden' value='${getFieldValue(myitems, i, 'ms_grid')}'/>`
        conterz += `<input id='orderref_${i}' type='hidden' value='${getFieldValue(myitems, i, 'order_ref')}'/>`

        /**
         * check the times_of_enforcement value
         * append the correct text
         */

        if (getFieldValue(myitems, i, 'times_of_enforcement') !== '(None)') {
          conterz += `<div><span>${getFieldValue(myitems, i, 'times_of_enforcement')}</span></div>`
        }

        /**
         * append the pre_description value
         * append the post_description value
         * append the tariff value
         */

        conterz += `<div><span>${getFieldValue(myitems, i, 'pre_description')}</span></div>`
        conterz += `<div><span>${getFieldValue(myitems, i, 'post_description')}</span></div>`
        conterz += `<div><span>${getFieldValue(myitems, i, 'tariff')}</span></div>`

        /**
         * get the from/to date
         * append the correct text
         */

        dfrom = (myitems[i].getElementsByTagName('date_from')[0].firstChild.nodeValue).split('-').reverse().join('/')
        dto = (myitems[i].getElementsByTagName('date_to')[0].firstChild.nodeValue).split('-').reverse().join('/')

        if (dto !== undefined && dto !== '01/01/2199' && dto !== '') {
          conterz += `<div><span>Effective from ${dfrom} to ${dto}</span></div>`
        }
        else {
          conterz += `<div><span>Effective from ${dfrom} to the present day</span></div>`
        }

        /**
         * append the Data correct at time of publication (date) text
         */

        conterz += `<div><span>Data correct at time of publication (${twSettings.publishdate})</span></div>`

        /**
         * get the blockimagefile value
         * check for the presence of gif or pdf in the name
         * append the correct text
         */

        if (myitems[i].getElementsByTagName('blockimagefile')[0].childNodes.length !== 0) {
          sSignFile = getFieldValue(myitems, i, 'blockimagefile')
          iGif = -1
          iPdf = -1
          iGif = sSignFile.indexOf('.gif')
          iPdf = sSignFile.indexOf('.pdf')

          if (iGif !== -1) {
            conterz += `<div>img src='images/signs/${sSignFile}'/></div>`
          }
          if (iPdf !== -1) {
            conterz += `<div><a href='data/parkmap/pdfs/${sSignFile}' target=_blank rel='noopener noreferrer'>View pdf</a></div>`
          }
        }

        /**
         * append the view documents button
         * it will be populate at the end of the function
         */

        infoms = `<div style='display:none' id='docstore_${i}'><button class='infobutt custbtn' id='docbutton_${i}'>View Documents...</button><div id='docdiv_${i}' style='display:none'></div></div>`

        /**
         * append the order_ref value
         * append the street_name value
         */

        conterz += `<div><span class='infotitle'>${getFieldValue(myitems, i, 'order_ref')}&nbsp</span>`
        conterz += `<span class='infotitle'>${getFieldValue(myitems, i, 'street_name')}</span></div>`

        /**
         * copy button
         */

        conterz += `<button id='Copy_Btn_${i}' class='Copy_Btn btn mt-1 fa fa-clipboard' style='width:auto;' data-toggle="tooltip" data-container="#Copy_Btn_${i}" data-placement="top" title="Copy content to clipboard"></button>`

        /**
         * check if is the first iteration, first result or not
         * append the correct div to the popup content
         */

        if (i === 0) {
          infoDiv = infoDiv + `<div id='info_${i}'>${infoms}${conterz}</div>`
        }
        else {
          infoDiv = infoDiv + `<div id='info_${i}' style='display:none;'>${infoms}${conterz}</div>`
        }
        /**
         * reset the conterz var as now is inside the infoDiv var
         */

        conterz = ''
      } // next feature

      /**
       * finish hackney popup
       */
    }

    /**
     * standard popup
     */

    else {
      /**
       * iterate through the result
       */

      for (let i = 0; i <= (myitemsLength - 1); i++) {
        /**
         * check if the node is Confirmed
         */

        if (myitems[i].attributes.getNamedItem('type').nodeValue === 'Confirmed') {
          /**
           * check if the length of the result is more than 1
           */

          if (myitemsLength > 1) {
            /**
             * add the restriction name and the street name to infolink
             * this will be use in the list that display all the selected restrictions
             */

            infolink = infolink + `<li value='${i}' class='itemlist resetorder order_${i}' id='listitem_${i}'>${getFieldValue(myitems, i, 'restriction')} ${getFieldValue(myitems, i, 'street_name')}</li>`
          }

          /**
           * check for the additonalinfo value
           */

          if (myitems[i].getElementsByTagName('addinfo')[0].childNodes.length !== 0) {
            /**
             * get the additonalinfo value
             * append it to the popup content
             */

            btext = myitems[i].getElementsByTagName('addinfo')[0].attributes[0].nodeValue
            conterz = conterz + `<div><a class='infobutt custbtn' target='_blank' rel='noopener noreferrer' href='${getFieldValue(myitems, i, 'addinfo')}'>${btext}</a></div>`
          }

          /**
           * store the ms_grid and order_ref in a hidden input
           */

          conterz += `<input id='msgrid_${i}' type='hidden' value='${getFieldValue(myitems, i, 'ms_grid')}'/>`
          conterz += `<input id='orderref_${i}' type='hidden' value='${getFieldValue(myitems, i, 'order_ref')}'/>`

          /**
           * check if it's not the enfield popup
           * check for the schedule value
           */

          if (popupname !== 'enfield') {
            if (getFieldValue(myitems, i, 'schedule') !== '') {
              /**
               * append the order_ref value
               */

              conterz += `<div class='infotitle infotab'><span>${getFieldValue(myitems, i, 'order_ref')}&nbsp</span>`

              /**
               * check the popup name
               */

              if (popupname === 'cumbria' || popupname === 'dorset' || popupname === 'northampton') {
                /**
                 * append the schedule value with a float class
                 */

                conterz += `<span class='custflotitle'>Schedule: ${getFieldValue(myitems, i, 'schedule')}</span></div>`
              }
              /**
               * else if standard popup
               */

              else {
                /**
                 * append the schedule value with no float class
                 */

                conterz += `<span> Schedule: ${getFieldValue(myitems, i, 'schedule')}</span></div>`
              }
            }

            /**
             * else if schedule value is empty
             */

            else {
              /**
               * append the order_ref value
               */

              conterz += `<div class='infotitle infotab'><span>${getFieldValue(myitems, i, 'order_ref')}&nbsp</span>`

              /**
               * check the popup name
               */

              if (popupname === 'cumbria' || popupname === 'dorset' || popupname === 'northampton' || popupname === 'stoke') {
                /**
                 * append the strret_name value with a float class
                 */

                conterz += `<span class='custflotitle'>${getFieldValue(myitems, i, 'street_name')}</span></div>`
              }

              /**
               * else if standard popup
               */

              else {
                /**
                 * append the street_name value with no float class
                 */

                conterz += `<span>${getFieldValue(myitems, i, 'street_name')}</span></div>`
              }

              /**
               * end check schedule value
               * end if (popupname !== 'enfield')
               */
            }
          }

          /**
           * append restriction value
           */

          conterz += `<div><span>${getFieldValue(myitems, i, 'restriction')}</span></div>`

          /**
           * check if popup is bexley
           */
          if (window.location.href.indexOf('bexley') > -1 && window.location.pathname.indexOf('plus/main.php') === -1) {
            /**
             * append a space div
             */

            conterz += `<div class='spacer'></div>`
          }
          else {
            /**
             * append a space div
             */

            conterz += `<div class='spacer'></div>`

            /**
             * check if the restriction is a region or a point
             */

            if (getFieldValue(myitems, i, 'entry_type') === 'Region' || getFieldValue(myitems, i, 'entry_type') === 'Point') {
              /**
               * check the ordlocation value
               */

              if (getFieldValue(myitems, i, 'ordlocation') !== '') {
                /**
                 * append the ordlocation
                 */

                conterz += `<div><span>${getFieldValue(myitems, i, 'ordlocation')}</span></div>`
              }
            }

            /**
             * if is a line restriction
             */

            else {
              /**
               * check the ordstart value
               * if is not empty append the ordstart and ordfinish value
               */

              if (getFieldValue(myitems, i, 'ordstart') !== '') {
                conterz += `<div><span>${getFieldValue(myitems, i, 'ordstart')} ${getFieldValue(myitems, i, 'ordfinish')}</span></div>`
              }
            }

            /**
             * check the tariff value
             * if is not empty append the tariff value
             */

            if (getFieldValue(myitems, i, 'tariff') !== '') {
              conterz += `<div class='infotitle'><span>Tariff: </span><span>${getFieldValue(myitems, i, 'tariff')}</span></div>`
            }

            /**
             * check the pcode value
             * if is not empty append the pcode value with tariff code text and a link to the document
             */

            if (getFieldValue(myitems, i, 'pcode') !== '') {
              conterz += `<div><a href='${fixed.sched}FeesandCharges.pdf' class='infonav'>Tariff Code: ${getFieldValue(myitems, i, 'pcode')}</a></div>`
            }

            /**
             * ende if/else bexley popup
             */
          }

          /**
           * get the from/to date
           * append the correct text
           */

          dfrom = (myitems[i].getElementsByTagName('date_from')[0].firstChild.nodeValue).split('-').reverse().join('/')
          dto = (myitems[i].getElementsByTagName('date_to')[0].firstChild.nodeValue).split('-').reverse().join('/')

          if (popupname !== 'enfield') {
            if (dto !== undefined && dto !== '01/01/2199' && dto !== '') {
              conterz += `<div><span>Effective from ${dfrom} to ${dto}</span></div>`
            }
            else {
              conterz += `<div><span>Effective from ${dfrom} to the present day</span></div>`
            }
          }

          /**
           * check the district value
           */

          if (myitems[i].getElementsByTagName('district')[0].childNodes.length !== 0) {
            /**
             * append the district and district value
             */

            conterz += `<div><span>${getFieldValue(myitems, i, 'street_name')}, ${getFieldValue(myitems, i, 'district')}</span></div>`
          }

          /**
           * if district value is empty
           */

          else {
            /**
             * append the street_name value
             */

            conterz += `<div><span>${getFieldValue(myitems, i, 'street_name')}</span></div>`
          }

          /**
           * append the Data correct at time of publication (date) text
           */

          conterz += `<div><span>Data correct at time of publication <time>${twSettings.publishdate}<time></span></div>`

          /**
           * get the blockimagefile value
           * check for the presence of gif or pdf in the name
           * append the correct text
           */

          if (myitems[i].getElementsByTagName('blockimagefile')[0].childNodes.length !== 0) {
            sSignFile = getFieldValue(myitems, i, 'blockimagefile')
            iGif = -1
            iPdf = -1
            iGif = sSignFile.indexOf('.gif')
            iPdf = sSignFile.indexOf('.pdf')

            if (iGif !== -1) {
              conterz += `<div><img src='data/signs/${sSignFile}'/></div>`
            }
            if (iPdf !== -1) {
              conterz += `<div><a href='data/parkmap/pdfs/${sSignFile}' target='_blank' rel='noopener noreferrer'>View pdf</a></div>`
            }
          }

          /**
           * append the view documents button
           * it will be populate at the end of the function
           */

          infoms = `<div style='display:none' id='docstore_${i}'><button class='infobutt custbtn' id='docbutton_${i}'>View Documents...</button><div id='docdiv_${i}' style='display:none'></div></div>`

          /**
           * end check if the node is Confirmed
           */
        }

        /**
         * check if the node is tariff zones or parking zones
         */

        else if (myitems[i].attributes.getNamedItem('type').nodeValue === 'Tariff Zones' || myitems[i].attributes.getNamedItem('type').nodeValue === 'Parking Zones') {
          /**
           * check if the length of the result is more than 1
           */

          if (myitemsLength > 1) {
            /**
             * add the restriction name and the street name to infolink
             * this will be use in the list that display all the selected restrictions
             */

            infolink = infolink + `<li value='${i}' class='itemlist resetorder order_${i}' id='listitem_${i}'>${getFieldValue(myitems, i, 'polyname')}</li>`
          }

          /**
           * append the polygon name
           * append the polygon info
           */

          conterz += `<div><span>${getFieldValue(myitems, i, 'polyname')}</span></div>`
          conterz += `<div><span>${getFieldValue(myitems, i, 'poly_info')}</span></div>`

          /**
           * append the zonecode value plus the text
           */

          conterz += `<div><span> Zone Code: ${getFieldValue(myitems, i, 'zonecode')}</span></div>`

          /**
           * append the Data correct at time of publication (date) text
           * assign blank value to infoms, no document allowed in this node
           */

          conterz += `<div><span>Data correct at time of publication (${twSettings.publishdate})</span></div>`

          infoms = ''

          /**
           * end tariff zones or parking zones node
           */
        }

        /**
         * check if the node is zone address
         */

        else if (myitems[i].attributes.getNamedItem('type').nodeValue === 'Zone Address') {
          /**
           * check if the length of the result is more than 1
           */

          if (myitemsLength > 1) {
            /**
             * add the property name to infolink
             * this will be use in the list that display all the selected restrictions
             */

            infolink = infolink + `<li value='${i}' class='itemlist resetorder order_${i}' id='listitem_${i}'>${getFieldValue(myitems, i, 'property')}</li>`
          }

          /**
           * append the property name
           * append the strret name
           * append the Data correct at time of publication (date) text
           * assign blank value to infoms, no document allowed in this node
           */

          conterz += `<div><span class='accsize'>${getFieldValue(myitems, i, 'property')}</span></div>`
          conterz += `<div><span class='accsize'>${getFieldValue(myitems, i, 'street')}</span></div>`
          conterz += `<div><span>Data correct at time of publication (${twSettings.publishdate}</span></div>`

          infoms = ''
        }

        /**
         * copy button
         */

        conterz += `<button id='Copy_Btn_${i}' class='Copy_Btn btn mt-1 fa fa-clipboard' style='width:auto;' data-toggle="tooltip" data-container="#Copy_Btn_${i}" data-placement="top" title="Copy content to clipboard"></button>`

        /**
         * check if is the first iteration, first result or not
         * append the correct div to the popup content
         */

        if (i === 0) {
          infoDiv = infoDiv + `<div id='info_${i}'>${infoms}${conterz}</div>`
        }
        else {
          infoDiv = infoDiv + `<div id='info_${i}' style='display:none;'>${infoms}${conterz}</div>`
        }
        /**
         * reset the conterz var as now is inside the infoDiv var
         */

        conterz = ''
      } // next feature

      /**
       * end standard popup
       */
    }
  }

  /**
   * common code for all popups
   */

  /**
   * check if the length of the result is more than 1
   */

  if (myitemsLength > 1) {
    /**
     * create the infolink variable
     *  - this is the button that display the list of all the selected restrictions
     * merge and assing infolink plus infoDiv to the content of the popup
     */

    infolink = `<div><button id='itembutton' class='custbtn'></button><div id='itemdiv' style='display:none'><ul id='itemlist'>${infolink}</ul></div></div>`
    conterz = infolink + infoDiv + `<input type='hidden' id='numofdivs' value='${myitemsLength}'/>`
  }

  /**
   * if the length of the result is 1
   */

  else {
    /**
     * assing infoDiv to the content of the popup
     */

    conterz = infoDiv
  }

  /**
   * check for the screen resolution
   */

  if (window.innerWidth < 768) {
    /**
     * if is mobile append the content of the popup to the modal used for the popup
     * display the modal
     */

    modalpop.innerHTML = conterz
    $('#mobpopup').modal('show')
  }

  /**
   * if is a tablet or a pc append the content of the popup to the popup div
   * display the popup
   */

  else if ((window.innerWidth >= 768)) {
    content.innerHTML = conterz
  }

  /**
   * check for maps and schedules documents
   * we need to pass the mouse position, popupname
   */

  getMapSchedsAndDocs('0', mousePos, fixed)

  /**
   * if you click on multiple restrictions show all the available restrictions
   */

  setInfoControls(overlay, popupname, fixed, twSettings)

  /**
   * check if it's a fra staff website
   * run the correct functions
   */

  if (fixed.app === 'fra_staff') {
    frabutton.editActionField()
    frabutton.fraDeleteItem(overlay)
    frabutton.fraUpdateStatus()
  }

  /**
   * check if it's a psa staff website
   * run the correct functions
   */

  if (fixed.app === 'psa_staff') {
    psabutton.psaDeleteItem(overlay)
  }

  /**
   * end fullInfo function
   */
}

/**
 * get the maps and schedules documents through a php file request
 */

const getMapSchedsAndDocs = (sInfoDiv, mousePosition, getfixed) => {
  /**
   * initialize fixed
   * check for the length of msgrid_0 in the popup
   */

  let fixed = getfixed

  if ($(`#msgrid_${sInfoDiv}`).length === 0 || $('#doclist_' + sInfoDiv).length) {
    return
  }

  /**
   * get the orderref_
   * get the msgrid_
   * the slice split join is becase in the database the value is stored as ,1, instead of just the number 1
   * get the date from the datepicker and change it in postgres format
   */

  let orderref = document.getElementById(`orderref_${sInfoDiv}`).value
  let theGrid = document.getElementById(`msgrid_${sInfoDiv}`).value
  theGrid = theGrid.slice(1, -1)
  theGrid = "'" + theGrid.split(',').join("','") + "'"
  let theDate = $('#activedate').val().split('/').reverse().join('-')

  /**
   * set the url request in get method
   */

  let theUrl = ''

  if (window.location.href.indexOf('localhost') > -1) {
    theUrl = `https://www.traffwebdev.uk/php/getmapsanddocs.php?ref=${encodeURIComponent(orderref)}&date=${theDate}&grid=${theGrid}&e=${parseInt(mousePosition[0])}&n=${parseInt(mousePosition[1])}`
  }
  else {
    theUrl = `/php/getmapsanddocs.php?ref=${encodeURIComponent(orderref)}&date=${theDate}&grid=${theGrid}&e=${parseInt(mousePosition[0])}&n=${parseInt(mousePosition[1])}`
  }

  // if docstore_sinfodiv already exisitngs then return!
  if ($('#doclist_' + sInfoDiv).length) {
    return
  }

  /**
   * get the json from the php file
   */

  $.ajax({
    url: theUrl
  })
    .done((data) => {
      /**
       * parse the result
       */

      data = JSON.parse(data)

      /**
       * if no result return
       */

      if (typeof data.documents === 'undefined' && typeof data.mapscheds === 'undefined') {
        return
      }

      /**
       * if there are result:
       *  - display the docstore_ div
       */

      $(`#docstore_${sInfoDiv}`).css('display', 'block')

      /**
       * docbutton_ click event listener
       */

      $(`#docbutton_${sInfoDiv}`).click(() => {
        $(`#docdiv_${sInfoDiv}`).slideToggle()
      })

      /**
       * create the doclist_ list
       */

      let theDocList = $("<ul id='doclist_" + sInfoDiv + "' class='doclist'></ul>")

      /**
       * check the value of data.documents
       */

      if (typeof data.documents !== 'undefined') {
        /**
         * for each data.documents
         */

        $.each(data.documents, function () {
          /**
           * asign to orderDocs this the one you pass through
           */

          let orderDocs = this

          /**
           * create the li element for the orderDocs
           * add the click event listener
           * open the document in a new windows
           */

          let theDocItem = $(`<li>${orderDocs.doc_category}</li>`).attr('doctype', 'document').attr('docname', orderDocs.doc_name).click(function () {
            let theDoc = `${fixed.sched}${$(this).attr('docname')}`
            window.open(theDoc)
          })

          /**
           * append the li element to the list
           */

          theDocList.append(theDocItem)

          /**
           * end for each
           * end if (typeof data.documents !== 'undefined')
           */
        })
      }

      /**
       * check the value of data.mapscheds
       */

      if (typeof data.mapscheds !== 'undefined') {
        /**
         * for each data.mapscheds
         */

        $.each(data.mapscheds, function () {
          /**
           * asign to mapScheds this the one you pass through
           */

          let mapScheds = this

          /**
           * create the li element for the mapScheds
           * add the click event listener
           * open the document in a new windows
           */

          let theMapItem = $(`<li class='resetgrid grid_${mapScheds.grid}'>Schedule: ${mapScheds.tile}</li>`).attr('docname', mapScheds.doc_name).attr('doctype', 'mapsched').attr('grid', mapScheds.grid).click(function () {
            let theDoc = `${fixed.msched}${$(this).attr('docname')}`
            window.open(theDoc)
          })

          /**
           * append the li element to the list
           */

          theDocList.append(theMapItem)

          /**
           * end for each
           * end if (typeof data.documents !== 'undefined')
           */
        })
      }

      /**
       * append the li element to the list
       */

      let theDocDiv = $(`#docdiv_${sInfoDiv}`)
      theDocDiv.append(theDocList)

      /**
       * end done Ajax
       */
    })
    .fail(function (jqxhr, textStatus, error) {
      const err = `${textStatus}, ${error}`
      alert(`THEURLS Request Failed: ${err}`)
    })

  /**
   * end getMapSchedsAndDocs
   */
}

/**
 * if you click on multiple restrictions show all the available restrictions
 */

const setInfoControls = (getOverlay, popupname, fixed, twSettings) => {
  /**
   * initialize the overlay
   */

  let overlay = getOverlay

  /**
   * get the text from the listitem_0
   * change the text of itembutton
   * prepend the arrow to the text
   */

  const theButt = $('#listitem_0').text()

  $('#itembutton').text(theButt)
  $('#itembutton').prepend("<em class='itmbtnlist fa fa-caret-right'></em>")

  /**
   * itembutton click event listener
   */

  $('#itembutton').click(function () {
    /**
     * show/hide the list of available restrictions
     * change the arrow accordingly
     */

    $('#itemdiv').slideToggle()
    $(this).children('em').toggleClass('fa-caret-right fa-caret-down')
  })

  /**
   * itemlist click event listener
   */

  $('.itemlist').click(function (e) {
    /**
     * prevent default behaviour
     */

    e.preventDefault()

    /**
     * get the value from the this item
     * get the text from the listitem_
     * change the text of itembutton
     * prepend the arrow to the text
     * show/hide the list of available restrictions
     */

    let theVal = this.value
    const theButts = $(`#listitem_${theVal}`).text()
    $('#itembutton').text(theButts)
    $('#itembutton').prepend("<em class='itmbtnlist fa fa-caret-right'></em>")
    $('#itemdiv').slideToggle()

    /**
     * change the displayed popup content
     */

    changeInfoItem(theVal, overlay.getPosition(), fixed)

    /**
     * end itemlist click event listener
     */
  })

  /**
   * if the popupname is nottingham
   */

  if (popupname === 'nottingham') {
    /**
     * exCodeBtn click event listener
     */

    $('.exCodeBtn').button().click(function (e) {
      /**
       * prevent default behaviour
       */

      e.preventDefault()

      /**
       * get the value of the clicked button
       * get the id of the button splitting by _
       * change the text of exDesc_
       */

      let theVal = this.value
      let sSpanID = this.id.split('_')[1]
      $('#exDesc_' + sSpanID).text(theVal)

      /**
       * check the oldval attribute of exDesc_
       */

      /**
       * if the oldval attribute is 'none'
       */

      if ($(`#exDesc_${sSpanID}`).attr('oldval') === 'none') {
        /**
         * this happen the first time
         * change the oldval attribute
         * show/hide the current exDesc_
         * return, prevent to continue
         */

        $(`#exDesc_${sSpanID}`).attr('oldval', theVal)
        $(`#exDesc_${sSpanID}`).toggle()
        return
      }

      /**
       * if the oldval attribute is === to the actual val
       */

      if ($(`#exDesc_${sSpanID}`).attr('oldval') === theVal) {
        /**
         * this happen if you click on the same button
         * show/hide the current exDesc_
         */

        $(`#exDesc_${sSpanID}`).toggle()
      }

      /**
       * if the oldval attribute is !== to the actual val
       */

      else {
        /**
         * this happen when yoyu click on another button
         * change the oldval attribute
         * show the new exDesc_
         */

        $(`#exDesc_${sSpanID}`).attr('oldval', theVal)
        $(`#exDesc_${sSpanID}`).css('display', 'block')
      }
    })

    /**
     * end if the popupname is nottingham
     */
  }

  /**
   * end setInfoControls
   */
}

/**
 * change the displayed popup content
 */

const changeInfoItem = (sInfoDiv, coordinate, getfixed) => {
  /**
   * initialize fixed
   * initialize numofdivs
   * change the numofdivs to the number of element inside numofdivs
   * assign to num the lenght of numofdivs - 1 to itemLength
   */

  let fixed = getfixed
  let numofdivs = 0
  numofdivs = parseInt(document.getElementById('numofdivs').value)
  let itemLength = numofdivs - 1

  /**
   * initialize numofdivs
   * change the numofdivs to the number of element inside numofdivs
   * assign to num the lenght of numofdivs - 1 to itemLength
   */

  for (let l = 0; l <= itemLength; l++) {
    /**
     * check if #info_ l match info_ sInfoDiv
     */

    if (document.getElementById(`info_${l}`).id === (`info_${sInfoDiv}`)) {
      /**
       * display info_ sInfoDiv
       */

      $(`#info_${sInfoDiv}`).css('display', 'block')
    }
    /**
     * if #info_ l don't match info_ sInfoDiv
     */

    else {
      /**
       * hide info_ l
       */

      $(`#info_${l}`).css('display', 'none')
    }

    /**
     * end for loop
     */
  }

  /**
   * check for maps sched and documents of the new displayed element
   */

  getMapSchedsAndDocs(sInfoDiv, coordinate, fixed)

  /**
   * end const changeInfoItem = (sInfoDiv, coordinate, fixed) =>
   */
}

/**
 * public consultation popup
 */

const fullInfoPc = (fixed, getSettings, xml, mousePos, getOverlay) => {
  /**
   * assign the popupname value
   * assign the twSettings value
   * assign the overlay value
   */

  let popupname = fixed.popupname
  let twSettings = getSettings
  let overlay = getOverlay

  /**
   * get the result from the XML
   * - create a parser
   * - parse the result
   * - get the item element
   * - get the length of the item element
   */

  let parser = new window.DOMParser()
  let url = parser.parseFromString(xml, 'text/xml')
  let featObj = url
  let myitems = featObj.getElementsByTagName('item')
  let myitemsLength = myitems.length

  /**
   * initilaize some variable to use it in the process
   */

  let conterz = ''
  let infolink = ''
  let infoDiv = ''
  let schemeObjected
  let streetObjected = 'N/A'

  /**
   * get the popup container
   *  - normal popup
   *  - mobile popup
   */

  let content = document.getElementById('popup-content')
  let modalpop = document.getElementById('mobpopupbody')

  /**
   * iterate through the result
   */

  for (let i = 0; i <= (myitemsLength - 1); i++) {
  /**
   * check if the node is sign
   * if it's return
   */

    if (myitems[i].attributes.getNamedItem('type').nodeValue === 'Sign') {
      return
    }

    /**
     * check if the length of the result is more than 1
     */

    if (myitemsLength > 1) {
      infolink = infolink + `<li value='${i}' class='itemlist resetorder order_${i}' id='listitem_${i}'>${getFieldValue(myitems, i, 'restriction')} ${getFieldValue(myitems, i, 'street_name')}</li>`
    }

    /**
     * check if the node is proposed
     */

    if (myitems[i].attributes.getNamedItem('type').nodeValue === 'Proposed') {
    /**
     * get the deposited Document
     */

      let schDoc = twSettings.sched + encodeURIComponent(getFieldValue(myitems, i, 'order_doc'))

      /**
       * set the consultation var to pass into the form
       */

      schemeObjected = getFieldValue(myitems, i, 'scheme_name')

      if (getFieldValue(myitems, i, 'street_name') !== '') {
        streetObjected = getFieldValue(myitems, i, 'street_name')
      }

      /**
       * append the deposited document
       * check if order_doc is not blank
       *  - set the url based on dev environment or live
       *  - send a get request in async mode
       *  - if the file exist append the Deposited Document button (based on dev environment or live)
       *  - if the file doesn't exist append the Deposited Document button with the class d-none
       * if the file doesn't exist append the Deposited Document button with the class d-none
       * we still append the button because there is a function attached to it, if is not present it will fail
       */

      if (getFieldValue(myitems, i, 'order_doc') !== '') {
        let url = ''
        if (window.location.href.indexOf('localhost') > -1) {
          url = 'https://www.traffwebdev.uk/php/checkfile.php?schdoc=https://www.traffwebdev.uk/consult/'
        }
        else {
          url = `/php/checkfile.php?schdoc=${window.location.href}`
        }

        $.ajax({
          url: `${url}${schDoc}`,
          async: false
        })
          .done((data) => {
            if (data === 'exist') {
              if (window.location.href.indexOf('localhost') > -1) {
                conterz += `<div><span><a href="https://www.traffwebdev.uk/consult/${schDoc}" class='infobutt custbtn' target='_blank' rel='noopener noreferrer'>Deposited Document</a></span>`
              }
              else {
                conterz += `<div><span><a href="${schDoc}" class='infobutt custbtn' target='_blank' rel='noopener noreferrer'>Deposited Document</a></span>`
              }
            }
            else {
              conterz += `<div><span><a href="" class='infobutt custbtn d-none' target='_blank' rel='noopener noreferrer'>Deposited Document</a></span>`
            }
          })
          .fail((jqxhr, textStatus, error) => {
            const err = `${textStatus} , ${error}`
            alert(`check document: ${err}`)
          })
      }
      else {
        conterz += `<div><span><a href="" class='infobutt custbtn d-none' target='_blank' rel='noopener noreferrer'>Deposited Document</a></span>`
      }

      /**
       * append the send a comment with it's function
       */

      conterz += `<span><button class='infobutt custbtn pcSend'>Send a Comment</button></span></div>`

      /**
       * check the addinfo node
       */

      if (myitems[i].getElementsByTagName('addinfo')[0].childNodes.length !== 0) {
        let btext = myitems[i].getElementsByTagName('addinfo')[0].attributes[0].nodeValue
        conterz = conterz + `<div><a class='infobutt custbtn' target='_blank' rel='noopener noreferrer' href='${getFieldValue(myitems, i, 'addinfo')}'>${btext}</a></div>`
        conterz += `<div class='spacer' style='clear:both;font-size:xx-small;'>&nbsp;</div>`
      }

      /**
       * append the scheme name plus the street name
       * append the restriction name
       * add a space
       */

      conterz += `<div class='infotitle'><span class='pcTitle'>${getFieldValue(myitems, i, 'scheme_name')}</span><span class='pcTitle'> ${getFieldValue(myitems, i, 'street_name')}</span></div>`
      conterz += `<div><span>${getFieldValue(myitems, i, 'restriction')}</span></div>`
      conterz += `<div class='spacer' style='clear:both;font-size:xx-small;'>&nbsp;</div>`

      /**
       * check the tariff node
       * append the correct text
       */

      if (getFieldValue(myitems, i, 'tariff') !== '') {
        conterz += `<div><span class='infotitle'>Tariff: </span><span>${getFieldValue(myitems, i, 'tariff')}</span></div>`
      }

      /**
       * check the pcode node
       * append the correct text
       */

      if (getFieldValue(myitems, i, 'pcode') !== '') {
        conterz += `<div><a href='${twSettings.sched}FeesandCharges.pdf' class='infonav'>Tariff Code: ${getFieldValue(myitems, i, 'pcode')}</a></div>`
      }

      /**
       * get the from / to date
       * append the correct text
       */

      let dfrom = (myitems[i].getElementsByTagName('date_advert')[0].firstChild.nodeValue).split('-').reverse().join('/')
      let dto = (myitems[i].getElementsByTagName('date_close')[0].firstChild.nodeValue).split('-').reverse().join('/')

      if (dto !== undefined && dto !== '01/01/2199' && dto !== '') {
        conterz += `<div><span>Advertised from ${dfrom} to ${dto}</span></div>`
      }
      else {
        conterz += `<div><span>Advertised from ${dfrom} to the present day</span></div>`
      }

      conterz += `<div><span>${getFieldValue(myitems, i, 'street_name')}</span></div>`
      conterz += `<div><span>Ref: ${getFieldValue(myitems, i, 'order_ref')}</span></div>`

      /**
       * check the blockimagefile field
       */

      if (myitems[i].getElementsByTagName('blockimagefile')[0].childNodes.length !== 0) {
        /**
         * get the blockimagefile value
         * check for the presence of gif or pdf in the name
         * append the correct text
         */

        let sSignFile = getFieldValue(myitems, i, 'blockimagefile')
        let iGif = -1
        let iPdf = -1
        iGif = sSignFile.indexOf('.gif')
        iPdf = sSignFile.indexOf('.pdf')

        if (iGif !== -1) {
          conterz += `<div><img src='/consult/data/signs/${sSignFile}'/></div>`
        }
        if (iPdf !== -1) {
          conterz += `<div><a href='/consult/data/parkmap/pdfs/${sSignFile}' target='_blank' rel='noopener noreferrer'>View pdf</a></div>`
        }
      }

      /**
       * append the Data correct at time of publication (date) text
       */

      conterz += `<div><span>Data correct at time of publication (<time>${twSettings.publishdate}<time>)</span></div>`

    /**
     * end check if the node is proposed
     */
    }

    /**
     * if it's a confirmed order
     */

    else {
    /**
     * append Existing Order text
     * append street name
     * append restriction name
     * append Data correct at time of publication (date) text
     */

      conterz += `<div class='infotitle'><span>Existing Order</span></div>`
      conterz += `<div class='infotitle'><span class='accsize'>${getFieldValue(myitems, i, 'street_name')}</span></div>`
      conterz += `<div><span>${getFieldValue(myitems, i, 'restriction')}</span></div>`
      conterz += `<div><span>Data correct at time of publication (<time>${twSettings.publishdate}<time>)</span></div>`
    }

    /**
     * copy button
     */

    conterz += `<button id='Copy_Btn_${i}' class='Copy_Btn btn mt-1 fa fa-clipboard' style='width:auto;' data-toggle="tooltip" data-container="#Copy_Btn_${i}" data-placement="top" title="Copy content to clipboard"></button>`

    /**
     * check if is the first iteration, first result or not
     * append the correct div to the popup content
     */

    if (i === 0) {
      infoDiv += `<div id='info_${i}'>${conterz}</div>`
    }
    else {
      infoDiv += `<div id='info_${i}' style='display:none;'>${conterz}</div>`
    }

    /**
     * reset the conterz var as now is inside the infoDiv var
     */

    conterz = ''
  } // next feature

  /**
   * check if the length of the result is more than 1
   */

  if (myitemsLength > 1) {
    /**
     * create the infolink variable
     *  - this is the button that display the list of all the selected restrictions
     * merge and assing infolink plus infoDiv to the content of the popup
     */

    infolink = `<div><button id='itembutton' class='custbtn'></button><div id='itemdiv' style='display:none'><ul id='itemlist'>${infolink}</ul></div></div>`
    conterz = infolink + infoDiv + `<input type='hidden' id='numofdivs' value='${myitemsLength}'/>`
  }
  /**
   * if the length of the result is 1
   */

  else {
    /**
     * assing infoDiv to the content of the popup
     */

    conterz = infoDiv
  }

  /**
   * check for the screen resolution
   */

  if (window.innerWidth < 768) {
    /**
     * if is mobile append the content of the popup to the modal used for the popup
     * display the modal
     */

    modalpop.innerHTML = conterz
    $('#mobpopup').modal('show')
  }
  /**
   * if is a tablet or a pc append the content of the popup to the popup div
   * display the modal
   */

  else if ((window.innerWidth >= 768)) {
    content.innerHTML = conterz
  }

  /**
   * if you click on multiple restrictions show all the available restrictions
   */

  setInfoControls(overlay, popupname, fixed, twSettings)

  /**
   * pc send comment click event listener
   */

  $('.pcSend').on('click', () => {
    pccomment.commentInit(schemeObjected, streetObjected)
  })

  /**
   * end fullInfoPc
   */
}

/**
 * hover popup creation
 */

const hover = (xml) => {
  /**
   * get the result from the XML
   * - create a parser
   * - parse the result
   * - get the item element
   * - get the length of the item element
   * initialize the content of the popup to empty
   */

  let parser = new window.DOMParser()
  let url = parser.parseFromString(xml, 'text/xml')
  let featObj = url
  let myitems = featObj.getElementsByTagName('item')
  let myitemsLength = myitems.length
  let strText = ''

  /**
   * iterate through the result
   */

  for (let i = 0; i <= (myitemsLength - 1); i++) {
    /**
     * add a new line after the first iteration
     * in this way each result will be on a new line
     */

    if (i !== 0) {
      strText += '<br />'
    }

    /**
     * check if the node is confirmed
     */

    if (myitems[i].attributes.getNamedItem('type').nodeValue === 'Confirmed') {
      /**
       * check if is a pc site or not
       * display the correct text
       */

      if (window.location.href.indexOf('consult') !== -1) {
        strText = strText + `<span class='infotitle'>Existing: <span class='infotitle_norm'>${myitems[i].getElementsByTagName('restriction')[0].firstChild.nodeValue}</span>`
      }
      else {
        strText = strText + `<span class='infotitle'>${myitems[i].getElementsByTagName('restriction')[0].firstChild.nodeValue}</span>`
      }
    }
    /**
     * check if the node is proposed
     * display the correct text
     */

    else if (myitems[i].attributes.getNamedItem('type').nodeValue === 'Proposed') {
      strText = strText + `<span class='infotitle'>Proposed: <span class='infotitle_norm'>${myitems[i].getElementsByTagName('restriction')[0].firstChild.nodeValue}</span></span>`
    }
    /**
     * check if the node is speed
     * display the correct text
     */

    else if (myitems[i].attributes.getNamedItem('type').nodeValue === 'Speed') {
      strText = strText + `<span class='infotitle'>${myitems[i].getElementsByTagName('display_group')[0].firstChild.nodeValue}</span>`
    }
    /**
     * check if the node is speed
     * display the correct text
     */

    else if (myitems[i].attributes.getNamedItem('type').nodeValue === 'accident') {
      strText = strText + `<span class='infotitle'>${myitems[i].getElementsByTagName('accmonth')[0].firstChild.nodeValue} ${myitems[i].getElementsByTagName('accyear')[0].firstChild.nodeValue}: ${myitems[i].getElementsByTagName('severity')[0].firstChild.nodeValue}</span>`
    }
    /**
     * check if the node is zone address
     * display the correct text
     */

    else if (myitems[i].attributes.getNamedItem('type').nodeValue === 'Zone Address') {
      strText = strText + `<span class='infotitle'>${myitems[i].getElementsByTagName('property')[0].firstChild.nodeValue} ${myitems[i].getElementsByTagName('street')[0].firstChild.nodeValue}</span>`
    }
    /**
     * check if the node is tariff zones or parking zones
     * display the correct text
     */

    else if (myitems[i].attributes.getNamedItem('type').nodeValue === 'Tariff Zones' || myitems[i].attributes.getNamedItem('type').nodeValue === 'Parking Zones') {
      strText = strText + `<span class='infotitle'>${myitems[i].getElementsByTagName('polyname')[0].firstChild.nodeValue}</span>`
    }
    /**
     * check if the node is fra
     * display the correct text
     */

    else if (myitems[i].attributes.getNamedItem('type').nodeValue === 'fra') {
      strText = strText + `<span class='infotitle'>${myitems[i].getElementsByTagName('fref')[0].firstChild.nodeValue}</span>`
    }
    /**
     * check if the node is psa
     * display the correct text
     */

    else if (myitems[i].attributes.getNamedItem('type').nodeValue === 'psa') {
      strText = strText + `<span class='infotitle'>${myitems[i].getElementsByTagName('suspid')[0].firstChild.nodeValue}</span>`
    }
    /**
     * check if the node is moving sign
     * dont display anything
     */

    else if (myitems[i].attributes.getNamedItem('type').nodeValue === 'movingSign') {
      strText = ''
    }

    /**
     * end for loop
     */
  }

  return strText

/**
 * end hover(xml)
 */
}

/**
 * EXPORT
 */

export default {
  infoPopup,
  getExemptions
}
