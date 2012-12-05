(function(){window.JST=window.JST||{};window.JST.annotation=_.template('<div class="DV-annotation <%= orderClass %> <%= accessClass %> <% if (owns_note) { %>DV-ownsAnnotation<% } %>" style="top:<%= top %>px;" id="DV-annotation-<%= id %>" data-id="<%= id %>">\n\n  <div class="DV-annotationTab" style="top:<%= tabTop %>px;">\n    <div class="DV-annotationClose DV-trigger">\n      <% if (access == \'exclusive\') { %>\n        <div class="DV-annotationDraftDot DV-editHidden"></div>\n      <% } %>\n    </div>\n  </div>\n\n  <div class="DV-annotationRegion" style="margin-left:<%= excerptMarginLeft - 4 %>px; height:<%= excerptHeight %>px; width:<%= excerptWidth - 1 %>px;">\n    <div class="<%= accessClass %>">\n      <div class="DV-annotationEdge DV-annotationEdgeTop"></div>\n      <div class="DV-annotationEdge DV-annotationEdgeRight"></div>\n      <div class="DV-annotationEdge DV-annotationEdgeBottom"></div>\n      <div class="DV-annotationEdge DV-annotationEdgeLeft"></div>\n      <div class="DV-annotationCorner DV-annotationCornerTopLeft"></div>\n      <div class="DV-annotationCorner DV-annotationCornerTopRight"></div>\n      <div class="DV-annotationCorner DV-annotationCornerBottomLeft"></div>\n      <div class="DV-annotationCorner DV-annotationCornerBottomRight"></div>\n    </div>\n    <div class="DV-annotationRegionExclusive"></div>\n  </div>\n\n\n  <div class="DV-annotationContent">\n\n    <div class="DV-annotationHeader DV-clearfix">\n      <div class="DV-pagination DV-editHidden">\n        <span class="DV-trigger DV-annotationPrevious" title="Previous Annotation">Previous</span>\n        <span class="DV-trigger DV-annotationNext" title="Next Annotation">Next</span>\n      </div>\n      <div class="DV-annotationGoto DV-editHidden"><div class="DV-trigger">p. <%= pageNumber %></div></div>\n      <div class="DV-annotationTitle DV-editHidden"><%= title %></div>\n      <input class="DV-annotationTitleInput DV-editVisible" type="text" placeholder="Annotation Title" value="<%= title.replace(/"/g, \'&quot;\') %>" />\n      <% if (access == \'exclusive\') { %>\n        <div class="DV-annotationDraftLabel DV-editHidden DV-interface">Draft</div>\n      <% } else if (access == \'private\') { %>\n        <div class="DV-privateLock DV-editHidden" title="Private note"></div>\n      <% } %>\n      <span class="DV-permalink DV-editHidden" title="Link to this note"></span>\n      <div class="DV-showEdit DV-editHidden <%= accessClass %>"></div>\n    </div>\n\n\n    <div class="DV-annotationExcerpt" style="height:<%= excerptHeight %>px;">\n      <div class="DV-annotationExcerptImageTop" style="height:<%= excerptHeight %>px; width:<%= excerptWidth %>px;left:<%= excerptMarginLeft - 1 %>px;">\n\n        <img class="DV-img" src="<%= image %>" style="left:<%= -(excerptMarginLeft + 1) %>px; top:-<%= imageTop %>px;" width="<%= imageWidth %>" />\n\n      </div>\n      <div class="DV-annotationExcerptImage" style="height:<%= excerptHeight %>px;">\n        <img class="DV-img" src="<%= image %>" style="top:-<%= imageTop %>px;" width="<%= imageWidth %>" />\n      </div>\n    </div>\n\n    <div class="DV-annotationBody DV-editHidden">\n      <%= text %>\n    </div>\n    <textarea class="DV-annotationTextArea DV-editVisible" style="width: <%= bWidth %>px;"><%= text %></textarea>\n\n    <div class="DV-annotationMeta <%= accessClass %>">\n      <% if (author) { %>\n        <div class="DV-annotationAuthor DV-interface DV-editHidden">\n          Annotated by: <%= author %><% if (author_organization) { %>, <i><%= author_organization %></i><% } %>\n        </div>\n      <% } %>\n      <% if (access == \'exclusive\') { %>\n        <div class="DV-annotationWarning DV-interface DV-editHidden">\n          This draft is only visible to you and collaborators.\n        </div>\n      <% } else if (access == \'private\') { %>\n        <div class="DV-annotationWarning DV-interface DV-editHidden">\n          This private note is only visible to you.\n        </div>\n      <% } %>\n      <div class="DV-annotationEditControls DV-editVisible">\n        <div class="DV-clearfix">\n          <div class="minibutton warn DV-deleteAnnotation float_left">Delete</div>\n          <div class="minibutton default DV-saveAnnotation float_right">\n            <% if (access == \'exclusive\') { %>\n              Publish\n            <% } else { %>\n              Save\n            <% } %>\n          </div>\n          <% if (access == \'public\' || access == \'exclusive\') { %>\n            <div class="minibutton DV-saveAnnotationDraft float_right">Save as Draft</div>\n          <% } %>\n          <div class="minibutton DV-cancelEdit float_right">Cancel</div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n');window.JST.annotationNav=_.template('<div class="DV-annotationMarker" id="DV-annotationMarker-<%= id %>">\n  <span class="DV-trigger">\n    <span class="DV-navAnnotationTitle"><%= title %></span>&nbsp;<span class="DV-navPageNumber">p.<%= page %></span>\n  </span>\n</div>');window.JST.chapterNav=_.template('<div id="DV-chapter-<%= id %>" class="DV-chapter <%= navigationExpanderClass %>">\n  <div class="DV-first">\n    <%= navigationExpander %>\n    <span class="DV-trigger">\n      <span class="DV-navChapterTitle"><%= title %></span>&nbsp;<span class="DV-navPageNumber">p.&nbsp;<%= pageNumber %></span>\n    </span>\n  </div>\n  <%= noteViews %>\n</div>');window.JST.descriptionContainer=_.template('<% if (description) { %>\n  <div class="DV-description">\n    <div class="DV-descriptionHead">\n      <span class="DV-descriptionToggle DV-showDescription DV-trigger"> Toggle Description</span>\n      Description\n    </div>\n    <div class="DV-descriptionText"><%= description %></div>\n  </div>\n<% } %>\n');window.JST.footer=_.template('<% if (!options.sidebar) { %>\n  <div class="DV-footer">\n    <div class="DV-fullscreenContainer"></div>\n    <div class="DV-navControlsContainer"></div>\n  </div>\n<% } %>');window.JST.fullscreenControl=_.template('<div class="DV-fullscreen" title="View Document in Fullscreen"></div>\n');window.JST.header=_.template("");window.JST.navControls=_.template('<div class="DV-navControls DV-clearfix">\n  <span class="DV-trigger DV-previous">&laquo;</span>\n  <div class="DV-clearfix DV-pageNumberContainer">\n    <span class="DV-currentPagePrefix">Page</span>\n    <span class="DV-currentAnnotationPrefix">Note&nbsp;</span>\n    <span class="DV-currentPage">1</span>\n    <span class="DV-currentPageSuffix">of&nbsp;\n      <span class="DV-totalPages"><%= totalPages %></span>\n      <span class="DV-totalAnnotations"><%= totalAnnotations %></span>                        \n    </span>\n  </div>\n  <span class="DV-trigger DV-next">&raquo;</span>\n</div>');window.JST.navigationExpander=_.template('<span class="DV-trigger DV-expander">Expand</span>');window.JST.pageAnnotation=_.template('<div class="DV-annotation DV-pageNote <%= orderClass %> <%= accessClass %> <% if (owns_note) { %>DV-ownsAnnotation<% } %>" style="top:<%= top %>px;" id="DV-annotation-<%= id %>" data-id="<%= id %>">\n  <div class="DV-annotationTab">\n    <div class="DV-annotationClose DV-trigger">p. <%= pageNumber %></div>\n  </div>\n\n  <div class="DV-annotationContent">\n    <!-- Header -->\n    <div class="DV-annotationHeader DV-clearfix">\n      <div class="DV-pagination DV-editHidden">\n        <span class="DV-trigger DV-annotationPrevious" title="Previous Annotation">Previous</span>\n        <span class="DV-trigger DV-annotationNext" title="Next Annotation">Next</span>\n      </div>\n      <div class="DV-annotationGoto DV-editHidden"><div class="DV-trigger">p. <%= pageNumber %></div></div>\n      <div class="DV-annotationTitle DV-editHidden"><%= title %></div>\n      <input class="DV-annotationTitleInput DV-editVisible" type="text" placeholder="Annotation Title" value="<%= title.replace(/"/g, \'&quot;\') %>" />\n      <% if (access == \'exclusive\') { %>\n        <div class="DV-annotationDraftLabel DV-editHidden DV-interface">Draft</div>\n      <% } else if (access == \'private\') { %>\n        <div class="DV-privateLock DV-editHidden" title="Private note"></div>\n      <% } %>\n      <span class="DV-permalink DV-editHidden" title="Link to this note"></span>\n      <div class="DV-showEdit DV-editHidden <%= accessClass %>"></div>\n    </div>\n\n    <div class="DV-annotationBody DV-editHidden">\n      <%= text %>\n    </div>\n    <textarea class="DV-annotationTextArea DV-editVisible" style="width: <%= bWidth %>px;"><%= text %></textarea>\n\n    <div class="DV-annotationMeta <%= accessClass %>">\n      <% if (author) { %>\n        <div class="DV-annotationAuthor DV-interface DV-editHidden">\n          Annotated by: <%= author %><% if (author_organization) { %>, <i><%= author_organization %></i><% } %>\n        </div>\n      <% } %>\n      <% if (access == \'exclusive\') { %>\n        <div class="DV-annotationWarning DV-interface DV-editHidden">\n          This draft is only visible to you and collaborators.\n        </div>\n      <% } else if (access == \'private\') { %>\n        <div class="DV-annotationWarning DV-interface DV-editHidden">\n          This private note is only visible to you.\n        </div>\n      <% } %>\n      <div class="DV-annotationEditControls DV-editVisible">\n        <div class="DV-clearfix">\n          <div class="minibutton warn DV-deleteAnnotation float_left">Delete</div>\n          <div class="minibutton default DV-saveAnnotation float_right">\n            <% if (access == \'exclusive\') { %>\n              Publish\n            <% } else { %>\n              Save\n            <% } %>\n          </div>\n          <% if (access == \'public\' || access == \'exclusive\') { %>\n            <div class="minibutton DV-saveAnnotationDraft float_right">Save as Draft</div>\n          <% } %>\n          <div class="minibutton DV-cancelEdit float_right">Cancel</div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n');window.JST.pages=_.template('<div class="DV-set p<%= pageIndex %>" data-id="p<%= pageIndex %>" style="top:0;left:0px;height:893px;width:700px;">\n  <div class="DV-overlay"></div>\n  <div class="DV-pageNoteInsert" title="Click to Add a Page Note">\n    <div class="DV-annotationTab">\n      <div class="DV-annotationClose"></div>\n    </div>\n    <div class="DV-annotationDivider"></div>\n  </div>\n  <div class="DV-pageMeta"><span class="DV-pageNumber">p. <%= pageNumber %></span></div>\n  <div class="DV-annotations"></div>\n  <div class="DV-page" style="height:863px;width:700px;">\n    <span class="DV-loading-top">Loading</span>\n    <span class="DV-loading-bottom">Loading</span>\n    <div class="DV-cover"></div>\n    <img class="DV-pageImage" <%= pageImageSource ? \'src="\' + pageImageSource + \'"\' : \'\' %> height="863" />\n  </div>\n</div>');window.JST.thumbnails=_.template('<% for (; page <= endPage; page++) { %>\n  <% var url = imageUrl.replace(/{page}/, page) ; %>\n  <div class="DV-thumbnail" id="DV-thumbnail-<%= page %>" data-pageNumber="<%= page %>">\n    <div class="DV-overlay">\n      <div class=\'DV-caret\'></div>\n    </div>\n    <div class="DV-thumbnail-page">\n      <div class="DV-thumbnail-select">\n        <div class="DV-thumbnail-shadow"></div>\n        <img class="DV-thumbnail-image" data-src="<%= url %>" />\n      </div>\n      <div class="DV-pageNumber DV-pageMeta"><span class="DV-pageNumberText"><span class="DV-pageNumberTextUnderline">p. <%= page %></span></span></div>\n    </div>\n  </div>\n<% } %>\n');window.JST.unsupported=_.template('<div class="DV-unsupported">\n  <div class="DV-intro">\n    <% if (viewer.schema.document.resources && viewer.schema.document.resources.pdf) { %>\n      <a href="<%= viewer.schema.document.resources.pdf %>">Download this document as a PDF</a>\n    <% } %>\n    <br />\n    <br />\n    To use the Document Viewer you need to<br /> upgrade your browser:\n  </div>\n  <div class="DV-browsers">\n    <div class="DV-browser">\n      <a href="http://www.google.com/chrome">\n        <div class="DV-image DV-chrome"> </div>Chrome\n      </a>\n    </div>\n    <div class="DV-browser">\n      <a href="http://www.apple.com/safari/download/">\n        <div class="DV-image DV-safari"> </div>Safari\n      </a>\n    </div>\n    <div class="DV-browser">\n      <a href="http://www.mozilla.com/en-US/firefox/firefox.html">\n        <div class="DV-image DV-firefox"> </div>Firefox\n      </a>\n    </div>\n    <br style="clear:both;" />\n  </div>\n  <div class="DV-after">\n    Or, if you\'d like to continue using Internet Explorer 6,<br /> you can\n    <a href="http://www.google.com/chromeframe">install Google Chrome Frame</a>.\n  </div>\n</div>\n');window.JST.viewer=_.template('<!--[if lte IE 8]><div class="DV-docViewer DV-clearfix DV-viewDocument DV-ie <% if (autoZoom) { %>DV-autoZoom<% } %> <% if (mini) { %>DV-mini<% } %> <% if (!options.sidebar) { %>DV-hideSidebar<% } else { %>DV-hideFooter<% } %>"><![endif]-->\n<!--[if (!IE)|(gte IE 9)]><!--><div class="DV-docViewer DV-clearfix DV-viewDocument <% if (autoZoom) { %>DV-autoZoom<% } %> <% if (mini) { %>DV-mini<% } %> <% if (!options.sidebar) { %>DV-hideSidebar<% } else { %>DV-hideFooter<% } %>"><!-- <![endif]-->\n  \n  <div class="DV-docViewerWrapper">\n\n    <%= header %>\n    <div class="DV-docViewer-Container">\n    \n      <div class="DV-searchBarWrapper">\n        <div class="DV-searchBar">\n          <span class="DV-trigger DV-closeSearch">CLOSE</span>\n          <div class="DV-searchPagination DV-foundResult">\n            <div class="DV-searchResults">\n              <span class="DV-resultPrevious DV-trigger">Previous</span>\n              <span class="DV-currentSearchResult"></span>\n              <span class="DV-totalSearchResult"></span>\n              <span> for &ldquo;<span class="DV-searchQuery"></span>&rdquo;</span>\n              <span class="DV-resultNext DV-trigger">Next</span>\n            </div>\n          </div>\n        </div>\n      </div>\n    \n      <div class="DV-pages <% if (!options.sidebar) { %>DV-hide-sidebar<% } %>">\n        <div class="DV-paper">\n          <div class="DV-thumbnails"></div>\n          <div class="DV-pageCollection">\n            <div class="DV-bar" style=""></div>\n            <div class="DV-allAnnotations">\n            </div>\n            <div class="DV-text">\n              <div class="DV-textSearch DV-clearfix">\n          \n              </div>\n              <div class="DV-textPage">\n                <span class="DV-textCurrentPage"></span>\n                <pre class="DV-textContents"></pre>\n              </div>\n            </div>\n            <%= pages %>\n          </div>\n        </div>\n      </div>\n    \n      <div width="265px" class="DV-sidebar <% if (!options.sidebar) { %>DV-hide<% } %>" style="display:none;">\n        <div class="DV-well">\n    \n          <div class="DV-sidebarSpacer"></div>\n          \n          <% if (options.sidebar) { %>\n            <div class="DV-navControlsContainer">\n            </div>\n          <% } %>\n              \n          <div class="DV-navigation">\n            <%= descriptionContainer %>\n            <div class="DV-contentsHeader">Contents</div>\n            <div class="DV-chaptersContainer">\n            </div>\n            <div class="DV-supplemental">\n              <% if (pdf_url) { %>\n                <div class="DV-pdfLink"><%= pdf_url %></div>\n              <% } %>\n              <% if (print_notes_url) { %>\n                <div class="DV-printNotesLink">\n                  <a target="_blank" href="<%= print_notes_url %>">Print Notes &raquo;</a>\n                </div>\n              <% } %>\n              <div class="DV-storyLink" style="<%= story_url ? \'\' : \'display:none\' %>">\n                <a target="_blank" href="<%= story_url %>">Related Article &raquo;</a>\n              </div>\n              <% if (contributors) { %>\n                <div class="DV-contributor">Contributed by: <%= contributors %></div>\n              <% } %>\n            </div>\n            <div class="DV-logo"><a class="DV-logoLink" href="http://www.documentcloud.org"></a></div>\n          </div>\n        </div>\n      </div>\n    </div>\n    \n    <%= footer %>\n    \n  </div>\n  \n  <div class="DV-printMessage">\n    To print the document, click the "Original Document" link to open the original \n    PDF. At this time it is not possible to print the document with annotations.\n  </div>\n\n</div>\n')})();