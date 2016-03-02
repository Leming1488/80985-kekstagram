'use strict';

/**
 * Функция наследования
 * @param {Object} Child
 * @param {Object} Parent
 */
var inherit = function(Child, Parent) {
  function Empty() {}
  Empty.prototype = Parent.prototype;
  Child.prototype = new Empty();
};

module.exports = inherit;
