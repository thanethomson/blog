/*
 * JavaScript code for https://thanethomson.com/
 */

function toggleMenu() {
  $('nav.primary').toggleClass('open');
}

$(document).ready(function() {
  $('nav.primary .menu-collapse a').click(function(e) {
    e.preventDefault();
    toggleMenu();
  });
  // close the menu if the user clicks anywhere else in the doc
  $('div.body').click(function() {
    if ($('nav.primary').hasClass('open')) {
      toggleMenu();
    }
  });
});

// HighlightJS init
hljs.initHighlightingOnLoad();
