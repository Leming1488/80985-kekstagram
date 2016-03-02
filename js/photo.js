'use strict';

var PhotoBase = require(['photo-base']);
var Inherit = require(['inherit']);

/**
* @constructor
* @param {string} data
*/
var Photo = function() {
  this._onClick = this._onClick.bind(this);
};

Inherit(Photo, PhotoBase);

Photo.prototype.render = function() {
  var template = document.getElementById('picture-template');
  if ('content' in template) {
    this.element = template.content.children[0].cloneNode(true);
  } else {
    this.element = template.childNodes[0].cloneNode(true);
  }
  var pictureNew = new Image(182, 182);
  pictureNew.title = this._data.date;
  var pictureOld = this.element.querySelector('.picture img');

  pictureNew.onload = function() {
    this.element.replaceChild(pictureNew, pictureOld);
  }.bind(this);
  pictureNew.onerror = function() {
    this.element.replaceChild(pictureNew, pictureOld);
    pictureNew.parentElement.classList.add('picture-load-failure');
  }.bind(this);

  pictureNew.src = this._data.url;
  this.element.querySelector('.picture-comments').textContent = this._data.comments;
  this.element.querySelector('.picture-likes').textContent = this._data.likes;
  this.element.addEventListener('click', this._onClick);
};

Photo.prototype._onClick = function(event) {
  event.preventDefault();
  if (event.currentTarget.classList.contains('picture') && !this.element.classList.contains('picture-load-failure')) {
    if (typeof this.onClick === 'function') {
      this.onClick();
    }
  }
};

Photo.prototype.remove = function() {
  this.element.removeEventListener('click', this._onClick);
};

Photo.prototype.onClick = null;

module.exports = Photo;
