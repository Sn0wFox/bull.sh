import $ from 'jquery';
import 'notifyjs-browser';
import 'skel-util';

/**
 * Scroll to the given hash during the given time.
 * @param hash The id to scroll to. Default to #.
 * @param time The time allowed to scroll, in ms. Default to 500.
 */
export function runAnimatedScroll(hash, time) {
  time = time || 500;
  hash = hash || '#';

  $('html, body').animate({
    scrollTop: $(hash).offset().top
  }, time, () => {
    window.location.hash = hash;
  })
}

/**
 * Initialize the menu by creating a toggleable
 * panel with all the items in the menu.
 * @param hash The hash of the menu to init.
 * @param $body A jquery object representing the DOM body.
 */
export function initMenu(hash, $body) {
  $(hash)
    .append('<a href="#menu" class="close"></a>')
    .appendTo($body)
    .panel({
      delay: 500,
      hideOnClick: true,
      hideOnSwipe: true,
      resetScroll: true,
      resetForms: true,
      side: 'right',
      target: $body,
      visibleClass: 'is-menu-visible'
    });
}

/**
 * Initialize the header by triggering its appearing
 * when the viewport leaves the given element.
 * @param hash The hash of the header to init.
 * @param $triggeringElement The jquery object representing the element which will trigger the header appearing.
 * @param $window The jquery window object.
 */
export function initHeader(hash, $triggeringElement, $window) {
  let $header = $(hash);
  if ($triggeringElement.length > 0 && $header.hasClass('alt')) {
    $window.on('resize', () => { $window.trigger('scroll'); });
    $triggeringElement.scrollex({
      bottom:     $header.outerHeight() + 1,
      terminate:	function() { $header.removeClass('alt'); },
      enter:      function() { $header.addClass('alt'); },
      leave:      function() { $header.removeClass('alt'); }
    });
  }
}

export function initNotifications() {
  $.notify.addStyle('bull', {
    html: '<div><span data-notify-text/></div>'
  });
}