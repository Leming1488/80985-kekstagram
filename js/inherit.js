'use strict';

/**
 * Функция наследования
 * @param {Object} Child
 * @param {Object} Parent
 * @constructor
 */
var Inherit = function(Child, Parent) {
  function Empty() {}
  Empty.prototype = Parent.prototype;
  Child.prototype = new Empty();
};

module.exports = Inherit;
