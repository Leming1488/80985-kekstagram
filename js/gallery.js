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
        this._pictures = Object.create(array);
      },
      setCurrentPicture: function(number) {
        this._pictures.forEach( function(item, i) {
          if (i === number) {
            this.element.querySelector('.gallery-overlay-image').src = this._pictures[i].url;
            this.element.querySelector('.gallery-overlay-controls-like').textContent = this._pictures[i].likes;
            this.element.querySelector('.gallery-overlay-controls-comments').textContent = this._pictures[i].comments;
          }
        }.bind(this));
      },
      _onDocumentKeyDown: function(event) {
        if (String(event.keyCode) === '27') {
          this.hide();
        }
      }
    };

    window.Gallery = Gallery;

  })();
