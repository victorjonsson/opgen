(function ($, window) {
  var $window = $(window), Pager = {currentPage: false, lastSection: false, isChangingPage: false, isFirstLoad: true, goTo: function (page, callback, args) {
    var pageSection = false;
    if (page.indexOf("_") > -1) {
      pageSection = page.split("_")[1];
      page = page.split("_")[0]
    }
    var $newPage = $("#" + page), changedPage = page != this.currentPage;
    if (!$newPage.hasClass("page")) {
      if (!$newPage.is(":visible")) {
        return this.goTo("home", callback)
      } else {
        return true
      }
    }
    if (this.lastSection && this.lastSection == pageSection && !this.isChangingPage) {
      var $section = $('*[data-page-section^="' + pageSection + '"]');
      $("html, body").animate({scrollTop: $section.length ? $section.offset().top - 50 : 0}, 500)
    } else if (!this.isChangingPage && (changedPage || pageSection)) {
      if ($newPage.length > 0) {
        this.isChangingPage = true;
        var nextPage = function () {
          var nextPageLoaded = function () {
            Pager.isChangingPage = false;
            if (pageSection) {
              Pager.lastSection = pageSection;
              var $section = $('*[data-page-section^="' + pageSection + '"]');
              $("html, body").animate({scrollTop: $section.offset().top - 50}, 500)
            } else {
              $("html, body").animate({scrollTop: 0}, 0)
            }
            $window.trigger("pageChange", [page, args, pageSection]);
            if (Pager.isFirstLoad) {
              Pager.isFirstLoad = false
            }
          };
          if (page != Pager.currentPage) {
            $newPage.fadeIn("normal", nextPageLoaded)
          } else {
            nextPageLoaded()
          }
          Pager.currentPage = page;
          if (typeof callback == "function") {
            callback(changedPage)
          }
        };
        if (this.currentPage && page != Pager.currentPage) {
          $("#" + this.currentPage).fadeOut("fast", nextPage)
        } else {
          nextPage()
        }
      }
    } else if (page == this.currentPage) {
      $window.trigger("pageChange", [page, args])
    }
    return false
  }}, $subMenus = $(".submenu"), $menuLinks = $(".nav a"), $subMenuLinks = $(".menu-link");
  $window.bind("hashchange", function (evt) {
    var href = window.location.hash.substr(1), args = href.split("=")[1];
    href = href.split("=")[0];
    return Pager.goTo(href, function (changedPage) {
      var pageRef = Pager.currentPage;
      $menuLinks.parent().removeClass("active");
      $menuLinks.filter('[href="#' + pageRef + '"]').eq(0).parent().addClass("active");
      if (changedPage) {
        $subMenus.filter(".open-sub-menu").removeClass("open-sub-menu").slideUp();
        $subMenuLinks.find(".arr").html("&#9660;");
        $subMenuLinks.filter('[href="#' + pageRef + '"]').find(".arr").html("&#9650;");
        $subMenus.filter("." + pageRef).addClass("open-sub-menu").slideDown()
      }
    }, args);
    return false
  });
  var $search = $(".search-wrapper"), $pages = $(".page"), PageSearch = {$result: $("#search-result"), search: function (str) {
    str = $.trim(str.toLocaleLowerCase());
    var resultLinks = {}, _search = function (str, addToResultLinks) {
      var result = [];
      $pages.filter(":not(#search)").each(function () {
        var link = $(this).attr("id"), id = link, $children = $(this).children(), i, paragraph = false, pageName = false, relevance = 0;
        for (i = 0; i < $children.length; i++) {
          var $elem = $children.eq(i), section = $elem.attr("data-page-section"), nodeName = $elem.get(0).nodeName;
          if (nodeName == "PRE" || nodeName == "CODE")continue;
          if (section) {
            if (relevance) {
              var found = {relevance: relevance, link: link, paragraph: paragraph, pageName: pageName}, added = false;
              if (addToResultLinks)resultLinks[link] = 1;
              $.each(result, function (i, obj) {
                if (found.relevance > obj.relevance) {
                  added = true;
                  result.splice(i, 0, found);
                  return false
                }
              });
              if (!added) {
                result.push(found)
              }
            }
            relevance = 0;
            link = id + "_" + section;
            paragraph = false;
            pageName = false
          }
          if (!pageName && (nodeName == "H1" || nodeName == "H2" || nodeName == "H3")) {
            pageName = $elem.text()
          }
          var html = $elem.html().toLocaleLowerCase();
          relevance += html.split(str).length - 1;
          if (relevance && !paragraph) {
            paragraph = $.trim($("<div>" + html + "</div>").text()).replace(new RegExp(str, "g"), '<strong class="found">' + str + "</strong>")
          }
        }
      });
      return result
    };
    var totalResults = _search(str, true), words = str.split(" ");
    if (words.length) {
      $.each(words, function (i, w) {
        var found = _search(w), added = 0;
        $.each(found, function (i, resultItem) {
          if (!(resultItem.link in resultLinks)) {
            added++;
            resultLinks[resultItem.link] = 1;
            totalResults.push(resultItem)
          }
        })
      })
    }
    return totalResults.splice(0, 100)
  }, onPageSearch: function (evt, path, args) {
    if (path == "search") {
      $search.find("input").val(args);
      var result = PageSearch.search(args);
      PageSearch.$result.html("").append("<p>Found " + result.length + " matching results</p>");
      $.each(result, function (i, item) {
        $('<div><h3><a href="#' + item.link + '">' + item.pageName + "</a></h3><p>" + item.paragraph + "</p></div>").appendTo(PageSearch.$result)
      })
    }
  }, init: function () {
    $search.find("label").on("click", function () {
      var val = $.trim($(this).parent().find("input").val());
      if (val.length > 1) {
        window.location = "#search=" + val;
        Pager.goTo("search", {}, val)
      }
    });
    $search.find("input").on("keydown", function (evt) {
      if (evt.keyCode == 13) {
        $(this).parent().find("label").trigger("click")
      }
    })
  }};
  window.Pager = Pager;
  window.PageSearch = PageSearch;
  $window.on("pageChange", PageSearch.onPageSearch);
  PageSearch.init();
  $subMenus.filter(":not(." + Pager.currentPage + ")").slideUp();
  $subMenuLinks.filter('[href="#' + Pager.currentPage + '"]').find(".arr").html("&#9660;");
  $(function () {
    if (window.location.hash) {
      $window.trigger("hashchange")
    } else {
      Pager.goTo("home", function () {
        $menuLinks.filter('[href="#home"]').eq(0).parent().addClass("active")
      })
    }
  });
  $("a").on("click", function () {
    var hash = (this.href || "").split("#")[1];
    if (hash == window.location.hash.substr(1)) {
      $window.trigger("hashchange");
      return false
    }
  });
  if (window.preventViewModeChange !== false) {
    var currentMode = "desktop", $navToggle = false, $sideColumn = $("#side-col"), $body = $("body"), mobileMode = function (toggle) {
      if ($window.width() < 490) {
        if (currentMode != "mobile") {
          $body.addClass("mobile");
          $navToggle = $('<a href="#" class="nav-toggle">Navigation &#x25BC;</a>');
          $navToggle.insertBefore("#side-col");
          $navToggle.click(function () {
            if ($sideColumn.is(":visible")) {
              $navToggle.html("Navigation &#x25BC;");
              $sideColumn.slideUp()
            } else {
              $navToggle.html("Navigation &#x25B2;");
              $sideColumn.slideDown()
            }
            return false
          });
          currentMode = "mobile";
          $sideColumn.slideUp()
        }
        $window.trigger("viewModeChange", [currentMode])
      } else if (currentMode != "desktop") {
        currentMode = "desktop";
        $body.removeClass("mobile");
        $navToggle.remove();
        $sideColumn.slideDown();
        $window.trigger("viewModeChange", [currentMode])
      }
    };
    $(mobileMode);
    $window.on("resize", mobileMode)
  }
})(jQuery, window);
(function ($, window) {
  var $window = $(window), Pager = {currentPage: false, lastSection: false, isChangingPage: false, isFirstLoad: true, goTo: function (page, callback, args) {
    var pageSection = false;
    if (page.indexOf("_") > -1) {
      pageSection = page.split("_")[1];
      page = page.split("_")[0]
    }
    var $newPage = $("#" + page), changedPage = page != this.currentPage;
    if (!$newPage.hasClass("page")) {
      if (!$newPage.is(":visible")) {
        return this.goTo("home", callback)
      } else {
        return true
      }
    }
    if (this.lastSection && this.lastSection == pageSection && !this.isChangingPage) {
      var $section = $('*[data-page-section^="' + pageSection + '"]');
      $("html, body").animate({scrollTop: $section.length ? $section.offset().top - 50 : 0}, 500)
    } else if (!this.isChangingPage && (changedPage || pageSection)) {
      if ($newPage.length > 0) {
        this.isChangingPage = true;
        var nextPage = function () {
          var nextPageLoaded = function () {
            Pager.isChangingPage = false;
            if (pageSection) {
              Pager.lastSection = pageSection;
              var $section = $('*[data-page-section^="' + pageSection + '"]');
              $("html, body").animate({scrollTop: $section.offset().top - 50}, 500)
            } else {
              $("html, body").animate({scrollTop: 0}, 0)
            }
            $window.trigger("pageChange", [page, args, pageSection]);
            if (Pager.isFirstLoad) {
              Pager.isFirstLoad = false
            }
          };
          $window.trigger("beforePageChange", [page, args, pageSection]);
          if (page != Pager.currentPage) {
            $newPage.fadeIn("normal", nextPageLoaded)
          } else {
            nextPageLoaded()
          }
          Pager.currentPage = page;
          if (typeof callback == "function") {
            callback(changedPage)
          }
        };
        if (this.currentPage && page != Pager.currentPage) {
          $("#" + this.currentPage).fadeOut("fast", nextPage)
        } else {
          nextPage()
        }
      }
    } else if (page == this.currentPage) {
      $window.trigger("pageChange", [page, args])
    }
    return false
  }}, $subMenus = $(".submenu"), $menuLinks = $(".nav a"), $subMenuLinks = $(".menu-link");
  $window.bind("hashchange", function (evt) {
    var href = window.location.hash.substr(1), args = href.split("=")[1];
    href = href.split("=")[0];
    return Pager.goTo(href, function (changedPage) {
      var pageRef = Pager.currentPage;
      $menuLinks.parent().removeClass("active");
      $menuLinks.filter('[href="#' + pageRef + '"]').eq(0).parent().addClass("active");
      if (changedPage) {
        $subMenus.filter(".open-sub-menu").removeClass("open-sub-menu").slideUp();
        $subMenuLinks.find(".arr").html("&#9660;");
        $subMenuLinks.filter('[href="#' + pageRef + '"]').find(".arr").html("&#9650;");
        $subMenus.filter("." + pageRef).addClass("open-sub-menu").slideDown()
      }
    }, args);
    return false
  });
  var $search = $(".search-wrapper"), $pages = $(".page"), PageSearch = {$result: $("#search-result"), search: function (str) {
    str = $.trim(str.toLocaleLowerCase());
    var resultLinks = {}, _search = function (str, addToResultLinks) {
      var result = [];
      $pages.filter(":not(#search)").each(function () {
        var link = $(this).attr("id"), id = link, $children = $(this).children(), i, paragraph = false, pageName = false, relevance = 0;
        for (i = 0; i < $children.length; i++) {
          var $elem = $children.eq(i), section = $elem.attr("data-page-section"), nodeName = $elem.get(0).nodeName;
          if (nodeName == "PRE" || nodeName == "CODE")continue;
          if (section) {
            if (relevance) {
              var found = {relevance: relevance, link: link, paragraph: paragraph, pageName: pageName}, added = false;
              if (addToResultLinks)resultLinks[link] = 1;
              $.each(result, function (i, obj) {
                if (found.relevance > obj.relevance) {
                  added = true;
                  result.splice(i, 0, found);
                  return false
                }
              });
              if (!added) {
                result.push(found)
              }
            }
            relevance = 0;
            link = id + "_" + section;
            paragraph = false;
            pageName = false
          }
          if (!pageName && (nodeName == "H1" || nodeName == "H2" || nodeName == "H3")) {
            pageName = $elem.text()
          }
          var html = $elem.html().toLocaleLowerCase();
          relevance += html.split(str).length - 1;
          if (relevance && !paragraph) {
            paragraph = $.trim($("<div>" + html + "</div>").text()).replace(new RegExp(str, "g"), '<strong class="found">' + str + "</strong>")
          }
        }
      });
      return result
    };
    var totalResults = _search(str, true), words = str.split(" ");
    if (words.length) {
      $.each(words, function (i, w) {
        var found = _search(w), added = 0;
        $.each(found, function (i, resultItem) {
          if (!(resultItem.link in resultLinks)) {
            added++;
            resultLinks[resultItem.link] = 1;
            totalResults.push(resultItem)
          }
        })
      })
    }
    return totalResults.splice(0, 100)
  }, onPageSearch: function (evt, path, args) {
    if (path == "search") {
      $search.find("input").val(args);
      var result = PageSearch.search(args);
      PageSearch.$result.html("").append("<p>Found " + result.length + " matching results</p>");
      $.each(result, function (i, item) {
        $('<div><h3><a href="#' + item.link + '">' + item.pageName + "</a></h3><p>" + item.paragraph + "</p></div>").appendTo(PageSearch.$result)
      })
    }
  }, init: function () {
    $search.find("label").on("click", function () {
      var val = $.trim($(this).parent().find("input").val());
      if (val.length > 1) {
        window.location = "#search=" + val;
        Pager.goTo("search", {}, val)
      }
    });
    $search.find("input").on("keydown", function (evt) {
      if (evt.keyCode == 13) {
        $(this).parent().find("label").trigger("click")
      }
    })
  }};
  window.Pager = Pager;
  window.PageSearch = PageSearch;
  $window.on("pageChange", PageSearch.onPageSearch);
  PageSearch.init();
  $subMenus.filter(":not(." + Pager.currentPage + ")").slideUp();
  $subMenuLinks.filter('[href="#' + Pager.currentPage + '"]').find(".arr").html("&#9660;");
  $(function () {
    if (window.location.hash) {
      $window.trigger("hashchange")
    } else {
      Pager.goTo("home", function () {
        $menuLinks.filter('[href="#home"]').eq(0).parent().addClass("active")
      })
    }
  });
  $("a").on("click", function () {
    var hash = (this.href || "").split("#")[1];
    if (hash == window.location.hash.substr(1)) {
      $window.trigger("hashchange");
      return false
    }
  });
  if (window.preventViewModeChange !== false) {
    var currentMode = "desktop", $navToggle = false, $sideColumn = $("#side-col"), $body = $("body"), mobileMode = function (toggle) {
      if ($window.width() < 490) {
        if (currentMode != "mobile") {
          $body.addClass("mobile");
          $navToggle = $('<a href="#" class="nav-toggle">Navigation &#x25BC;</a>');
          $navToggle.insertBefore("#side-col");
          $navToggle.click(function () {
            if ($sideColumn.is(":visible")) {
              $navToggle.html("Navigation &#x25BC;");
              $sideColumn.slideUp()
            } else {
              $navToggle.html("Navigation &#x25B2;");
              $sideColumn.slideDown()
            }
            return false
          });
          currentMode = "mobile";
          $sideColumn.slideUp()
        }
        $window.trigger("viewModeChange", [currentMode])
      } else if (currentMode != "desktop") {
        currentMode = "desktop";
        $body.removeClass("mobile");
        $navToggle.remove();
        $sideColumn.slideDown();
        $window.trigger("viewModeChange", [currentMode])
      }
    };
    $(mobileMode);
    $window.on("resize", mobileMode)
  }
})(jQuery, window);
