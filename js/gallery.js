/* global PhotoBase: true */
  'use strict';
  (function() {

    var Gallery = function() {
      this.element = document.querySelector('.gallery-overlay');
      this.buttonClose = document.querySelector('.gallery-overlay-close');
      this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
      this._onDocumentClick = this._onDocumentClick.bind(this);
    };

    inherit(Gallery, new PhotoBase());

    Gallery.prototype = {
      show: function() {
        this.element.classList.remove('invisible');
        document.addEventListener('keydown', this._onDocumentKeyDown);
        this.buttonClose.addEventListener('click', this._onDocumentClick)
      },
      hide: function() {
        this.element.classList.add('invisible');
        document.removeEventListener('keydown', this._onDocumentKeyDown);
        this.buttonClose.removeEventListener('click', this._onDocumentClick)
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
      _onDocumentClick: function() {
        this.hide();
      },
      _onDocumentKeyDown: function() {
        switch (String(event.keyCode)) {
          case '27':
            this.hide();
            break;
          case '37':

          case '37':

        }
      }
    };

    window.Gallery = Gallery;

  })();
