  'use strict';
  (function() {

    var Gallery = function() {
      this.element = document.querySelector('.gallery-overlay');
      this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
    };

    Gallery.prototype = {
      show: function() {
        this.element.classList.remove('invisible');
        document.addEventListener('keydown', this._onDocumentKeyDown);
      },
      hide: function() {
        this.element.classList.add('invisible');
        document.removeEventListener('keydown', this._onDocumentKeyDown);
      },
      setPictures: function(array) {
        this.picture = Object.create(array);
      },
      _onDocumentKeyDown: function(event) {
        if (String(event.keyCode) === '27') {
          this.hide();
        }
      }
    };

    window.Gallery = Gallery;

  })();
