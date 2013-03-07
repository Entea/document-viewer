DV.Elements = function (viewer) {
    this._viewer = viewer;
    var elements = DV.Schema.elements;
    for (var i = 0, elemCount = elements.length; i < elemCount; i++) {
        this.getElement(elements[i]);
    }

    this.scheduledScrollerRecreate = false;
    this.scrollerRecreateTimeout = null;
};

// Get and store an element reference
DV.Elements.prototype.getElement = function (elementQuery, force) {
    this[elementQuery.name] = elementQuery.outsideOfViewer ? $(elementQuery.query) : this._viewer.$(elementQuery.query);
};

DV.Elements.prototype.scroller = function () {
    if (this['scrlr'] == 'destroyed') {
        return null;
    }

    if (this['scrlr'] == undefined || !this['scrlr'].length) {
        this.getElement({name: 'scrlr', query: 'div.mCSB_container'});
    }
    return this['scrlr'];
};

DV.Elements.prototype.scrollerTop = function (top) {
    var el = this.scroller();
    if (top == undefined) {
        if (!el || !el.length) {
            return 0;
        }
        return Math.abs(el.position().top);
    } else {
        if (!el || !el.length) {
            return this;
        }

        if (this.isScrollerInitialized()) {
            if (this.isScrollerVisible()) {
                this.window.mCustomScrollbar('scrollTo', Math.max(top, 0));
            } else {
                // when the scroller is not visible, force top to 0
                this.window.mCustomScrollbar('scrollTo', 0);
            }
        }
        return this;
    }
};

DV.Elements.prototype.isScrollerVisible = function() {
    return this.window.find('.mCSB_scrollTools').is(':visible');
};

DV.Elements.prototype.isScrollerInitialized = function () {
    if (this.scrollInitialized == undefined) {
        var el = this.scroller();
        if (!el.next().find('.mCSB_dragger').length) {
            return false;
        }

        this.scrollInitialized = true;
    }

    return this.scrollInitialized;
};

DV.Elements.prototype.updateScroller = function () {
    if (this.isScrollerInitialized()) {
        this.window.mCustomScrollbar('update');
        this.collection.css('left', 0);
    }
};

DV.Elements.prototype.updateZoom = function (level) {
    this.updateScroller();
    this.zoomChange && this.zoomChange(this._viewer, level);

    if (!this.scheduledScrollerRecreate) {
        this.scheduledScrollerRecreate = true;
        this.recreateScrollerIfNeeded();
    }
};

/**
 * Recreates the scroller, and destroys if it's not needed.
 */
DV.Elements.prototype.recreateScrollerIfNeeded = function() {
    if (this.scheduledScrollerRecreate) {
        return;
    }

    // destroy the scroller
    var viewer = this._viewer;
    var that = this;

    if (this.scrollerRecreateTimeout !== null) {
        clearTimeout(this.scrollerRecreateTimeout);
        this.scrollerRecreateTimeout = null;
    }

    this.scrollerRecreateTimeout = setTimeout(function() {
        that.scrollerRecreateTimeout = null;
        that.scheduledScrollerRecreate = false;
        viewer.helpers.createScroller();

        setTimeout(function() {
            viewer.helpers.destroyScrollerIfNeeded();
        }, 500);
    }, 500);
};

/**
 * Set .DV-collection element's height to 1500 to prevent flickering
 */
DV.Elements.prototype.preventPageCollapse = function() {
    this._viewer.$('.DV-page').height('1500px');
    this.collection.css('height', '1500px');
};
/**
 * Undo the changes made by `DV.Elements.prototype.preventPageCollapse`
 */
DV.Elements.prototype.undoPageCollapseFix = function() {
    this._viewer.$('.DV-page').height('');
    this.collection.css('height', '');
};