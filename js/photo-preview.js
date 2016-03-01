/* global PhotoBase: true */
  'use strict';
  (function() {

    var PhotoPreview = function() {
      this.element = document.querySelector('.gallery-overlay');
    };

    inherit(PhotoPreview, PhotoBase);

    PhotoPreview.prototype.setCurrentPicture = function(number) {
      this.getData().forEach( function(item, i) {
        if (i === number) {
          this.element.querySelector('.gallery-overlay-image').src = item.url;
          this.element.querySelector('.gallery-overlay-controls-like').textContent = item.likes;
          this.element.querySelector('.gallery-overlay-controls-comments').textContent = item.comments;
        }
      }.bind(this));
    };

    window.PhotoPreview = PhotoPreview;

  })();
