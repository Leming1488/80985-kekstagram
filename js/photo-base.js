'use strict';
/**
 * Базовое изображение
 * @constructor
 */
var PhotoBase = function() {};

/**
 * Данные с изображениями
 * @type {[null]}
 */
PhotoBase.prototype._data = null;

/**
 * Установка данных
 * @param  {[Object]} data 
 */
PhotoBase.prototype.setData = function(data) {
  this._data = data;
};

/**
 * Полученние данных
 * @return {[Object]}
 */
PhotoBase.prototype.getData = function() {
  return this._data;
};

module.exports = PhotoBase;
