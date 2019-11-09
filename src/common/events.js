/**
 * in this module there are:
 *   - copyright year
 *   - dropdown behaviour for the tool menu
 *   - hide/show navbar/tool menu on click for mobile
 *   - general behaviour for all the buttons in the page
 *   - print button behaviour
 */

/**
 * we create a big function to initialize all the events inside
 * and we call this function in the main app
 */

const initEvents = () => {
  /**
   * apply the correct year in the footer
   */

  const currentYear = new Date().getFullYear()
  $('#Copyright').text(currentYear)

  /**
   * dropdown behaviour
   * !! we don't use an arrow function because the this is not bind !!
   * it prevent to close the menu when you click on a sibling element
   */

  $('.dropdown-toggle').on('click', function (e) {
    $(this).closest('div .dropdown').toggleClass('show')
    $(this).siblings('.dropdown-menu').toggleClass('show')
    e.stopPropagation()
    e.preventDefault()
  })

  /**
  * accordion behaviour
  */

  $('.collapse').on('show.bs.collapse', () => {
    $('.collapse').collapse('hide')
  })

  /**
   * hide navbar/tool menu section on click for mobile
   */

  if (window.innerWidth < 768) {
    // hide the navbar when you click on the tools button
    $('#dropdownMenu').on('click', () => {
      if ($('#mainNav').hasClass('show')) {
        $('#mainNav').removeClass('show')
      }
    })

    // hide the tools section when you click on the navbar
    $('.navbar-toggler').on('click', () => {
      if ($('#dropdownDiv').hasClass('show')) {
        $('#dropdownDiv').removeClass('show')
      }
    })

    // hide the navbar when you change the selected layer (PC)
    $('#select_layers').change(() => {
      $('#dropdownDiv').toggleClass('show')
    })
  }

  /**
   * hide/show the printer div on click
   */

  $('#printbtn').click((e) => {
    e.preventDefault()
    $('.printopt').toggleClass('hide')
  })
} // end initEvent

/**
 * EXPORT
 */

export default {
  initEvents
}
