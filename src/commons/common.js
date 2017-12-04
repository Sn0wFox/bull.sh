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