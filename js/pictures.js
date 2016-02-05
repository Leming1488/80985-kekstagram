'use strict';

(function() {

  document.querySelector('.filters').classList.add('hidden');

  var container = document.querySelector('.pictures');

  pictures.forEach(function(picture) {
    //Заполняем шаблон данными из полученного массива
    var element = createTemplate(picture);
    container.appendChild(element);
  });

  //Создаем шаблон
  function createTemplate(data) {

    var template = document.getElementById('picture-template');

    if ('content' in template) {
      var element = template.content.children[0].cloneNode(true);
    } else {
      var element = template.childNodes[0].cloneNode(true);
    }

    var pictureNew = new Image(182,182);
    pictureNew.title = data.date;
    var pictureOld = element.querySelector('.picture img');
    
    pictureNew.onload = function() {
      element.replaceChild(pictureNew, pictureOld);
    }
    pictureNew.onerror = function(e) {
      element.replaceChild(pictureNew, pictureOld);
      pictureNew.parentElement.classList.add('picture-load-failure');
    }

    pictureNew.src = data.url;
    element.querySelector('.picture-comments').textContent = data.comments;
    element.querySelector('.picture-likes').textContent = data.likes;

    return element;
  }

  document.querySelector('.filters').classList.remove('hidden');

})();
