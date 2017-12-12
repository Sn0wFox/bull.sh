// Libs
import $    from 'jquery';
import skel from 'skel.min';
import 'skel-util';
import 'notifyjs-browser';

import {runAnimatedScroll, initMenu, initHeader, initNotifications} from './commons/common';


// Handle forms opening / closing
let newsFormOpen = false;
let contactFormOpen = false;

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
    let $window = $(window);
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
        runAnimatedScroll(event.target.hash, 1000, 0);
      });

    // Initialize panel menu
    initMenu('#menu', $body);

    // Initialize header
    initHeader('#bull-header', $banner, $window);

    // Add custom notification style
    initNotifications();

    // Init form buttons
    $('#bull-toggle-newsletter').on('click', () => {
      toggleForm('newsletter');
      if(!newsFormOpen) { // It will be opened in a few seconds
        runAnimatedScroll('#bull-newsletter-form', 1000);
      }
    });
    $('#bull-toggle-contact').on('click', () => {
      toggleForm('contact');
      if(!contactFormOpen) {  // It will be opened in a few seconds
        runAnimatedScroll('#bull-contact-form');
      }
    });

    // Init form notifications
    $('#bull-contact-form').find('form').on('submit', function(event) {
      event.preventDefault();
      let $form = $(this);
      let valid = basicValidateForm($form);

      if(valid) {
        $.notify(`Merci ${$form.find('input[name="name"]').val()}, votre message a été transmis à notre équipe.`, {
          style: 'bull'
        });
        $form.trigger('reset');
      }
    });
    $('#bull-newsletter-form').find('form').on('submit', function(event) {
      event.preventDefault();
      let $form = $(this);
      let valid = basicValidateForm($form);

      if(valid) {
        $.notify(`Merci ${$form.find('input[name="name"]').val()}, vous recevrez bientôt notre newsletter hebdomadaire. A très vite!.`, {
          style: 'bull'
        });
        $form.trigger('reset');
      }
    });
  });
}


/**
 * Toggle the given form by sliding it in or out
 * from top to bottom.
 * @param form The form to toogle. Either 'newsletter' or 'contact'.
 */
function toggleForm(form) {
  let newsHash = '#bull-newsletter-form';
  let contactHash = '#bull-contact-form';
  let toggleSpeed = 300;  // ms

  switch(form) {
    case 'newsletter':
      if(contactFormOpen) {
        $(contactHash).slideToggle(toggleSpeed, () => contactFormOpen = false);
      }
      $(newsHash).slideToggle(toggleSpeed, () => newsFormOpen = !newsFormOpen);
      break;
    case 'contact':
      if(newsFormOpen) {
        $(newsHash).slideToggle(toggleSpeed, () => newsFormOpen = false);
      }
      $(contactHash).slideToggle(toggleSpeed, () => contactFormOpen = !contactFormOpen);
      break;
  }
}

/**
 * Validate a given form by checking that each field with the class
 * .required is not empty.
 * If a field is not valid, display a notification under it.
 * @param $form The jQuery object representing the form to validate.
 * @return {boolean} Whether the form is valid or not.
 */
function basicValidateForm($form) {
  let valid = true;
  $form.find('.required').each((_, elem) => {
    let $input = $(elem);
    if(!$input.val()) {
      valid = false;
      $input.notify('Ce champ ne doit pas être vide', {
        style: 'bull',
        autoHideDelay: 2000
      });
      return false;
    }
  });
  return valid;
}