/*
 * JavaScript code for https://thanethomson.com/
 */

var oldTocHeading = null;
var curTocHeading = null;
var firstTocHeading = null;

function toggleMenu() {
    $('nav.primary').toggleClass('open');
}

function determineCurrentTocHeading() {
    var headings = $('div.full-post h2');
    var scrollTop = $(window).scrollTop();
    headings.each(function() {
        var heading = $(this);
        if (scrollTop + 200 > heading.offset().top) {
            curTocHeading = heading.attr("menuItem");
        }
    }).promise().done(function() {
        // if there's no heading selected yet, just select the first one
        if (curTocHeading == null) {
            curTocHeading = firstTocHeading;
        }

        if (curTocHeading != oldTocHeading) {
            $('nav.toc ul li').removeClass("active");
            $('#'+curTocHeading).addClass("active");
            oldTocHeading = curTocHeading;
        }
    });
}

function buildToc() {
    var tocNav = $('nav.toc');
    if (tocNav.length) {
        var tocNavUl = $('nav.toc ul');
        var headings = $('div.full-post h2');
        headings.each(function() {
            var heading = $(this);
            var permalink = $($("a.permalink", this)[0]).attr("href");
            var text = ("" + heading.text()).replace("#", "");
            var menuItemId = "menu-item-"+permalink.replace("#", "");
            heading.attr("menuItem", menuItemId);
            tocNavUl.append('<li class="l2" id="'+menuItemId+'"><a href="'+permalink+'">'+text+'</a></li>');
        }).promise().done(function() {
            firstTocHeading = headings.first().attr("menuItem");

            $(window).scroll(function() {
                determineCurrentTocHeading();

                if ($(window).scrollTop() > 200) {
                    tocNav.css('padding-top', 50);
                } else {
                    tocNav.css('padding-top', 160);
                }
            });

            determineCurrentTocHeading();
        });
    }
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

    buildToc();
});

// HighlightJS init
hljs.initHighlightingOnLoad();
