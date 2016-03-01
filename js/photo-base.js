'use strict';
(function() {
  var PhotoBase = function() {};

  PhotoBase.prototype._data = null;

  PhotoBase.prototype.setData = function(data) {
    this._data = data;
  };

  PhotoBase.prototype.getData = function() {
    return this._data;
  };

  window.PhotoBase = PhotoBase;

})();
