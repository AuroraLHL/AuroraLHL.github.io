$(document).ready(function () {
  // add toggle functionality to abstract, award and bibtex buttons
  $("a.abstract").click(function () {
    $(this).parent().parent().find(".abstract.hidden").toggleClass("open");
    $(this).parent().parent().find(".award.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden.open").toggleClass("open");
  });
  $("a.award").click(function () {
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".award.hidden").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden.open").toggleClass("open");
  });
  $("a.bibtex").click(function () {
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".award.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden").toggleClass("open");
  });
  $("a").removeClass("waves-effect waves-light");

  // bootstrap-toc
  if ($("#toc-sidebar").length) {
    var navSelector = "#toc-sidebar";
    var $myNav = $(navSelector);
    var $tocScope = $("#markdown-content");

    // Keep publication year headings out of shared TOC generation.
    $(".publications h2").attr("data-toc-skip", "");

    if ($tocScope.length) {
      // Blog posts only expose markdown h1/h2 in the sidebar TOC.
      $tocScope.find("h3, h4, h5, h6").attr("data-toc-skip", "");
      Toc.init({
        $nav: $myNav,
        $scope: $tocScope,
      });
    } else {
      Toc.init($myNav);
    }

    var $topLevelItems = $myNav.children("ul").children("li").has("ul");

    function getTocSectionItem($link) {
      var $parentSection = $link.closest("ul").closest("li");
      return $parentSection.length ? $parentSection : $link.closest("li");
    }

    function expandTocSection($section) {
      $topLevelItems.removeClass("toc-expanded");
      if ($section && $section.length) {
        $section.addClass("toc-expanded");
      }
    }

    function getHeadingElement(hash) {
      if (!hash || hash.charAt(0) !== "#") {
        return null;
      }

      return document.getElementById(decodeURIComponent(hash.slice(1)));
    }

    function expandTocForHash(hash) {
      if (!hash) {
        return;
      }

      var $targetLink = $myNav.find("a").filter(function () {
        return $(this).attr("href") === hash;
      });

      if ($targetLink.length) {
        expandTocSection(getTocSectionItem($targetLink.first()));
      }
    }

    var tocHeadingEntries = $myNav
      .find("a")
      .map(function () {
        var $link = $(this);
        var heading = getHeadingElement($link.attr("href"));

        if (!heading) {
          return null;
        }

        return {
          $link: $link,
          $section: getTocSectionItem($link),
          heading: heading,
        };
      })
      .get();

    function expandTocForScroll() {
      if (!tocHeadingEntries.length) {
        return;
      }

      var activeEntry = tocHeadingEntries[0];
      var scrollOffset = 96;

      tocHeadingEntries.forEach(function (entry) {
        if (entry.heading.getBoundingClientRect().top <= scrollOffset) {
          activeEntry = entry;
        }
      });

      expandTocSection(activeEntry.$section);
    }

    var isTocScrollSyncQueued = false;

    function queueTocScrollSync() {
      if (isTocScrollSyncQueued) {
        return;
      }

      isTocScrollSyncQueued = true;
      window.requestAnimationFrame(function () {
        isTocScrollSyncQueued = false;
        expandTocForScroll();
      });
    }

    $myNav.on("click", "a", function () {
      expandTocSection(getTocSectionItem($(this)));
    });

    expandTocForHash(window.location.hash);
    $(window).on("hashchange", function () {
      expandTocForHash(window.location.hash);
    });
    $(window).on("scroll resize", queueTocScrollSync);

    $("body").scrollspy({
      target: navSelector,
    });

    queueTocScrollSync();
  }

  // add css to jupyter notebooks
  const cssLink = document.createElement("link");
  cssLink.href = "../css/jupyter.css";
  cssLink.rel = "stylesheet";
  cssLink.type = "text/css";

  let jupyterTheme = determineComputedTheme();

  $(".jupyter-notebook-iframe-container iframe").each(function () {
    $(this).contents().find("head").append(cssLink);

    if (jupyterTheme == "dark") {
      $(this).bind("load", function () {
        $(this).contents().find("body").attr({
          "data-jp-theme-light": "false",
          "data-jp-theme-name": "JupyterLab Dark",
        });
      });
    }
  });

  // trigger popovers
  $('[data-toggle="popover"]').popover({
    trigger: "hover",
  });
});
