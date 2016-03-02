'use strict';

var PhotoBase = require(['photo-base']);
var Inherit = require(['inherit'])

/**
 * Изображений превью в галлереи
 * @constructor
 */
var PhotoPreview = function() {
  this.element = document.querySelector('.gallery-overlay-preview');
  this._data = this.getData();
  this._like = this.element.querySelector('.likes-count');
  this._onClick = this._onClick.bind(this);
};

Inherit(PhotoPreview, PhotoBase);

/**
 * Заполнения превью изображения
 * @param  {number} number
 */
PhotoPreview.prototype.setCurrentPicture = function(number) {
  this._data.forEach( function(item, i) {
    if (i === number) {
      this.element.querySelector('.gallery-overlay-image').src = this.getData()[i].url;
      this._like.textContent = this.getData()[i].likes;
      this.element.querySelector('.comments-count').textContent = this.getData()[i].comments;
      this._like.addEventListener('click', this._onClick);
    }
  }.bind(this));
};

/**
 * Лайков по клику
 * @return {[type]}
 */
PhotoPreview.prototype._onClick = function() {
  this._like.classList.toggle('likes-count-liked');
  if (this._like.classList.contains('likes-count-liked')) {
    this._data.like = this._like.textContent ++;
  } else {
    this._data.like = this._like.textContent --;
  }
};

/**
 * Убираем клики и обработчики
 * @return {type}
 */
PhotoPreview.prototype.remove = function() {
  this._like.removeEventListener('click', this._onClick);
  this._like.classList.remove('likes-count-liked');
};

module.exports = PhotoPreview;
