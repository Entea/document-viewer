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
            console.log(top);
            this.window.mCustomScrollbar('scrollTo', top);
        }
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
}