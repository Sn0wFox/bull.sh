// Polyfill
// import './libs/js/ie/html5shiv';
// import './libs/js/ie/respond.min';

// Libs
import $    from 'jquery';
import skel from 'skel.min';
import 'skel-util';

import {runAnimatedScroll, initMenu, initHeader} from './commons/common';

// Init page
init();

/**
 * Initialize the page by adding breakpoints, events handlers and panel menu
 * to the page.
 */
function init() {
  skel
    .breakpoints({
      xlarge:	'(max-width: 1680px)',
      large:	'(max-width: 1280px)',
      medium:	'(max-width: 980px)',
      small:	'(max-width: 736px)',
      xsmall:	'(max-width: 480px)'
    });

  $(function() {

    // Cache jquery request
    let	$window = $(window);
    let $body = $('body');
    let $banner = $('#bull-banner');

    // Disable animations/transitions until the page has loaded.
    $body.addClass('is-loading');

    $window.on('load', () => {
      window.setTimeout(() => {
        $body.removeClass('is-loading');
      }, 100);
    });

    // Handle mobile size
    if (skel.vars.mobile) {
      $body.addClass('is-mobile');
    }
    else {
      skel
        .on('-medium !medium', () => {
          $body.removeClass('is-mobile');
        })
        .on('+medium', () => {
          $body.addClass('is-mobile');
        });
    }

    // Fix: Placeholder polyfill.
    $('form').placeholder();

    // Prioritize "important" elements on medium.
    skel.on('+medium -medium', () => {
      $.prioritize(
        '.important\\28 medium\\29',
        skel.breakpoint('medium').active
      );
    });

    // Initialize scrolly
    $('.scrolly')
      .on('click', (event) => {
        event.preventDefault();
        runAnimatedScroll(event.target.hash, 1000);
      });

    // Initialize panel menu
    initMenu('#menu', $body);

    // Initialize header
    initHeader('#bull-header', $banner, $window)

  });


}