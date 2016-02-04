'use strict';

(function() {
  var container = document.querySelector('.pictures');

  pictures.forEach(function(picture) {
    var element = createTemplate(picture);
    console.log(element);

  });

  function createTemplate(data) {
    
    var template = document.getElementById('picture-template');

    if ('content' in template) {
      var element = template.content.children[0].cloneNode(true);
    } else {
      var element = template.childNodes[0].cloneNode(true);
    }

    var pictureNew = new Image();
    var pictureOld = element.querySelector('.picture img');
    element.replaceChild(pictureOld, pictureNew);
    element.querySelector('.picture-stat .picture-comments').textContent(data.comments);
    element.querySelector('.picture-stat .picture-likes').textContent(data.likes);


    return element;
  }

})();
