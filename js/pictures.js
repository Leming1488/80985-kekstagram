'use strict';

(function() {
  var pictures = [];
  var xhr = new XMLHttpRequest();
    var container = document.querySelector('.pictures');

  xhr.open('GET', 'http://o0.github.io/assets/json/pictures.json');

  xhr.timeout = 30000;

  xhr.onload = function(e) {
    var data = e.target.response;
    pictures = JSON.parse(data);
    renderPhoto(pictures);
    container.classList.remove('pictures-loading')
  };

  xhr.onprogress = function() {
    container.classList.add('pictures-loading');
  };

  xhr.ontimeout = function() {
    container.classList.add('pictures-failure');
  };

  xhr.onabort = function() {
    container.classList.add('pictures-failure');
  };

  xhr.send();



  document.querySelector('.filters').classList.add('hidden');


  function renderPhoto(pictures) {
    pictures.forEach(function(picture) {
      //Заполняем шаблон данными из полученного массива
      var element = createTemplate(picture);
      container.appendChild(element);
    });
  }


  //Создаем шаблон
  function createTemplate(data) {

    var template = document.getElementById('picture-template');

    if ('content' in template) {
      var element = template.content.children[0].cloneNode(true);
    } else {
      element = template.childNodes[0].cloneNode(true);
    }

    var pictureNew = new Image(182, 182);
    pictureNew.title = data.date;
    var pictureOld = element.querySelector('.picture img');

    pictureNew.onload = function() {
      element.replaceChild(pictureNew, pictureOld);
    };
    pictureNew.onerror = function() {
      element.replaceChild(pictureNew, pictureOld);
      pictureNew.parentElement.classList.add('picture-load-failure');
    };

    pictureNew.src = data.url;
    element.querySelector('.picture-comments').textContent = data.comments;
    element.querySelector('.picture-likes').textContent = data.likes;

    return element;
  }

  document.querySelector('.filters').classList.remove('hidden');

})();
