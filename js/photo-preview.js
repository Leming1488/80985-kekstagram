/* global PhotoBase: true */
/* global inherit: true */
  'use strict';
  (function() {

    var PhotoPreview = function() {
      this.element = document.querySelector('.gallery-overlay');
      this._data =  this.getData();
      this._like = this.element.querySelector('.gallery-overlay-controls-like');
      this._onClick = this._onClick.bind(this);
    };

    inherit(PhotoPreview, PhotoBase);

    PhotoPreview.prototype.setCurrentPicture = function(number) {
      this._data.forEach( function(item, i) {
        if (i === number) {
          this.element.querySelector('.gallery-overlay-image').src = this.getData()[i].url;
          this._like.textContent = this.getData()[i].likes;
          this.element.querySelector('.gallery-overlay-controls-comments').textContent = this.getData()[i].comments;
          this._like.addEventListener('click', this._onClick);
        }
      }.bind(this));
    };

    PhotoPreview.prototype._onClick = function() {
      this._like.classList.toggle('likes-count');
      if (this._like.classList.contains('likes-count')) {
        this._data.like = this._like.textContent ++;
      } else {
        this._data.like = this._like.textContent --;
      }
    };

    PhotoPreview.prototype.remove = function() {
      this._like.removeEventListener('click', this._onClick);
    };

    window.PhotoPreview = PhotoPreview;

  })();
