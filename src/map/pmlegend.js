/**
 * in this module there are all the related functions for:
 *  - create the tro legend
 *  - create the fra legend
 *  - the creation of the scheme for PC
 *  - create the pc legend
 */

/**
 * import modules
 */

import functions from '../common/functions'
import overlay from '../common/overlay'
import pccomments from './pccomments'
import layers from './pmlayers'
import map from '../common/map'

/**
 * get the settings from settings.json
 */

const initLegend = () => {
  if (window.location.href.indexOf('consult') !== -1) {
    buildSchemeList(functions.getFixedSettings(), functions.getTwSettings())
    buildPCLegendList()
  }
  else {
    buildLegendList(functions.getFixedSettings(), functions.getTwSettings())
  }
}

/**
 * build the TRO legend
 */

const buildLegendList = (getFixed, getSettings) => {
  /**
   * initialize the settings with the one in the functions module
   * initialize the fixed with the one in the functions module
   */

  let twSettings = getSettings
  let fixed = getFixed

  /**
   * get the name for the legend
   * get the id of the restrictions
   */

  const makegroups = twSettings.legend.split(',')
  let tmp = ''

  /**
   * create an hide input with all the current IDs in the settings.json
   */

  $('<input>', {
    type: 'hidden',
    id: 'featclick',
    value: twSettings.defsel
  }).appendTo('#feature_list')

  /**
   * create a group buttons list at the top of the legend
   * append it to the switchdisplay div
   * add the click event
   */

  for (let i in makegroups) {
    $('<button>', {
      id: makegroups[i].split(' ').join('_'),
      value: 'on',
      class: 'groupbtn fa fa-check'
    }).html(makegroups[i]).appendTo('#switchdisplay').click(function () {
      /**
       * create a $this variable
       * assign to tmp the actual ID of the button
       */

      const $this = $(this)
      tmp = $this.attr('id')

      /**
       * hide the popup
       */

      overlay.overlay.setPosition(undefined)

      /**
       * check the value of the button
       */

      if ($this.val() === 'on') {
        /**
         * if is ON change the value to OFF
         */

        $this.val('off')

        /**
         * hide the related list
         * change the check box icon to X
         * change all the restrictons in the list to OFF and remove the class fa-times
         */

        $(`#${tmp}_list`).hide()
        $(this, '#switchdisplay button').addClass('fa-times')
        $(`#${tmp}_list label`).attr('checkon', 'off')
        $(`#${tmp}_list .fa`).removeClass('fa-times')
      }
      else {
        /**
         * if is OFF change the value to ON
         * assign to tmp the actual ID of the button
         */

        $this.val('on')

        /**
         * show the related list
         * change the check box icon to V
         * change all the restrictons in the list to ON and add the class fa-times
         */

        $(`#${tmp}_list`).show()

        $(this, '#switchdisplay button').addClass('fa-check')
        $(this, '#switchdisplay button').removeClass('fa-times')
        $(`#${tmp}_list label`).attr('checkon', 'on')
        $(`#${tmp}_list .fa`).addClass('fa-check')
      }

      /**
       * get all the active restrictions
       * save it as a val of #featclick
       *  - we use it to update the layer parameters from the datepicker
       */

      const tmpsOrderSel = []

      $('label[checkon="on"]').each(function () {
        tmpsOrderSel.push($(this).attr('order'))
      })

      $('#featclick').val(tmpsOrderSel)

      /**
       * update the pmfeatlayer with the new value
       */

      layers.updateLayerParams(tmpsOrderSel, 0)

    /**
     * end button click
     */
    })

    /**
     * create an ul list
     * add class grouplist
     * append it to makegroup[i]_div
     */

    $('<ul>', {
      id: `${makegroups[i].split(' ').join('_')}_list`
    }).addClass('grouplist').appendTo('#feature_list')

    /**
     * end for (let i in makegroups)
     */
  }

  /**
   * check the type of app
   * assign the correct path to the url
   * create the list of restrictions based on the features.json
   */
  let pmurl = ''

  if (fixed.app === 'invmap') {
    pmurl = fixed.pmpath
  }
  else {
    pmurl = 'data/'
  }

  $.getJSON(`${pmurl}features.json`)
    .done((data) => {
      /**
       * if there is data in features.json create a list
       */

      if ('features' in data) {
        /**
         * for each feature in the json file create the correct html element
         * append it to the correct list
         */

        $.each(data.features, function () {
          let legend = this

          /**
           * all the available restrictions in the settings.json
           */

          const myDef = twSettings.defsel.split(',').map(Number)

          /**
           * check if the restriction is a fra element
           */

          if (legend.layer === 'fra') {
            $('<li>', {
              id: 'li' + legend.fstatus
            }).appendTo(`#${legend.group.split(' ').join('_')}_list`)

            /**
             * if the order_id in features.json doesn't exists in the twSettings.defsel
             * change the checkbox icon to X
             */

            if (myDef.indexOf(legend.fstatus) === -1) {
              /**
               * create the icon in an em element
               * append it to the correct list
               */

              $('<em>', {
              }).addClass('fa fa-times').appendTo(`#li${legend.fstatus}`)

              /**
               * create the text in a label element
               * apply the OFF value to the checkon attribute
               * append it to the correct list
               */

              $('<label>', {
                checkon: 'off',
                order: legend.fstatus
              }).html(legend.name).appendTo(`#li${legend.fstatus}`)
            }

            /**
             * if the order_id in features.json exists in the twSettings.defsel
             * change the checkbox icon to V
             */

            else {
              /**
               * create the icon in an em element
               * append it to the correct list
               */

              $('<em>', {
              }).addClass('fa fa-check').appendTo(`#li${legend.fstatus}`)

              /**
               * create the text in a label element
               * apply the ON value to the checkon attribute
               * append it to the correct list
               */

              $('<label>', {
                checkon: 'on',
                order: legend.fstatus
              }).html(legend.name).appendTo(`#li${legend.fstatus}`)
            }

            /**
             * create the image for the item
             * apply the correct style
             * append it to the correct list
             */

            $('<img>', {
              'for': 'lb' + legend.fstatus,
              src: legend.image,
              style: 'width:20px;'
            }).appendTo(`#li${legend.fstatus}`)
          }

          /**
           * else if it's a normal parkmap restriction
           */

          else {
            $('<li>', {
              id: `li${legend.order_id}`
            }).appendTo(`#${legend.group.split(' ').join('_')}_list`)

            /**
             * if the order_id in features.json doesn't exists in the twSettings.defsel
             * change the checkbox icon to X
             */

            if (myDef.indexOf(legend.order_id) === -1) {
              /**
               * create the icon in an em element
               * append it to the correct list
               */

              $('<em>', {
              }).addClass('fa fa-times').appendTo(`#li${legend.order_id}`)

              /**
               * create the text in a label element
               * apply the OFF value to the checkon attribute
               * append it to the correct list
               */

              $('<label>', {
                checkon: 'off',
                order: legend.order_id
              }).html(legend.name).appendTo(`#li${legend.order_id}`)
            }

            /**
             * if the order_id in features.json exists in the twSettings.defsel
             * change the checkbox icon to V
             */

            else {
              /**
               * create the icon in an em element
               * append it to the correct list
               */

              $('<em>', {
              }).addClass('fa fa-check').appendTo(`#li${legend.order_id}`)

              /**
               * create the text in a label element
               * apply the ON value to the checkon attribute
               * append it to the correct list
               */

              $('<label>', {
                checkon: 'on',
                order: legend.order_id
              }).html(legend.name).appendTo(`#li${legend.order_id}`)
            }

            /**
             * create the parkmap legend
             */

            parkmapLegend(legend)
          }
          /**
           * end for each loop
           * end if features in data
           */
        })
      }

      /**
       * click event listener on each label
       * show/hide restriction in the map based on which restriction you click in the legend
       */

      $('.grouplist label').click(function (e) {
        /**
         * check the attribute of this restriction
         * change the attribute accordingly
         * change the check (X/V) icon accordingly
         */

        if ($(this).attr('checkon') === 'on') {
          $(this).attr('checkon', 'off')
          $(this).prev('em').removeClass('fa-check').addClass('fa fa-times')
        }
        else {
          $(this).attr('checkon', 'on')
          $(this).prev('em').removeClass('fa-times').addClass('fa fa-check')
        }

        /**
         * hide the popup
         */

        overlay.overlay.setPosition(undefined)

        /**
         * get all the active restrictions
         * save it as a val of #featclick
         *  - we use it to update the layer parameters from the datepicker
         */

        const tmpsOrderSel = []

        $('label[checkon="on"]').each(function () {
          tmpsOrderSel.push($(this).attr('order'))
        })

        $('#featclick').val(tmpsOrderSel)

        /**
         * update the pmfeatlayer with the new value
         */

        layers.updateLayerParams(tmpsOrderSel, 0)

        /**
         * end $('.grouplist label').click(function (e)
         */
      })

      /**
       * click event listener on each icon
       * show/hide restriction in the map based on which restriction you click in the legend
       */

      $('.grouplist em').click(function (e) {
        /**
         * check the attribute of this restriction
         * change the attribute accordingly
         * change the check (X/V) icon accordingly
         */

        if ($(this).next('label').attr('checkon') === 'on') {
          $(this).next('label').attr('checkon', 'off')
          $(this).removeClass('fa-check').addClass('fa fa-times')
        }
        else {
          $(this).next('label').attr('checkon', 'on')
          $(this).removeClass('fa-times').addClass('fa fa-check')
        }

        /**
         * hide the popup
         */

        overlay.overlay.setPosition(undefined)

        /**
         * get all the active restrictions
         * save it as a val of #featclick
         *  - we use it to update the layer parameters from the datepicker
         */

        const tmpsOrderSel = []
        $('label[checkon="on"]').each(function () {
          tmpsOrderSel.push($(this).attr('order'))
        })

        $('#featclick').val(tmpsOrderSel)

        /**
         * update the pmfeatlayer with the new value
         */

        layers.updateLayerParams(tmpsOrderSel, 0)
      })

      // end $.getJSON('data/features.json')
    })
    .fail((jqxhr, textStatus, error) => {
      const err = `${textStatus}, ${error}`
      alert(`Legend Request Failed: ${err}`)
    })

  /**
   * dipslay just predetermined group with parameters in the URL
   * run it with a timeout function to render and then click each button
   */

  /**
   * check if there is a parameters in the URL
   * check if the parameter is group and not other parameters like defpos
   */

  const urlGroup = window.location.search.replace('?', '')

  if (urlGroup.search('group') > -1) {
    /**
     * run everything with a timeout to let the legend time to be rendered
     */

    setTimeout(() => {
      /**
       * replace the spaces in the group name with an _ underscore and click all the buttons
       */

      for (let x = 0; x < makegroups.length; x++) {
        $('#' + makegroups[x].replace(' ', '_')).click()
      }

      /**
       * check which group has to be displayed
       * we check if splitting by & you have something back
       * based on that we take the correct parameter and we split it by /
       * we split by / to allow the customer to display more than one group at the same time
       * IMPORTANT: if the group contains spaces they need to replace it with an _ underscore
       * this code will work when you have multiple parameters in the URL
       * e.g. defpos + legend group
       * e.g. ?group=sign/waiting_restrictions
       */

      let groupToShow = ''

      if (urlGroup.split('&')[1]) {
        groupToShow = urlGroup.split('=')[2].split('/')
      }
      else {
        groupToShow = urlGroup.split('=')[1].split('/')
      }

      /**
       * check each button in the grouplist (makegroups)
       * if match the group to show simulate a click event
       * to avoid any possible error we pass it through a toLowerCase function
       */

      for (let y = 0; y < makegroups.length; y++) {
        for (let z = 0; z < groupToShow.length; z++) {
          if (makegroups[y].toLowerCase().replace(' ', '_') === groupToShow[z].toLowerCase()) {
            $('#' + makegroups[y].replace(' ', '_')).click()
          }
        }
      } // end for loop
    }, 800)

  /**
   * end if urlGroup
   * end legend function
   */
  }
}

/**
 * build the scheme list for public consultation
 */

const buildSchemeList = (getFixed, settings) => {
  /**
   * initialize the settings with the one in the functions module
   */

  let fixed = getFixed

  let twSettings = settings

  /**
   * show the schemeCard div
   */

  $('#schemeCard').show()

  /**
   * get the list of schemes from schemes.json
   */

  $.getJSON('data/schemes.json')
    .done((data) => {
      /**
       * get the main element where we will append the scheme list
       * start with an ID of 0 for the element
       */

      let collapsibleSet = $('#SchemeSearch')
      let eleId = 0

      /**
       * for each scheme in the list built the list
       */

      $.each(data.schemes, function () {
        const scheme = this

        /**
         * set the today date, the one in the scheme.dateclose and scheme.dateadvert
         * set the hour to 0:0
         */

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const tmpDateClose = scheme.dateclose.split('-')
        let closeDate = new Date(parseInt(tmpDateClose[0]), parseInt(tmpDateClose[1]) - 1, parseInt(tmpDateClose[2]))
        closeDate.setHours(0, 0, 0, 0)

        const tmpDateFrom = scheme.dateadvert.split('-')
        let fromDate = new Date(parseInt(tmpDateFrom[0]), parseInt(tmpDateFrom[1]) - 1, parseInt(tmpDateFrom[2]))
        fromDate.setHours(0, 0, 0, 0)

        /**
         * check if the scheme is inside the dateadvert and dateclose
         * The valueOf() method returns the primitive value of a Date object
         * it return a value like this 1544745600000 this is the value of today 15/12/2018
         */

        if (today.valueOf() <= closeDate.valueOf() && today.valueOf() >= fromDate.valueOf()) {
          /**
           * create a indipendent div for each scheme
           * append to it the title of each scheme
           */

          let collapsible = $('<div class="schemeHead"></div>')
          collapsible.append(`<h5>${scheme.name} <em class="fa fa-caret-right"></span></h5>`)

          /**
           * create a list to append to each scheme div
           */

          let list = $('<ul data-role="listview"></ul>')

          /**
           * if is telford append the send a comment link in each scheme list
           */

          if (fixed.comment === 'on') {
            list.append(`<li data-role='list-divider' class='list-divider'><button class='btn telfschemecomm' style='width:auto !important;' value='${scheme.name}'>Send a comment</button></li>`)
          }

          /**
           * add the from/to advertise date at the beginning of the list
           */

          const fromDate = scheme.dateadvert.split('-')

          list.append(`<li data-role='list-divider' class='list-divider'>Advertised from ${fromDate[2]}/${fromDate[1]}/${fromDate[0]} to ${tmpDateClose[2]}/${tmpDateClose[1]}/${tmpDateClose[0]}</li>`)

          /**
           * check if the scheme has a document attached
           * if a document is attached append a scheme document element
           * add a link to that document in the scheme document word
           */

          if (scheme.schemedoc !== '' && scheme.schemedoc !== undefined) {
            const schDoc = twSettings.sched + encodeURIComponent(scheme.schemedoc)
            list.append(`<li id='schemedoc${eleId}'><a target='_blank' rel='noopener noreferrer' href='${schDoc}'><p id='schemnote${eleId}'>Scheme Document</p></a></li>`)
          }

          /**
           * get the streets connected to each scheme
           */

          const theStreets = scheme.streets

          $.each(theStreets, function () {
            /**
             * save each street to a mystreet var
             * assign the date of today to dCloseSDate
             */

            const mystreet = this
            let dCloseSDate = today

            /**
             * if the screet has a dateclose property
             * change the dCloseSDate to the correct date
             * set the hour to 0:0
             */

            if (mystreet.hasOwnProperty('dateclose')) {
              const tmpSDateC = mystreet.dateclose.split('-')
              dCloseSDate = new Date(parseInt(tmpSDateC[0]), parseInt(tmpSDateC[1]) - 1, parseInt(tmpSDateC[2]))
              dCloseSDate.setHours(0, 0, 0, 0)
            }

            /**
             * check if the date of the street is expired
             */

            if (today.valueOf() <= dCloseSDate.valueOf()) {
              /**
               * create the list of street
               */

              const streetName = $(`<li id='streetlist${eleId}'><a><p id='streetname${eleId}'>${mystreet.name}</p></a></li>`)

              /**
               * click event listener for each street
               */

              streetName.click(() => {
                /**
                 * move the map to the correct coordinates
                 */

                map.getMap().getView().centerOn([mystreet.easting, mystreet.northing], map.getMap().getSize(), [($('#map').innerWidth() / 2), ($('#map').innerHeight() / 2)])
                map.getMap().getView().setResolution(map.getResolution()[map.getResolution().length - 1])
                map.getMap().updateSize()

                /**
                 * after moving the map close the menu if is a mobile device
                 */

                if (window.innerWidth < 768) {
                  $('#dropdownDiv').toggleClass('show')
                }
              }) // end click event listener

              /**
               * add the class streetname to the list
               * hide the list to default
               * append the streetName list to the list
               */

              list.addClass('streetname').hide()
              list.append(streetName)

              /**
               * increase the ID of the element
               */

              eleId++

            /**
             * end "if" show street if not expired
             * end $.each(theStreets, function () {
             */
            }
          })

          /**
           * append the list to the schem div
           * append the scheme div to the main div
           */

          collapsible.append(list)
          collapsibleSet.append(collapsible)

          /**
           * end if (today.valueOf() <= closeDate.valueOf()) {
           * end $.each(data.schemes, function () {
           */
        }
      })

      /**
       * click event listener on each title
       */

      $('.schemeHead h5').on('click', function () {
        /**
         * open/close the list
         * change the arrow icon at the end of the text
         */

        $(this).next('.streetname').toggle()
        $(this).children('em').toggleClass('fa-caret-right fa-caret-down')
      })

      /**
       * check if there are list in the container
       */

      if ($('.schemeHead').length === 0) {
        /**
         * if no scheme are present
         * appen a message that there are no scheme at the moment
         * append it to the scheme div
         */

        let collapsible = $('<div class="schemeHead"></div>')
        collapsible.append('<h4>There are no schemes under consultation at present.</h4>')
        collapsibleSet.append(collapsible)
      }
    }) // end DONE
    .fail((jqxhr, textStatus, error) => {
      const err = `${textStatus}, ${error}`
      alert(`Build Scheme list Request Failed: ${err}`)
    })
} // end buildSchemeList

/**
 * public consultation legend
 */

const buildPCLegendList = () => {
  /**
   * show the public consultation legend
   * hide the TRO switchdisplay div
   */

  $('#pcLegend').show()
  $('#switchdisplay').hide()

  // select val for change the layers
  $('#select_layers').change(function () {
    /**
     * get the value of the selected layer
     * assing it to a var
     * update the parkmap layer parameter
     * hide the popup
     */

    const $this = this.value
    layers.changePCLayer($this, functions.getFixedSettings(), functions.getTwSettings())

    overlay.overlay.setPosition(undefined)
  })

  /**
   * get the features from features.json
   */

  $.getJSON('data/features.json')
    .done((data) => {
      /**
       * create an list and append it to feature_list
       */

      $('<ul>').addClass('pcLegend').appendTo('#pcLegend')

      $.each(data.features, function () {
        /**
         * asign this to the legend var
         */
        const legend = this

        /**
         * create a list for each feature
         */

        $('<li>', {
          id: `li${legend.order_id}`,
        })
          .appendTo('.pcLegend')

        $('<p>').html(legend.name).appendTo(`#li${legend.order_id}`)

        /**
         * create the parkmap legend
         * initialize the PC form
         */

        parkmapLegend(legend)

        pccomments.initPcForm()

        /**
         * end for each loop
         * end if features in data
         */
      })
    })
    .fail((jqxhr, textStatus, error) => {
      const err = `${textStatus}, ${error}`
      alert(`Public Consultation Legend Request Failed: ${err}`)
    })
} // end buildPCLegendList

/**
 * create the parkmap legend
 * we use the same for TRO and for PC
 */

const parkmapLegend = (item) => {
  /**
   * create the correct image at the right of the label element
   */

  /**
   * if is a line take the image from the cdn
   * style it based on the style in features.json
   * append it to the correct list
   */

  if (item.type === 'line') {
    $('<img>', {
      src: 'https://cdn.traffweb.uk/cdn/css/images/transparent.png',
      style: `background-color:${item.stroke};border:solid 1px black;`
    }).addClass(`line${item.line_id}_${item.stroke_width}`).appendTo(`#li${item.order_id}`)
  }

  /**
   * if is a point take the image from the features.json
   * remove background color
   * append it to the correct list
   */

  else if (item.type === 'point') {
    $('<img>', {
      src: item.image,
      style: 'background-color:none;'
    }).appendTo(`#li${item.order_id}`)
  }

  /**
   * if is a region take the image from the CDN
   * style it based on the style in features.json
   * append it to the correct list
   */

  else if (item.type === 'region') {
    $('<img>', {
      src: 'https://cdn.traffweb.uk/cdn/css/images/transparent.png',
      style: `background-color:${item.stroke};border:none;`
    }).addClass(`region${item.region_id}`).appendTo(`#li${item.order_id}`)
  }
}

/**
 * EXPORT
 */

export default {
  initLegend,
  buildLegendList
}
