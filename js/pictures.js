'use strict';

(function() {
  var pictures = [];
  var filteredImg =[];
  var currentPage = 0;
  var filterSort = 'popular';
  var PAGE_SIZE = 12;
  var xhr = new XMLHttpRequest();
  var container = document.querySelector('.pictures');

  /**
   * Форма сортировки изображения.
   * @type {HTMLFormElement}
   */
  var sortFilterForm = document.forms['filter-sort'];

  window.addEventListener('scroll', function() {
    if (document.documentElement.clientHeight + document.body.scrollTop === document.body.offsetHeight) {
      if (currentPage < Math.ceil(filteredImg.length / PAGE_SIZE)) {
        renderPhoto(filteredImg, ++currentPage);
      }
    }
  });

  function getImage() {
    //Создаем запрос для получения массива с картинками
    xhr.open('GET', 'http://o0.github.io/assets/json/pictures.json');
    xhr.timeout = 30000;

    xhr.onload = function(e) {
      var data = e.target.response;
      pictures = JSON.parse(data);
      filterPhoto(filterSort);
      container.classList.remove('pictures-loading');
      sortFilterForm.onchange = function() {
        container.innerHTML = '';
        var elems = sortFilterForm.elements.filter;
        for (var i = 0; i < elems.length; i++) {
          if (elems[i].checked) {
            var filterSort = elems[i].value;
          }
        }
        filterPhoto(filterSort);
      };
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
  }

  getImage();


  document.querySelector('.filters').classList.add('hidden');


  //Сортируем массив с картинками по фильтрам
  function filterPhoto(filterSort) {
    filteredImg = pictures.slice(0);
    currentPage = 0;
    switch (filterSort) {
      case 'popular':
        filteredImg = pictures.slice(0);
        break;
      case 'new':
        var today = new Date();
        var todaySet = today.setDate(today.getDate() - 12);
        filteredImg = filteredImg.sort(function(a, b) {
          return (today - Date.parse(a.date)) - (today - Date.parse(b.date));
        });
        filteredImg = filteredImg.filter(function(el) {
          return Date.parse(el.date) > todaySet;
        });
        break;
      case 'discussed':
        filteredImg = filteredImg.sort(function(a, b) {
          return b.comments - a.comments;
        });
        break;
    }
    renderPhoto(filteredImg, currentPage);
  }

  //Заполняем шаблон данными из полученного массива
  function renderPhoto(photo, pageNumber) {
    var from = pageNumber * PAGE_SIZE;
    var to = from + PAGE_SIZE;
    var photoPage = photo.slice(from, to);
    photoPage.forEach(function(elem) {
      var element = createTemplate(elem);
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
