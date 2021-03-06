'use strict';

var PhotoPreview = require('photo-preview');

/**
 * Галерея для изображений
 * @constructor
 */
var Gallery = function() {
  this.element = document.querySelector('.gallery-overlay');
  this.buttonClose = document.querySelector('.gallery-overlay-close');
  this.photoPreview = new PhotoPreview();
  this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
  this._onDocumentClick = this._onDocumentClick.bind(this);
};

/**
 * Показ галереи
 * @return {Element}
 */
Gallery.prototype.show = function() {
  this.element.classList.remove('invisible');
  window.addEventListener('keydown', this._onDocumentKeyDown);
  this.buttonClose.addEventListener('click', this._onDocumentClick);
};

/**
 * Cокрытие галереи
 * @return {Element}
 */
Gallery.prototype.hide = function() {
  this.element.classList.add('invisible');
  window.removeEventListener('keydown', this._onDocumentKeyDown);
  this.buttonClose.removeEventListener('click', this._onDocumentClick);
  this.photoPreview.remove();
  location.hash = '';
};

Gallery.prototype._onDocumentClick = function() {
  this.hide();
};

Gallery.prototype._onDocumentKeyDown = function(event) {
  switch (String(event.keyCode)) {
    case '27':
      this.hide();
      break;
  }
};

module.exports = Gallery;
