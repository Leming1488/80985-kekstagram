'use strict';
(function() {

 function inherit(Child, Parent) {
   function Empty() {}
   Empty.prototype = Parent.prototype;
   Child.prototype = new Empty();
 }

 window.inherit = inherit;
})();
