DV.Schema.helpers = {

    HOST_EXTRACTOR: (/https?:\/\/([^\/]+)\//),

    annotationClassName: '.DV-annotation',

    // Bind all events for the docviewer
    // live/delegate are the preferred methods of event attachment
    bindEvents: function (context) {
        var boundZoom = this.events.compile('zoom');
        var doc = context.models.document;
        var value = _.indexOf(doc.ZOOM_RANGES, doc.zoomLevel);
        var viewer = this.viewer;

        if (viewer.options.sliderZoomLevel > 0 && viewer.options.sliderZoomLevel < doc.ZOOM_RANGES.length) {
            value = viewer.options.sliderZoomLevel;
        }

        var sliding = false;

        try {
            $('.DV-zoomBox').slider("destroy");
        } catch (e) {
        }

        viewer.slider = $('.DV-zoomBox').slider({
            step: 1,
            min: 0,
            max: doc.ZOOM_RANGES.length - 1, // Max zoom level is one less because the 'min' is 0
            orientation: "vertical",
            isRTL: true,
            value: value,
            slide: function (el, d) {
                boundZoom(context.models.document.ZOOM_RANGES[parseInt(d.value, 10)]);
                sliding = true;
            },
            change: function (el, d) {
                boundZoom(context.models.document.ZOOM_RANGES[parseInt(d.value, 10)]);
                // reset sliding flag
                sliding = false;
            }
        });

        // next/previous
        var compiled = viewer.compiled;
        compiled.next = this.events.compile('next');
        compiled.previous = this.events.compile('previous');


        var states = context.states;
        $('.DV-navControls').delegate('span.DV-next', 'click', compiled.next);
        $('.DV-navControls').delegate('span.DV-previous', 'click', compiled.previous);

        $('.DV-annotationView').delegate('.DV-trigger', 'click', function (e) {
            e.preventDefault();
            context.open('ViewAnnotation');
        });
        $('.DV-documentView').delegate('.DV-trigger', 'click', function (e) {
            // history.save('document/p'+context.models.document.currentPage());
            context.open('ViewDocument');
        });
        $('.DV-thumbnailsView').delegate('.DV-trigger', 'click', function (e) {
            context.open('ViewThumbnails');
        });
        $('.DV-textView').delegate('.DV-trigger', 'click', function (e) {

            // history.save('text/p'+context.models.document.currentPage());
            context.open('ViewText');
        });
        $('.DV-allAnnotations').delegate('.DV-annotationGoto .DV-trigger', 'click', DV.jQuery.proxy(this.gotoPage, this));

        $('form.DV-searchDocument').submit(this.events.compile('search'));
        $('.DV-searchBar').delegate('.DV-closeSearch', 'click', function (e) {
            e.preventDefault();
            // history.save('text/p'+context.models.document.currentPage());
            context.open('ViewText');
        });
        $('.DV-searchBox').delegate('.DV-searchInput-cancel', 'click', DV.jQuery.proxy(this.clearSearch, this));

        $('.DV-searchResults').delegate('span.DV-resultPrevious', 'click', DV.jQuery.proxy(this.highlightPreviousMatch, this));

        $('.DV-searchResults').delegate('span.DV-resultNext', 'click', DV.jQuery.proxy(this.highlightNextMatch, this));

        // Prevent navigation elements from being selectable when clicked.
        $('.DV-trigger').bind('selectstart', function () {
            return false;
        });

        this.elements.viewer.delegate('.DV-fullscreen', 'click', _.bind(this.openFullScreen, this));

        var boundToggle = DV.jQuery.proxy(this.annotationBridgeToggle, this);
        var collection = this.elements.collection;

        collection.delegate('.DV-annotationTab', 'click', boundToggle);
        collection.delegate('.DV-annotationRegion', 'click', DV.jQuery.proxy(this.annotationBridgeShow, this));
        collection.delegate('.DV-annotationNext', 'click', DV.jQuery.proxy(this.annotationBridgeNext, this));
        collection.delegate('.DV-annotationPrevious', 'click', DV.jQuery.proxy(this.annotationBridgePrevious, this));
        collection.delegate('.DV-showEdit', 'click', DV.jQuery.proxy(this.showAnnotationEdit, this));
        collection.delegate('.DV-cancelEdit', 'click', DV.jQuery.proxy(this.cancelAnnotationEdit, this));
        collection.delegate('.DV-saveAnnotation', 'click', DV.jQuery.proxy(this.saveAnnotation, this));
        collection.delegate('.DV-saveAnnotationDraft', 'click', DV.jQuery.proxy(this.saveAnnotation, this));
        collection.delegate('.DV-deleteAnnotation', 'click', DV.jQuery.proxy(this.deleteAnnotation, this));
        collection.delegate('.DV-pageNumber', 'click', _.bind(this.permalinkPage, this, 'document'));
        collection.delegate('.DV-textCurrentPage', 'click', _.bind(this.permalinkPage, this, 'text'));
        collection.delegate('.DV-annotationTitle', 'click', _.bind(this.permalinkAnnotation, this));
        collection.delegate('.DV-permalink', 'click', _.bind(this.permalinkAnnotation, this));

        // Thumbnails
        $('.DV-thumbnails').delegate('.DV-thumbnail-page', 'click', function (e) {
            var $thumbnail = $(e.currentTarget);
            if (!viewer.openEditor) {
                var pageIndex = $thumbnail.closest('.DV-thumbnail').attr('data-pageNumber') - 1;
                viewer.models.document.setPageIndex(pageIndex);
                viewer.open('ViewDocument');
                // viewer.history.save('document/p'+pageNumber);
            }
        });

        // Handle iPad / iPhone scroll events...
        _.bindAll(this, 'touchStart', 'touchMove', 'touchEnd');
        this.elements.window[0].ontouchstart = this.touchStart;
        this.elements.window[0].ontouchmove = this.touchMove;
        this.elements.window[0].ontouchend = this.touchEnd;
        this.elements.well[0].ontouchstart = this.touchStart;
        this.elements.well[0].ontouchmove = this.touchMove;
        this.elements.well[0].ontouchend = this.touchEnd;

        $('.DV-descriptionToggle').live('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            $('.DV-descriptionText').toggle();
            $('.DV-descriptionToggle').toggleClass('DV-showDescription');
        });

        var cleanUp = DV.jQuery.proxy(viewer.pageSet.cleanUp, this);

        this.elements.window.live('mousedown',
                function (e) {
                    var el = $(e.target);
                    if (el.parents().is('.DV-annotation') || el.is('.DV-annotation')) return true;
                    if (context.elements.window.hasClass('DV-coverVisible')) {
                        if ((el.width() - parseInt(e.clientX, 10)) >= 15) {
                            cleanUp();
                        }
                    }
                }
        );

        var docId = viewer.schema.document.id;

        if (DV.jQuery.browser.msie == true) {
            this.elements.browserDocument.bind('focus.' + docId, DV.jQuery.proxy(this.focusWindow, this));
            this.elements.browserDocument.bind('focusout.' + docId, DV.jQuery.proxy(this.focusOut, this));
        } else {
            this.elements.browserWindow.bind('focus.' + docId, DV.jQuery.proxy(this.focusWindow, this));
            this.elements.browserWindow.bind('blur.' + docId, DV.jQuery.proxy(this.blurWindow, this));
        }

        // When the document is scrolled, even in the background, resume polling.
        this.elements.window.bind('scroll.' + docId, DV.jQuery.proxy(this.focusWindow, this));

        this.elements.coverPages.live('mousedown', cleanUp);

        viewer.acceptInput = this.elements.currentPage.acceptInput({ changeCallBack: DV.jQuery.proxy(this.acceptInputCallBack, this) });

    },

    // Unbind jQuery events that have been bound to objects outside of the viewer.
    unbindEvents: function () {
        var viewer = this.viewer;
        var docId = viewer.schema.document.id;
        if (DV.jQuery.browser.msie == true) {
            this.elements.browserDocument.unbind('focus.' + docId);
            this.elements.browserDocument.unbind('focusout.' + docId);
        } else {
            viewer.helpers.elements.browserWindow.unbind('focus.' + docId);
            viewer.helpers.elements.browserWindow.unbind('blur.' + docId);
        }
        viewer.helpers.elements.browserWindow.unbind('scroll.' + docId);
        _.each(viewer.observers, function (obs) {
            viewer.helpers.removeObserver(obs);
        });
    },

    // We're entering the Notes tab -- make sure that there are no data-src
    // attributes remaining.
    ensureAnnotationImages: function () {
        this.viewer.$(".DV-img[data-src]").each(function () {
            var el = DV.jQuery(this);
            el.attr('src', el.attr('data-src'));
        });
    },

    startCheckTimer: function () {
        var _t = this.viewer;
        var _check = function () {
            _t.events.check();
        };
        this.viewer.checkTimer = setInterval(_check, 100);
    },

    stopCheckTimer: function () {
        clearInterval(this.viewer.checkTimer);
    },

    blurWindow: function () {
        if (this.viewer.isFocus === true) {
            this.viewer.isFocus = false;
            // pause draw timer
            this.stopCheckTimer();
        } else {
            return;
        }
    },

    focusOut: function () {
        if (this.viewer.activeElement != document.activeElement) {
            this.viewer.activeElement = document.activeElement;
            this.viewer.isFocus = true;
        } else {
            // pause draw timer
            this.viewer.isFocus = false;
            this.viewer.helpers.stopCheckTimer();
            return;
        }
    },

    focusWindow: function () {
        if (this.viewer.isFocus === true) {
            return;
        } else {
            this.viewer.isFocus = true;
            // restart draw timer
            this.startCheckTimer();
        }
    },

    touchStart: function (e) {
        e.stopPropagation();
        e.preventDefault();
        var touch = e.changedTouches[0];
        this._moved = false;
        this._touchX = touch.pageX;
        this._touchY = touch.pageY;
    },

    touchMove: function (e) {
        var el = e.currentTarget;
        var touch = e.changedTouches[0];
        var xDiff = this._touchX - touch.pageX;
        var yDiff = this._touchY - touch.pageY;
        el.scrollLeft += xDiff;
        el.scrollTop += yDiff;
        this._touchX -= xDiff;
        this._touchY -= yDiff;
        if (yDiff != 0 || xDiff != 0) this._moved = true;
    },

    touchEnd: function (e) {
        if (!this._moved) {
            var touch = e.changedTouches[0];
            var target = touch.target;
            var fakeClick = document.createEvent('MouseEvent');
            while (target.nodeType !== 1) target = target.parentNode;
            fakeClick.initMouseEvent('click', true, true, touch.view, 1,
                    touch.screenX, touch.screenY, touch.clientX, touch.clientY,
                    false, false, false, false, 0, null);
            target.dispatchEvent(fakeClick);
        }
        this._moved = false;
    },

    // Click to open a page's permalink.
    permalinkPage: function (mode, e) {
        if (mode == 'text') {
            var number = this.viewer.models.document.currentPage();
        } else {
            var pageId = this.$(e.target).closest('.DV-set').attr('data-id');
            var page = this.viewer.pageSet.pages[pageId];
            var number = page.pageNumber;
            this.jump(page.index);
        }
        this.viewer.history.save(mode + '/p' + number);
    },

    // Click to open an annotation's permalink.
    permalinkAnnotation: function (e) {
        var id = this.$(e.target).closest('.DV-annotation').attr('data-id');
        var anno = this.viewer.models.annotations.getAnnotation(id);
        var sid = anno.server_id || anno.id;
        if (this.viewer.state == 'ViewDocument') {
            this.viewer.pageSet.showAnnotation(anno);
            this.viewer.history.save('document/p' + anno.pageNumber + '/a' + sid);
        } else {
            this.viewer.history.save('annotation/a' + sid);
        }
    },

    setDocHeight: function (height, diff) {
        this.elements.bar.css('height', height);
    },

    getWindowDimensions: function () {
        var d = {
            height: window.innerHeight ? window.innerHeight : this.elements.browserWindow.height(),
            width: this.elements.browserWindow.width()
        };
        return d;
    },

    // Is the given URL on a remote domain?
    isCrossDomain: function (url) {
        var match = url.match(this.HOST_EXTRACTOR);
        return match && (match[1] != window.location.host);
    },

    resetScrollState: function () {
        this.elements.scrollerTop(0);
    },

    gotoPage: function (e) {
        e.preventDefault();
        var aid = this.$(e.target).parents('.DV-annotation').attr('rel').replace('aid-', '');
        var annotation = this.models.annotations.getAnnotation(aid);
        var viewer = this.viewer;

        if (viewer.state !== 'ViewDocument') {
            this.models.document.setPageIndex(annotation.index);
            viewer.open('ViewDocument');
            // this.viewer.history.save('document/p'+(parseInt(annotation.index,10)+1));
        }
    },

    openFullScreen: function () {
        var doc = this.viewer.schema.document;
        var url = doc.canonicalURL.replace(/#\S+$/, "");
        var currentPage = this.models.document.currentPage();

        // construct url fragment based on current viewer state
        switch (this.viewer.state) {
            case 'ViewAnnotation':
                url += '#annotation/a' + this.viewer.activeAnnotationId; // default to the top of the annotations page.
                break;
            case 'ViewDocument':
                url += '#document/p' + currentPage;
                break;
            case 'ViewSearch':
                url += '#search/p' + currentPage + '/' + encodeURIComponent(this.elements.searchInput.val());
                break;
            case 'ViewText':
                url += '#text/p' + currentPage;
                break;
            case 'ViewThumbnails':
                url += '#pages/p' + currentPage; // need to set up a route to catch this.
                break;
        }
        window.open(url, "documentviewer", "toolbar=no,resizable=yes,scrollbars=no,status=no");
    },

    // Determine the correct DOM page ordering for a given page index.
    sortPages: function (pageIndex) {
        if (pageIndex == 0 || pageIndex % 3 == 1) return ['p0', 'p1', 'p2'];
        if (pageIndex % 3 == 2)                   return ['p1', 'p2', 'p0'];
        if (pageIndex % 3 == 0)                   return ['p2', 'p0', 'p1'];
    },

    addObserver: function (observerName) {
        this.removeObserver(observerName);
        this.viewer.observers.push(observerName);
    },

    removeObserver: function (observerName) {
        var observers = this.viewer.observers;
        for (var i = 0, len = observers.length; i < len; i++) {
            if (observerName === observers[i]) {
                observers.splice(i, 1);
            }
        }
    },

    toggleContent: function (toggleClassName) {
        this.elements.viewer.removeClass('DV-viewText DV-viewSearch DV-viewDocument DV-viewAnnotations DV-viewThumbnails').addClass('DV-' + toggleClassName);
    },

    jump: function (pageIndex, modifier, forceRedraw) {
        modifier = (modifier) ? parseInt(modifier, 10) : 0;
        var position = 0;
        if (this.viewer.state == 'ViewText') {
            var page = $(this.viewer.$('.DV-textPage').get(pageIndex));
            if (page.length) {
                position = page.position().top;
            }
        } else {
            position = this.models.document.getOffset(parseInt(pageIndex, 10)) + modifier;
        }

        this.elements.scrollerTop(position);
        this.models.document.setPageIndex(pageIndex);
        if (forceRedraw) this.viewer.pageSet.redraw(true);
        if (this.viewer.state === 'ViewThumbnails') {
            this.viewer.thumbnails.highlightCurrentPage();
        }
    },

    shift: function (argHash, useScrollTo) {
        var api = this.elements.scrollerApi();
        if (!api) {
            return;
        }

        var scrollTopNew = api.getContentPositionY() + argHash.deltaY;
        var left = api.getContentPositionX() + argHash.deltaX;

        // limits:
        var leftMax = Math.max(0, this.elements.collection.width() - this.elements.window.width());
        left = Math.min(left, leftMax);

        if (api) {
            api.scrollToY(scrollTopNew);
            api.scrollToX(left);
        }
    },

    getAppState: function () {
        var docModel = this.models.document;
        var currentPage = (docModel.currentIndex() == 0) ? 1 : docModel.currentPage();

        return { page: currentPage, zoom: docModel.zoomLevel, view: this.viewer.state };
    },

    constructPages: function () {
        var pages = [];
        var totalPagesToCreate = (this.viewer.schema.data.totalPages < 3) ? this.viewer.schema.data.totalPages : 3;

        var height = this.models.pages.height;
        var width = this.viewer.options.zoom || this.viewer.options.width;
        for (var i = 0; i < totalPagesToCreate; i++) {
            pages.push(JST.pages({ pageNumber: i + 1, pageIndex: i, pageImageSource: null, baseHeight: height, width: width }));
        }

        return pages.join('');
    },

    // Position the viewer on the page. For a full screen viewer, this means
    // absolute from the current y offset to the bottom of the viewport.
    positionViewer: function () {
        var offset = this.elements.viewer.position();
        if (this.viewer.options.positionFunction) {
            this.viewer.options.positionFunction(this.viewer, offset);
        } else {
            this.elements.viewer.css({position: 'absolute', top: offset.top, bottom: 0, left: offset.left, right: offset.left});
        }
    },

    unsupportedBrowser: function () {
        var browser = DV.jQuery.browser;
        if (!(browser.msie && parseFloat(browser.version, 10) <= 6.0)) return false;
        DV.jQuery(this.viewer.options.container).html(JST.unsupported({viewer: this.viewer}));
        return true;
    },

    registerHashChangeEvents: function () {
        var events = this.events;
        var history = this.viewer.history;

        // Default route
        history.defaultCallback = _.bind(events.handleHashChangeDefault, this.events);

        // Handle page loading
        history.register(/document\/p(\d*)$/, _.bind(events.handleHashChangeViewDocumentPage, this.events));
        // Legacy NYT stuff
        history.register(/p(\d*)$/, _.bind(events.handleHashChangeLegacyViewDocumentPage, this.events));
        history.register(/p=(\d*)$/, _.bind(events.handleHashChangeLegacyViewDocumentPage, this.events));

        // Handle annotation loading in document view
        history.register(/document\/p(\d*)\/a(\d*)$/, _.bind(events.handleHashChangeViewDocumentAnnotation, this.events));

        // Handle annotation loading in annotation view
        history.register(/annotation\/a(\d*)$/, _.bind(events.handleHashChangeViewAnnotationAnnotation, this.events));

        // Handle loading of the pages view
        history.register(/pages$/, _.bind(events.handleHashChangeViewPages, events));

        // Handle page loading in text view
        history.register(/text\/p(\d*)$/, _.bind(events.handleHashChangeViewText, this.events));

        // Handle entity display requests.
        history.register(/entity\/p(\d*)\/(.*)\/(\d+):(\d+)$/, _.bind(events.handleHashChangeViewEntity, this.events));

        // Handle search requests
        history.register(/search\/p(\d*)\/(.*)$/, _.bind(events.handleHashChangeViewSearchRequest, this.events));
    },

    // Sets up the zoom slider to match the appropriate for the specified
    // initial zoom level, and real document page sizes.
    autoZoomPage: function () {
        var windowWidth = this.elements.window.outerWidth(true);
        var zoom;

        if (this.viewer.options.zoom == 'auto') {
            zoom = Math.min(1000, windowWidth - (this.viewer.models.pages.getPadding() * 2));
        } else {
            zoom = this.viewer.options.zoom;
        }

        // Setup ranges for auto-width zooming
        var ranges = this.viewer.models.document.ZOOM_RANGES;
        // Try to set max zoom possible.
        for (var i = ranges.length; i >= 0; i--) {
            if (zoom >= ranges[ i ]) {
                zoom = ranges[ i ];
                break;
            }
        }
        if (zoom < ranges[ 0 ]) {
            zoom = ranges[ 0 ];
        }

        this.viewer.models.document.ZOOM_RANGES = ranges;
        this.viewer.slider.slider({'value': parseInt(_.indexOf(ranges, zoom), 10)});
        this.events.zoom(zoom);
    },

    handleInitialState: function () {
        var initialRouteMatch = this.viewer.history.loadURL(true);
        if (!initialRouteMatch) {
            var opts = this.viewer.options;
            this.viewer.open('ViewDocument');
            if (opts.note) {
                this.viewer.pageSet.showAnnotation(this.viewer.models.annotations.byId[opts.note]);
            } else if (opts.page) {
                this.jump(opts.page - 1);
            }
        }
    },

    updatePageNumberOnTextView: function() {
        if (this.viewer.state == 'ViewText' || this.viewer.state == 'ViewSearch') {
            var scrollerTop = this.viewer.elements.scrollerTop();
            var pageIndex = 0;

            this.viewer.$('.DV-textPage').each(function(i, el) {
                if ($(el).position().top - 150 < scrollerTop) {
                    pageIndex = i;
                }
            });
            this.viewer.models.document.setPageIndex(pageIndex);
        }
    }
};
