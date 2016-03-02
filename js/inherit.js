'use strict';

/**
 * Функция наследования
 * @constructor
 */
var Inherit = function(Child, Parent) {
  function Empty() {}
  Empty.prototype = Parent.prototype;
  Child.prototype = new Empty();
};

module.exports = Inherit;
