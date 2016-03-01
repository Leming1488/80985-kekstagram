/* global PhotoBase: true */
/* global PhotoPreview: true */

  'use strict';
  (function() {
    var Gallery = function() {
      this.element = document.querySelector('.gallery-overlay');
      this.buttonClose = document.querySelector('.gallery-overlay-close');
      this.photoPreview = new PhotoPreview();
      this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
      this._onDocumentClick = this._onDocumentClick.bind(this);
    };



    inherit(Gallery, PhotoBase);

    Gallery.prototype.show = function() {
      this.element.classList.remove('invisible');
      document.addEventListener('keydown', this._onDocumentKeyDown);
      this.buttonClose.addEventListener('click', this._onDocumentClick)
    };
    Gallery.prototype.hide = function() {
      this.element.classList.add('invisible');
      document.removeEventListener('keydown', this._onDocumentKeyDown);
      this.buttonClose.removeEventListener('click', this._onDocumentClick);
      this.photoPreview.remove();
    };
    Gallery.prototype._onDocumentClick = function() {
      this.hide();
    };
    Gallery.prototype._onDocumentKeyDown = function() {
      switch (String(event.keyCode)) {
        case '27':
          this.hide();
          break;
        case '37':
          this.photoPreview.setCurrentPicture((this.photoPreview.element.childElementCount) - 1);
        case '38':
          this.photoPreview.setCurrentPicture((this.photoPreview.element.childElementCount) + 1);
      }
    };

    window.Gallery = Gallery;

  })();
