/**
 * set the divs heights
 */

// we create a function to use it later on in multiples DOM events
const sizeContent = () => {
  // maximum window height
  const viewHeight = window.innerHeight

  let navIsOpen = $('.navbar-collapse.collapse.show').length

  if (navIsOpen) {
    $('#mainNav').removeClass('show')
  }
  // navbar height
  let headHeight = $('.navbar').outerHeight()
  let navHeight = $('.navbar').attr('navheight')
  if (navHeight !== undefined) {
    if (headHeight > navHeight) {
      headHeight = navHeight
    }
  }
  else {
    navHeight = headHeight
  }
  // footer height
  const footHeight = parseFloat($('footer').outerHeight())
  // maximum view minus the header and the footer
  const maxHeight = parseFloat(viewHeight) - (parseFloat(headHeight) + parseFloat(footHeight))
  // .section is the div that contain the zoom buttons print and ruler
  let sectionHeight = ''
  if ($('.section').outerHeight() !== undefined) {
    sectionHeight = $('.section').outerHeight()
  }
  else {
    sectionHeight = 0
  }
  // 180 is the height of the search input + button and upper padding
  const searchHeight = 180

  /**
   * apply correct max height of the whole tools menu container
   * 43 is the heigh of an accordion button
   * (maxHeight - ..) depends of where is located the toolbar button
   * (mobile in the header or tablet onward inside the map)
   */

  const mobAccordionHeight = (maxHeight - 10) - sectionHeight - (43 * 3)
  const deskAccordionHeight = (maxHeight - 50) - sectionHeight - (43 * 5)
  const mobAccordionHeightInv = (maxHeight - 10) - sectionHeight - (43 * 4)
  const deskAccordionHeightInv = (maxHeight - 50) - sectionHeight - (43 * 7)

  /**
   * apply fixed height at the max
   * add margin top to compensate the navbar height
   */

  $('#map').css('height', maxHeight)
  $('#map').css('top', headHeight)

  if ($(window).width() < 768) {
    // limit the tools menu container
    $('#dropdownDiv').css('max-height', maxHeight - 10)
    // limit the scheme container
    $('#schemes').css('max-height', mobAccordionHeight)
    // limit the search container on search
    $('#searchcont').css('max-height', mobAccordionHeight - searchHeight)
    // limit the legend height
    $('#legend .card-body').css('max-height', mobAccordionHeight)
    $('#pmlegend .card-body').css('max-height', mobAccordionHeightInv)
    $('#rtclegend .card-body').css('max-height', mobAccordionHeightInv)
    $('#invlegend .card-body').css('max-height', mobAccordionHeightInv)
  }
  else {
    // limit the tools menu container
    $('#dropdownDiv').css('max-height', maxHeight - 50)
    // limit the scheme container
    $('#schemes').css('max-height', deskAccordionHeight)
    // limit the search container on search
    $('#searchcont').css('max-height', deskAccordionHeight - searchHeight)
    // limit the legend height
    $('#legend .card-body').css('max-height', deskAccordionHeight)
    $('#pmlegend .card-body').css('max-height', deskAccordionHeightInv)
    $('#rtclegend .card-body').css('max-height', deskAccordionHeightInv)
    $('#invlegend .card-body').css('max-height', deskAccordionHeightInv)
  }
} // end sizeContent

/**
 * EXPORT
 */

export default {
  sizeContent
}
