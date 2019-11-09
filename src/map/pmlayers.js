/**
 * in this module there are all the related functions for:
 *  - initialize the layer
 *  - add the layer to the map
 *  - initialize the datepicker
 */

/**
 * import modules
 */

import map from '../common/map'
import overlay from '../common/overlay'
import pmpopup from './pmpopup'

/**
 * global vars
 */

let pmfeatlayer
let sQLayers

/**
 * create the parkmap layer
 */

let initPmLayer = (getFixed, settings) => {
  /**
   * get the settings from the functions module
   * update the vars accordingly
   */

  let fixed = getFixed
  let twSettings = settings

  let players = twSettings.players
  let twlayers = twSettings.twlayers

  /**
   * get resolutions from scale
   */

  // final resolutions array
  const resolutions = []
  // temp scale array
  const scaleArray = []
  // scales array from fixed.json
  const scales = fixed.scales.split(',')
  // create a temporary array of scales in number
  functions.getScale(scales, scaleArray)
  // create the final resolutions array
  functions.setResolution(scaleArray, resolutions)

  /**
  * get the extent of the visible map
   */

  const setExt = fixed.bounds.split(',')
  const ext = [parseInt(setExt[0]), parseInt(setExt[1]), parseInt(setExt[2]), parseInt(setExt[3])]

  /**
   * set the correct sqlayers
   */

  if (window.location.href.indexOf('consult') !== -1) {
    // default to proposed layers
    sQLayers = players
  }
  else {
    sQLayers = twlayers
  }

  /**
   * get the current date
   * set the default date to display the restrictions
   */

  const today = new Date()
  let sDTo = `${today.getFullYear()}-${functions.leadZero(today.getMonth() + 1)}-${functions.leadZero(today.getDate())}`

  /**
   * initialize suspid
   * get the url parameters
   */

  let suspid
  let urlpos = window.location.search.replace('?', '')

  /**
   * check if in the URL you have the suspid parameter
   * PSA staff website
   * https://www.traffwebdev.uk/psastaff/index.html?suspid=c123456354673
   */

  if (urlpos.search('suspid') > -1 && urlpos.search('defpos') === -1) {
    let sFindID = urlpos.replace('suspid=', '')
    suspid = sFindID
  }

  // dummy parameter to use for FRA
  let iDelRef = 0

  // feature layer
  pmfeatlayer = new ol.layer.Tile({
    // this extent limit the visible map
    extent: ext,
    // Load low-resolution tiles up to preload levels. By default preload is 0, which means no preloading
    preload: Infinity,
    source: new ol.source.TileWMS({
      url: fixed.wmsfeat,
      params: {
        'LAYERS': sQLayers,
        MYORDERS: twSettings.defsel,
        DTO: sDTo,
        IDELREF: iDelRef,
        SUSPID: suspid,
        format: 'image/png'
      },
      ratio: 1,
      gutter: 40,
      serverType: 'mapserver',
      crossOrigin: 'anonymous',
      projection: 'EPSG:27700',
      tileGrid: new ol.tilegrid.TileGrid({
        resolutions: resolutions,
        extent: ext,
        tileSize: [128, 128]
      })
    })
  })

  /**
   * end let initPmLayer = (getFixed, settings) => {
   */
}

/**
 * update the parkmap layer parameters
 */

const updateLayerParams = (sOrderSel, iDelRef) => {
  /**
   * hide the layer
   */

  pmfeatlayer.setVisible(false)

  /**
   * if the visible restriction array is empty stop and return
   */

  if (sOrderSel === '') {
    return
  }

  /**
   * get the date from the datepicker
   * convert the date from the datepicker to a PG format
   * once is converted it can be use as a parameter
   */

  let dDTo = ''
  const today = new Date()

  if ($('#activedate').val()) {
    dDTo = $('#activedate').val().split('/').reverse().join('-')
  }
  else {
    dDTo = `${today.getFullYear()}-${functions.leadZero(today.getMonth() + 1)}-${functions.leadZero(today.getDate())}`
  }

  /**
   * initialize suspid
   * get the url parameters
   */

  let suspid
  let urlpos = window.location.search.replace('?', '')

  /**
   * check if in the URL you have the suspid parameter
   * PSA staff website
   * https://www.traffwebdev.uk/psastaff/index.html?suspid=c123456354673
   */

  if (urlpos.search('suspid') > -1 && urlpos.search('defpos') === -1) {
    let sFindID = urlpos.replace('suspid=', '')
    suspid = sFindID
  }

  /**
   * update the restrictions to dipslay
   * update the date
   * refresh the source
   * show the layer
   */

  pmfeatlayer.getSource().getParams().MYORDERS = sOrderSel
  pmfeatlayer.getSource().getParams().DTO = dDTo
  pmfeatlayer.getSource().getParams().IDELREF = iDelRef
  pmfeatlayer.getSource().getParams().SUSPID = suspid
  pmfeatlayer.getSource().refresh()
  pmfeatlayer.setVisible(true)

/**
 * end const updateLayerParams = (sOrderSel, iDelRef) => {
 */
}

/**
 * remove the whole parmak layer
 */

$('#pmlayerSwitch').on('click', function () {
  /**
   * assign this to the variable $this
   */

  let $this = $(this)

  /**
   * hide the popup
   */

  overlay.overlay.setPosition(undefined)

  /**
   * check if the value is on
   * change the value to off
   * remove the check class and apply the times class
   * remove the pmfeatlayer
   * hide the parkmap legend
   */

  if ($this.val() === 'on') {
    $this.val('off')
    $this.removeClass('fa-check').addClass('fa-times')
    map.getMap().removeLayer(pmfeatlayer)
    $('#pmlegend').hide()
  }

  /**
   * check if the value is off
   * change the value to on
   * remove the times class and apply the check class
   * add the pmfeatlayer
   * show the parkmap legend
   */
  else {
    $this.val('on')
    $this.removeClass('fa-times').addClass('fa-check')
    map.getMap().addLayer(pmfeatlayer)
    pmfeatlayer.setZIndex(2)
    $('#pmlegend').css('display', 'flex')
  }

  /**
   * end $('#pmlayerSwitch').on('click', function () {
   */
})

/**
 * initialize the datepicker
 */

const initDatePicker = () => {
  /**
   * wrap everything inside an onload event listener (IE bug with form)
   */

  document.addEventListener('DOMContentLoaded', () => {
    /**
     * reset the parkingdateForm
     */

    if ($('#parkingdateForm').length > 0) {
      document.getElementById('parkingdateForm').reset()
    }

    /**
     * initialize the datepicker with the date of today
     */
    const today = new Date()
    const inpvalue = `${functions.leadZero(today.getDate())}/${functions.leadZero(today.getMonth() + 1)}/${today.getFullYear()}`

    $('#activedate').val(inpvalue)

    /**
     * set the datepicker options
     */

    $('#activedate').datepicker({
      format: 'dd/mm/yyyy',
      autoclose: true,
      startDate: '01/01/1950',
      endDate: '+20y',
      orientation: 'bottom auto'
    }).on('show', function (e) {
      e.stopPropagation()
    })

    /**
     * end onload eventlistener
     */
  })

  /**
   * click event listener on the display button
   */

  $('#pmdatedisplay').click(function (e) {
    /**
     * stop propagation and prevent default
     */

    e.preventDefault()
    e.stopPropagation()

    /**
     * update the parkmap layer
     * hide the popup
     */

    updateLayerParams($('#featclick').val(), 0)
    overlay.overlay.setPosition(undefined)
  })

  /**
   * simulate a click event on the display button when the ENTER key is pressed inside the input
   */

  $('#activedate').keypress(function (e) {
    if (e.which === 13) {
      $('#pmdatedisplay').click()
    }
  })

/**
 * end const initDatePicker = () => {
 */
}

/**
 * change public consultation layer
 */

const changePCLayer = (theLayer, getFixed, settings) => {
  /**
   * get the settings from the functions module
   * update the vars accordingly
   */

  let fixed = getFixed
  let twSettings = settings

  let sQLayers
  let players = twSettings.players
  let twlayers = twSettings.twlayers
  let glayers = twSettings.glayers

  /**
   * get the layer from the map and remoe it
   */

  map.getMap().removeLayer(pmfeatlayer)

  /**
   * update the layer depending on which layer you select in the select element
   */

  if (theLayer === 'proposed') {
    sQLayers = players
  }
  else if (theLayer === 'existing') {
    sQLayers = twlayers
  }
  else if (theLayer === 'all') {
    if (glayers === '') {
      sQLayers = players
    }
    else {
      sQLayers = `${glayers},${players}`
    }
  }

  /**
   * update the layer parameters
   */

  let sDTo = new Date()
  sDTo = `${sDTo.getFullYear()}-${sDTo.getMonth() + 1}-${sDTo.getDate()}`

  pmfeatlayer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
      url: fixed.wmsfeat,
      params: {'LAYERS': sQLayers, MYORDERS: twSettings.defsel, DTO: sDTo, format: 'image/png'},
      ratio: 1,
      gutter: 40,
      serverType: 'mapserver',
      crossOrigin: 'anonymous',
      projection: 'EPSG:27700'
    })
  })

  /**
   * refresh the layer's source
   * add the layer
   * remove the singleclick event to prevent multiples triggers
   * intialize the popup again
   */

  pmfeatlayer.getSource().refresh()
  map.getMap().addLayer(pmfeatlayer)

  map.getMap().removeEventListener('singleclick')
  pmpopup.infoPopup(functions.getFixedSettings(), functions.getTwSettings(), map.getMap(), pmfeatlayer, overlay.overlay)

/**
 * end const changePCLayer = (theLayer, getFixed, settings) => {
 */
}

/**
 * export the layers
 */

const pmlayer = () => {
  return pmfeatlayer
}

const sQLayer = () => {
  return sQLayers
}

/**
 * export the addlayer
 */

const addlayer = () => {
  map.getMap().addLayer(pmfeatlayer)
  pmfeatlayer.setZIndex(2)
}

/**
 * EXPORT
 */

export default {
  initDatePicker,
  updateLayerParams,
  changePCLayer,
  addlayer,
  pmlayer,
  sQLayer,
  initPmLayer
}
