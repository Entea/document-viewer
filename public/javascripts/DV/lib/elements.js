DV.Elements = function(viewer){
  this._viewer = viewer;
  var elements = DV.Schema.elements;
  for (var i=0, elemCount=elements.length; i < elemCount; i++) {
    this.getElement(elements[i]);
  }
};

// Get and store an element reference
DV.Elements.prototype.getElement = function(elementQuery,force){
  this[elementQuery.name] = elementQuery.outsideOfViewer ? $(elementQuery.query) : this._viewer.$(elementQuery.query);
};

DV.Elements.prototype.scroller = function() {
    if (this['scrlr'] == 'destroyed') {
        return null;
    }

    if (this['scrlr'] == undefined || !this['scrlr'].length) {
        this.getElement({name: 'scrlr', query: 'div.mCSB_container'});
    }
    return this['scrlr'];
};

DV.Elements.prototype.scrollerTop = function(top) {
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
            this.window.mCustomScrollbar('scrollTo', Math.max(top, 1));
        }
        return this;
    }
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

DV.Elements.prototype.updateScroller = function() {
    if (this.isScrollerInitialized()) {
        this.window.mCustomScrollbar('update');
        this.collection.css('left', 0);
    }
};

DV.Elements.prototype.updateZoom = function(level) {
    this.updateScroller();
    this.zoomChange && this.zoomChange(this._viewer, level);

    // destroy the scroller
    var viewer = this._viewer;
    viewer.helpers.destroyScrollerIfNeeded();
};