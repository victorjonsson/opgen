(function($, window) {

    var Pager = {

        currentPage : false,

        lastSection : false,

        isChangingPage : false,

        isFirstLoad : true,

        goTo : function(page, callback, args) {

            var pageSection = false;
            if( page.indexOf('_') > -1 ) {
                pageSection = page.split('_')[1];
                page = page.split('_')[0];
            }

            var $newPage = $('#'+page);
            if( !$newPage.hasClass('page') ) {
                if( !$newPage.is(':visible') ) {
                    return this.goTo('home', callback);
                } else {
                    return true;
                }
            }

            if( !this.isChangingPage && (page != this.currentPage || pageSection) ) {

                if( $newPage.length > 0 ) {
                    this.isChangingPage = true;

                    var nextPage = function() {

                        var nextPageLoaded = function() {
                            Pager.isChangingPage = false;
                            if( pageSection ) {
                                // window.location.hash = '#' + Pager.currentPage;
                                Pager.lastSection = pageSection;
                                var $section = $('*[data-page-section="'+pageSection+'"]');
                                $('html, body').animate({
                                    scrollTop: $section.offset().top - 50
                                }, 500);
                            }
                            else {
                                $('html, body').animate({
                                    scrollTop: 0
                                }, 0);

                                if( Pager.isFirstLoad ) {
                                    Pager.isFirstLoad = false;
                                }
                            }

                            $(window).trigger('pageChange', [page, args, pageSection]);
                        };

                        if( page != Pager.currentPage ) {
                            $newPage.fadeIn('normal', nextPageLoaded);
                        } else {
                            nextPageLoaded();
                        }

                        Pager.currentPage = page;
                        if( typeof callback == 'function' ) {
                            callback();
                        }
                    };

                    if( this.currentPage && page != Pager.currentPage ) {
                        $('#'+this.currentPage).fadeOut('fast', nextPage);
                    } else {
                        nextPage();
                    }
                }
            } else if(page == this.currentPage) {
                $(window).trigger('pageChange', [page, args]);
            }
            return false;
        }
    },
    $subMenus = $('.submenu'),
    $menuLinks = $('.nav a'),
    $subMenuLinks = $('.menu-link');

    /*
     When page hash changes
     */
    $(window).bind('hashchange', function() {

        var href = window.location.hash.substr(1),
            args = href.split('=')[1];

        href = href.split('=')[0];

        return Pager.goTo(href, function() {

            var pageRef = Pager.currentPage;

            $menuLinks.parent().removeClass('active');
            $menuLinks.filter('[href="#'+pageRef+'"]').eq(0).parent().addClass('active');
            $subMenuLinks.find('.arr').html('&#9650;');

            $subMenuLinks.filter('[href="#'+pageRef+'"]').find('.arr').html('&#9660;');
            $subMenus.filter('.'+pageRef).slideDown();

        }, args);

        return false;
    });

    /*
     Page search
     */
    var $search = $('.search-wrapper'),
        $pages = $('.page'),
        PageSearch = {

            $result : $('#search-result'),

            search : function(str) {
                str = $.trim(str.toLocaleLowerCase());

                var resultLinks = {},
                    _search = function(str, addToResultLinks) {

                        var result = [];

                        $pages.filter(':not(#search)').each(function() {

                            var link = $(this).attr('id'),
                                id = link,
                                $children = $(this).children(),
                                i,
                                paragraph = false,
                                pageName = false,
                                relevance = 0;

                            for(i=0; i < $children.length; i++) {
                                var $elem = $children.eq(i),
                                    section = $elem.attr('data-page-section'),
                                    nodeName = $elem.get(0).nodeName;

                                if( nodeName == 'PRE' || nodeName == 'CODE' )
                                    continue;

                                if( section ) {
                                    // Collect result form previous section
                                    if( relevance ) {
                                        var found = {
                                                relevance : relevance,
                                                link : link,
                                                paragraph : paragraph,
                                                pageName : pageName
                                            },
                                            added = false;

                                        if( addToResultLinks )
                                            resultLinks[link] = 1;

                                        $.each(result, function(i, obj) {
                                            if( found.relevance > obj.relevance ) {
                                                added = true;
                                                result.splice(i, 0, found);
                                                return false;
                                            }
                                        });
                                        if( !added ) {
                                            result.push(found);
                                        }
                                    }
                                    relevance = 0;
                                    link = id +'_'+section;
                                    paragraph = false;
                                    pageName = false;
                                }

                                if( !pageName && (nodeName == 'H1' || nodeName == 'H2' || nodeName == 'H3') ) {
                                    pageName = $elem.text();
                                }

                                var html = $elem.html().toLocaleLowerCase();
                                relevance += html.split(str).length - 1;

                                if( relevance && !paragraph ) {
                                    paragraph = $.trim($('<div>'+html+'</div>').text()).replace(new RegExp(str, 'g'), '<strong class="found">'+str+'</strong>');
                                }
                            }

                        });

                        return result;
                    };

                var totalResults = _search(str, true),
                    words = str.split(' ');

                if( words.length ) {
                    $.each(words, function(i, w) {
                        var found = _search(w),
                            added = 0;
                        $.each(found, function(i, resultItem) {
                            if( !(resultItem.link in resultLinks) ) {
                                added++;
                                resultLinks[resultItem.link] = 1;
                                totalResults.push(resultItem);
                            }
                        });
                    })
                }

                return totalResults.splice(0, 100);
            },

            onPageSearch : function(evt, path, args) {
                if( path == 'search' ) {
                    $search.find('input').val(args);
                    var result = PageSearch.search(args);
                    PageSearch.$result.html('').append('<p>Found '+result.length+' matching results</p>');
                    $.each(result, function(i, item) {
                        $('<div><h3><a href="#'+item.link+'">' +item.pageName+'</a></h3><p>'+item.paragraph+'</p></div>')
                            .appendTo(PageSearch.$result);
                    });
                }
            },

            init : function() {
                $search.find('label').on('click', function() {
                    var val = $.trim($(this).parent().find('input').val());
                    if( val.length > 1 ) {
                        window.location = '#search='+val;
                        Pager.goTo('search', {}, val);
                    }
                });
                $search.find('input').on('keydown', function(evt) {
                    if( evt.keyCode == 13 ) {
                        $(this).parent().find('label').trigger('click');
                    }
                });
            }

        };

    $(window).on('pageChange', PageSearch.onPageSearch);
    PageSearch.init();

    var onFirstPageLoaded = function() {
        $subMenus.filter(':not(.'+Pager.currentPage+')').slideUp();
        $subMenuLinks.filter('[href="#'+Pager.currentPage+'"]').find('.arr').html('&#9660;');
        $menuLinks.parent().removeClass('active');
        $menuLinks.filter('[href="#'+Pager.currentPage+'"]').eq(0).parent().addClass('active');
    };

    // Load current page
    if( window.location.hash ) {
        var href = window.location.hash.substr(1);
        Pager.goTo(href.split('=')[0], onFirstPageLoaded, href.split('=')[1]);
    } else {
        Pager.goTo('home', onFirstPageLoaded);
    }



})(jQuery, window);