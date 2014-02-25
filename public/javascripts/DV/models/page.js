// The Pages model represents the set of pages in the document, containing the
// image sources for each page, and the page proportions.
DV.model.Pages = function (viewer) {
    this.viewer = viewer;

    // Rolling average page height.
    this.averageHeight = 0;

    // Real page heights.
    this.pageHeights = [];

    this.rotation = parseInt(viewer.schema.data.rotation);

    // Real page note heights.
    this.pageNoteHeights = [];

    // In pixels.
    this.BASE_WIDTH = 800;
    this.BASE_HEIGHT = 1000;

    // Factors for scaling from image size to zoomlevel.
    this.SCALE_FACTORS = {
        '600': 0.75,
        '800': 1.0,
        '1000': 0.83,
        '1200': 1.0
    };

    // For viewing page text.
    this.DEFAULT_PADDING = 100;

    // Embed reduces padding.
    this.REDUCED_PADDING = 44;

    // Mini padding, when < 500 px wide.
    this.MINI_PADDING = 18;

    this.zoomLevel = this.viewer.models.document.zoomLevel;
    this.baseWidth = this.BASE_WIDTH;
    this.baseHeight = this.BASE_HEIGHT;
    this.width = this.zoomLevel;
    this.height = this.baseHeight * this.zoomFactor();
    this.numPagesLoaded = 0;
    this.imageWidth = 0;

    this.needsRepositioning = false;
};

DV.model.Pages.prototype = {

    // Get the complete image URL for a particular page.
    imageURL: function (index) {
        var url = this.viewer.schema.document.resources.page.image;
        var size = this.zoomLevel > this.BASE_WIDTH ? 'large' : 'normal';
        var pageNumber = index + 1;

        if (this.viewer.schema.document.resources.page.zeropad) {
            pageNumber = this.zeroPad(pageNumber, 5);
        }

        url = url.replace(/\{size\}/, size);
        url = url.replace(/\{page\}/, pageNumber);

        return url;
    },

    getNextRightRotation: function() {
        this.rotation = (this.rotation + 1) % 4;

        return this.rotation;
    },
    getNextLeftRotation: function() {
        this.rotation = (this.rotation - 1 + 4) % 4;

        return this.rotation;
    },

    zeroPad: function (num, count) {
        var string = num.toString();
        while (string.length < count) string = '0' + string;
        return string;
    },

    // Return the appropriate padding for the size of the viewer.
    getPadding: function () {
        return 0; // No padding :)

        if (this.viewer.options.mini) {
            return this.MINI_PADDING;
        } else if (this.viewer.options.zoom == 'auto') {
            return this.REDUCED_PADDING;
        } else {
            return this.DEFAULT_PADDING;
        }
    },

    // The zoom factor is the ratio of the image width to the baseline width.
    zoomFactor: function () {
        if (this.zoomLevel > this.BASE_WIDTH) {
            return this.zoomLevel / this.imageWidth;
        }
        return this.zoomLevel / this.BASE_WIDTH;
    },

    scaleFactor: function() {
        if (undefined == this.SCALE_FACTORS[this.zoomLevel]) {
            throw 'Scale factor is undefined for zoomLevel = "' + this.zoomLevel + '"';
        }
        return this.SCALE_FACTORS[this.zoomLevel];
    },

    // Resize or zoom the pages width and height.
    resize: function (zoomLevel, force) {
        zoomLevel = zoomLevel || this.zoomLevel;
        var padding = 0; // this.viewer.models.pages.DEFAULT_PADDING;

        if (zoomLevel || force) {
            if (zoomLevel == this.zoomLevel && !force) {
                return;
            }

            this.zoomLevel = zoomLevel || this.zoomLevel;
            var scale = this.scaleFactor();

            if (this.imageWidth) {
                this.width = this.zoomLevel;
                this.height = this.width * (this.imageHeight / this.imageWidth);
            } else {
                this.width = zoomLevel;
            }
            this.averageHeight = Math.round(this.averageHeight * scale);
        }


        this.viewer.elements.sets.width(this.zoomLevel);
        if (this.viewer.state == 'ViewDocument') {
            this.viewer.elements.collection.css({width: this.width + padding });
        }

        this.adjustWidth();

        if (this.needsRepositioning) {
            this.viewer.helpers.positionViewer();
        }
    },

    // Update the height for a page, when its real image has loaded.
    updateHeight: function (image, pageIndex) {
        var h = this.getPageHeight(pageIndex);
        var height = image.height;
        this.imageHeight = height;
        this.imageWidth = image.width;
        this.needsRepositioning = true;

        // a hack :S
        this.viewer.elements.undoPageCollapseFix();

        if (image.width < this.baseWidth) {
            // Not supposed to happen, but too-small images sometimes do.
            height *= (this.baseWidth / image.width);
        }

        this.setPageHeight(pageIndex, height);
        this.averageHeight = ((this.averageHeight * this.numPagesLoaded) + height) / (this.numPagesLoaded + 1);
        this.numPagesLoaded += 1;
        this.adjustWidth();

        this.resize(0, true);

        if (h === height) return;
        this.viewer.models.document.computeOffsets();
        this.viewer.pageSet.simpleReflowPages();
        if (!this.viewer.activeAnnotation && (pageIndex < this.viewer.models.document.currentIndex())) {
            var diff = Math.round(height * this.zoomFactor() - h);
            var scrollTop = this.viewer.elements.scrollerTop();
            this.viewer.elements.scrollerTop(scrollTop + diff);
        }
        this.viewer.elements.reinitializeScroller();
    },

    adjustWidth: function() {
        var width = this.rotation % 2 == 1 ? this.height : this.getPageWidth();
        this.viewer.elements.collection.width(width);
    },

    /**
     * Returns the width to be set on outer container elements
     */
    getEffectiveWidth: function() {
        if (this.rotation % 2) {
            if (this.imageWidth) {
                return this.getPageWidth();
            }
            return Math.round(Math.min(this.zoomLevel + 5, this.width));
        }
        return this.zoomLevel + 5;
    },

    // set the real page height
    setPageHeight: function (pageIndex, pageHeight) {
        this.pageHeights[pageIndex] = Math.round(pageHeight);
    },

    // get the real page height
    getPageHeight: function (pageIndex) {
        var realHeight = this.pageHeights[pageIndex];
        if (realHeight) {
            if (this.rotation % 2) {
                return Math.round(Math.min(realHeight * this.scaleFactor(), this.height));
            }
            return Math.round(realHeight * this.scaleFactor());
        }
        return Math.round(this.height);
    },

    getPageWidth: function() {
        if (this.imageWidth)
            return Math.round(this.imageWidth * this.scaleFactor());

        return this.width;
    }
};
