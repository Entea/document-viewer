_.extend(DV.Schema.helpers, {
    getSearchResponse: function (query) {
        console.log('Searching "%s"', query)
        this.viewer.searchResponse = {
            matches: 1,
            results: [],
            query: query
        };

        if (this.events.isTextLoaded) {
            this.highlightSearchResponses();
        } else {
            var me = this;
            this.events.loadAllTextPages(function() {
                me.highlightSearchResponses();
            });
        }
    },
    acceptInputCallBack: function () {
        var pageIndex = parseInt(this.elements.currentPage.text(), 10) - 1;
        // sanitize input

        pageIndex = (pageIndex === '') ? 0 : pageIndex;
        pageIndex = (pageIndex < 0) ? 0 : pageIndex;
        pageIndex = (pageIndex + 1 > this.models.document.totalPages) ? this.models.document.totalPages - 1 : pageIndex;
        var pageNumber = pageIndex + 1;

        this.elements.currentPage.text(pageNumber);
        this.viewer.$('.DV-pageNumberContainer input').val(pageNumber);

        if (this.viewer.state === 'ViewDocument' ||
                this.viewer.state === 'ViewThumbnails') {
            // this.viewer.history.save('document/p'+pageNumber);
            this.jump(pageIndex);
        } else if (this.viewer.state === 'ViewText') {
            // this.viewer.history.save('text/p'+pageNumber);
            this.events.openTextPage(pageIndex);
        }

    },
    highlightSearchResponses: function () {
        var viewer = this.viewer;
        var response = viewer.searchResponse;

        if (!response) return false;

        this.viewer.$('.DV-textPage').each(function(i, el) {
            // Replaces spaces in query with `\s+` to match newlines in textContent,
            // escape regex char contents (like "()"), and only match on word boundaries.
            var boundary = '(\\b|\\B)';
            var query = boundary + '(' + response.query.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&").replace(/\s+/g, '\\s+') + ')' + boundary;
            var textContent = $(el).find('.DV-textContents');
            var currentPageText = textContent.text();
            var pattern = new RegExp(query, "ig");
            var replacement = currentPageText.replace(pattern, '$1<span class="DV-searchMatch">$2</span>$3');

            textContent.html(replacement);
        });

        if (this.viewer.$('.DV-textContents span.DV-searchMatch').length == 0) {
            if (this.viewer.options.onEmptySearch) {
                this.viewer.options.onEmptySearch(response.query);
            }
        }

        var highlightIndex = (viewer.toHighLight) ? viewer.toHighLight : 0;
        this.highlightMatch(highlightIndex);
    },
    // Highlight a single instance of an entity on the page. Make sure to
    // convert into proper UTF8 before trying to get the entity length, and
    // then back into UTF16 again.
    highlightEntity: function (offset, length) {
        this.viewer.$('.DV-searchResults').addClass('DV-noResults');
        var textContent = this.viewer.$('.DV-textContents');
        var text = textContent.text();
        var pre = text.substr(0, offset);
        var entity = text.substr(offset, length);
        var post = text.substr(offset + length);
        text = [pre, '<span class="DV-searchMatch">', entity, '</span>', post].join('');
        textContent.html(text);
        this.highlightMatch(0);
    },

    highlightMatch: function (index) {
        var highlightsOnThisPage = this.viewer.$('.DV-textContents span.DV-searchMatch');
        if (highlightsOnThisPage.length == 0) return false;
        var currentPageIndex = this.getCurrentSearchPageIndex();
        var toHighLight = this.viewer.toHighLight;

        if (toHighLight) {
            if (toHighLight !== false) {
                if (toHighLight === 'last') {
                    index = highlightsOnThisPage.length - 1;
                } else if (toHighLight === 'first') {
                    index = 0;
                } else {
                    index = toHighLight;
                }
            }
            toHighLight = false;
        }
        var searchResponse = this.viewer.searchResponse;
        if (searchResponse) {
            if (index === (highlightsOnThisPage.length)) {

                if (searchResponse.results.length === currentPageIndex + 1) {
                    return;
                }
                toHighLight = 'first';
                this.events.openTextPage(searchResponse.results[currentPageIndex + 1] - 1, this.highlightSearchResponses);

                return;
            } else if (index === -1) {
                if (currentPageIndex - 1 < 0) {
                    return  false;
                }
                toHighLight = 'last';
                this.events.openTextPage(searchResponse.results[currentPageIndex - 1] - 1, this.highlightSearchResponses);

                return;
            }
            highlightsOnThisPage.removeClass('DV-highlightedMatch');
        }

        var match = this.viewer.$('.DV-textContents span.DV-searchMatch:eq(' + index + ')');
        match.addClass('DV-highlightedMatch');

        this.elements.scrollerTop(match.position().top - 50);
        if (searchResponse) searchResponse.highlighted = index;

        // cleanup
        highlightsOnThisPage = null;
        match = null;
    },
    getCurrentSearchPageIndex: function () {
        var searchResponse = this.viewer.searchResponse;
        if (!searchResponse) {
            return false;
        }
        var docModel = this.models.document;
        for (var i = 0, len = searchResponse.results.length; i < len; i++) {
            if (parseInt(searchResponse.results[i]) == parseInt(docModel.currentPage())) {
                return i;
            }
        }
    },
    highlightPreviousMatch: function (e) {
        e.preventDefault();
        this.highlightMatch(this.viewer.searchResponse.highlighted - 1);
    },
    highlightNextMatch: function (e) {
        e.preventDefault(e);
        this.highlightMatch(this.viewer.searchResponse.highlighted + 1);
    },

    clearSearch: function (e) {
        this.elements.searchInput.val('').keyup().focus();
    },

    showEntity: function (name, offset, length) {
        alert('Not implemented')
        this.viewer.$('span.DV-totalSearchResult').text('');
        this.viewer.$('span.DV-searchQuery').text(name);
        this.viewer.$('span.DV-currentSearchResult').text("Searching");
        this.events.openTextPage(this.models.document.currentIndex(), _.bind(this.viewer.helpers.highlightEntity, this.viewer.helpers, offset, length));
    },
    cleanUpSearch: function () {
        var viewer = this.viewer;
        viewer.searchResponse = null;
        viewer.toHighLight = null;
    }
});