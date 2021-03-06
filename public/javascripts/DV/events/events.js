// This manages events for different states activated through DV interface actions like clicks, mouseovers, etc.
DV.Schema.events = {
    isTextLoaded: false,
    // Change zoom level and causes a reflow and redraw of pages.
    zoom: function (level) {
        var viewer = this.viewer;
        var continuation = function () {
            viewer.pageSet.zoom({ zoomLevel: level });
            var ranges = viewer.models.document.ZOOM_RANGES;
            viewer.dragReporter.sensitivity = ranges[ranges.length - 1] == level ? 1.5 : 1;
            viewer.notifyChangedState();
            return true;
        };
        viewer.confirmStateChange ? viewer.confirmStateChange(continuation) : continuation();
        this.viewer.models.document.redrawPages();
        this.viewer.elements.updateZoom(level);
    },

    // Draw (or redraw) the visible pages on the screen.
    drawPages: function () {
        if (this.viewer.state != 'ViewDocument') return;
        var doc = this.models.document;
        var win = this.elements.window[0];
        var offsets = doc.baseHeightsPortionOffsets;
        var scrollTop = this.viewer.elements.scrollerTop();
        var scrollPos = this.viewer.scrollPosition = scrollTop;
        var midpoint = scrollPos + (this.viewer.$(win).height() / 3);
        var currentPage = _.sortedIndex(offsets, scrollPos);
        var middlePage = _.sortedIndex(offsets, midpoint);
        if (offsets[currentPage] == scrollPos) currentPage++ && middlePage++;
        var pageIds = this.helpers.sortPages(middlePage - 1);
        var total = doc.totalPages;
        if (doc.currentPage() != currentPage) doc.setPageIndex(currentPage - 1);
        this.drawPageAt(pageIds, middlePage - 1);
    },

    // Draw the page at the given index.
    drawPageAt: function (pageIds, index) {
        if (pageIds == undefined) {
            return;
        }
        var first = index == 0;
        var last = index == this.models.document.totalPages - 1;
        if (first) index += 1;
        var pages = [
            { label: pageIds[0], index: index - 1 },
            { label: pageIds[1], index: index },
            { label: pageIds[2], index: index + 1 }
        ];
        if (last) pages.pop();
        pages[first ? 0 : pages.length - 1].currentPage = true;
        this.viewer.pageSet.draw(pages);
    },

    check: function () {
        var viewer = this.viewer;
        if (viewer.busy === false) {
            viewer.busy = true;
            for (var i = 0; i < this.viewer.observers.length; i++) {
                this[viewer.observers[i]].call(this);
            }
            viewer.busy = false;
        }
    },

    loadAllTextPages: function (afterLoad) {
        var me = this;

        var processText = function (text, loadFromCache) {
            me.isTextLoaded = true;

            var pages = text.split(me.viewer.schema.data.PAGE_DELIMITER);

            // Remove all pages.
            me.viewer.$('.DV-text .DV-textPage').remove();

            for (var i = 0; i < pages.length; i++) {
                var pageNumber = i + 1;
                var div = $('<div class="DV-textPage"></div>').append(
                        $('<pre class="DV-textContents"></pre>').text(pages[ i ])
                );

                me.viewer.$('.DV-text').append(div);

                if (!(pageNumber in me.models.document.originalPageText)) {
                    me.models.document.originalPageText[pageNumber] = pages[ i ];
                }
                // ???
                if (me.viewer.openEditor == 'editText') {
                    me.viewer.$('.DV-textContents').attr('contentEditable', true).addClass('DV-editing');
                }
            }
            me.elements.updateScroller();
            me.openTextPage(me.viewer.models.document.currentIndex());
            if (afterLoad) afterLoad.call(me.helpers);
        };

        if (this.isTextLoaded) {
            return;
        }

        var handleResponse = DV.jQuery.proxy(function (response) {
            processText(response);
        }, this);

        var textURI = me.viewer.schema.document.resources.text;
        var crossDomain = this.helpers.isCrossDomain(textURI);
        if (crossDomain) textURI += '?callback=?';
        DV.jQuery[crossDomain ? 'getJSON' : 'get'](textURI, {}, handleResponse);
    },

    openTextPage: function (pageIndex, afterLoad) {
        if (pageIndex == undefined || pageIndex < 0) {
            pageIndex = 0;
        }

        // If the text has not been loaded, load it first :)
        if (!this.isTextLoaded) {
            this.loadAllTextPages(function() {
                this.openTextPage(pageIndex, afterLoad);
            });
            return;
        }

        var page = $(this.viewer.$('.DV-textPage').get(pageIndex));
        if (page.length) {
            this.viewer.elements.scrollerTop(page.position().top);
        }
        if (afterLoad) {
            afterLoad.call(this.helpers);
        }
    },

    resetTracker: function () {
        this.viewer.activeAnnotation = null;
        this.trackAnnotation.combined = null;
        this.trackAnnotation.h = null;
    },
    trackAnnotation: function () {
        var viewer = this.viewer;
        var helpers = this.helpers;
        var scrollPosition = scrollTop = this.viewer.elements.scrollerTop();

        if (viewer.activeAnnotation) {
            var annotation = viewer.activeAnnotation;
            var trackAnnotation = this.trackAnnotation;


            if (trackAnnotation.id != annotation.id) {
                trackAnnotation.id = annotation.id;
                helpers.setActiveAnnotationLimits(annotation);
            }
            if (!viewer.activeAnnotation.annotationEl.hasClass('DV-editing') &&
                    (scrollPosition > (trackAnnotation.h) || scrollPosition < trackAnnotation.combined)) {
                annotation.hide(true);
                viewer.pageSet.setActiveAnnotation(null);
                viewer.activeAnnotation = null;
                trackAnnotation.h = null;
                trackAnnotation.id = null;
                trackAnnotation.combined = null;
            }
        } else {
            viewer.pageSet.setActiveAnnotation(null);
            viewer.activeAnnotation = null;
            trackAnnotation.h = null;
            trackAnnotation.id = null;
            trackAnnotation.combined = null;
            helpers.removeObserver('trackAnnotation');
        }
    }
};