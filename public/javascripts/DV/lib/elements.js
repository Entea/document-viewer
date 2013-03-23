DV.Elements = function (viewer) {
    this._viewer = viewer;
    var elements = DV.Schema.elements;
    for (var i = 0, elemCount = elements.length; i < elemCount; i++) {
        this.getElement(elements[i]);
    }
};

// Get and store an element reference
DV.Elements.prototype.getElement = function (elementQuery, force) {
    this[elementQuery.name] = elementQuery.outsideOfViewer ? $(elementQuery.query) : this._viewer.$(elementQuery.query);
};

DV.Elements.prototype.scrollerApi = function () {
    return this.window.data('jsp');
};

DV.Elements.prototype.scrollerTop = function (top) {
    var api = this.scrollerApi();
    if (top == undefined) {
        if (!api) {
            return 0;
        }
        return api.getContentPositionY();
    } else {
        if (!api) {
            return this;
        }

        if (this.isScrollerInitialized()) {
            if (this.isScrollerVisible()) {
                api.scrollToY(Math.max(top, 0));
            } else {
                // when the scroller is not visible, force top to 0
                api.scrollToY(0);
            }
        }
        return this;
    }
};

DV.Elements.prototype.isScrollerVisible = function() {
    return this.window.find('.jspVerticalBar:visible').length;
};

DV.Elements.prototype.isScrollerInitialized = function () {
    if (this.scrollInitialized == undefined) {
        var api = this.scrollerApi();
        if (!api) {
            return false;
        }

        this.scrollInitialized = true;
    }

    return this.scrollInitialized;
};

DV.Elements.prototype.updateScroller = function () {
    if (this.isScrollerInitialized()) {
        this.reinitializeScroller();
        this._viewer.$('.jspPane').css('left', 0);
    }
};

DV.Elements.prototype.updateZoom = function (level) {
    this.updateScroller();
    var zoomLevel = _.indexOf(this._viewer.models.document.ZOOM_RANGES, level);
    this._viewer.zoomChange && this._viewer.zoomChange(this._viewer, zoomLevel);
    this.reinitializeScroller();
};

/**
 * Set .DV-collection element's height to 1500 to prevent flickering
 */
DV.Elements.prototype.preventPageCollapse = function() {
    this.collection.css('height', '1500px');
    this._viewer.$('.DV-page').height('1500px');
};
/**
 * Undo the changes made by `DV.Elements.prototype.preventPageCollapse`
 */
DV.Elements.prototype.undoPageCollapseFix = function() {
    if (this._viewer.state == 'ViewDocument' && $('.DV-page img[src]').length == 0) {
        var that = this;
        setTimeout(function() {
            that.undoPageCollapseFix();
        }, 100);
        return;
    }

    this._viewer.$('.DV-page').height('');
    this.collection.css('height', '');
};

DV.Elements.prototype.reinitializeScroller = function() {
    var that = this;
    var api = this.scrollerApi();
    if (api) {
        api.reinitialise();
        if ('ViewDocument' == this._viewer.state) {
            if (!this._viewer.models.pages.imageWidth) {
                api.scrollToY(0);
            }
        }
    }
};