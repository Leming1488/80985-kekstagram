'use strict';

(function() {
  var pictures = [];
  var filteredImg = [];
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
    clearTimeout(scrollTimeout);
    var scrollTimeout = setTimeout(function() {
      if (document.body.scrollTop + document.documentElement.clientHeight === document.body.scrollHeight) {
        if (currentPage < Math.ceil(filteredImg.length / PAGE_SIZE)) {
          renderPhoto(filteredImg, ++currentPage);
        }
      }
    }, 100);
  });

  function getImage() {
    // Создаем запрос для получения массива с картинками
    xhr.open('GET', 'http://o0.github.io/assets/json/pictures.json');
    xhr.timeout = 30000;
    xhr.onload = function(e) {
      var data = e.target.response;
      pictures = JSON.parse(data);
      filterPhoto(filterSort);
      container.classList.remove('pictures-loading');
      sortFilterForm.addEventListener('click', function(event) {
        if (event.target.classList.contains('filters-radio')) {
          container.innerHTML = '';
          currentPage = 0;
          filterPhoto(event.target.value);
        }
      });
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

  // Сортируем массив с картинками по фильтрам
  function filterPhoto(filterSort) {
    filteredImg = pictures.slice(0);
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
    if (document.body.scrollTop + document.documentElement.clientHeight === document.body.scrollHeight) {
      while (currentPage < Math.ceil(filteredImg.length / PAGE_SIZE)) {
        renderPhoto(filteredImg, currentPage);
        currentPage++;
      }
    } else {
      renderPhoto(filteredImg, currentPage, true);
    }
  }

  // Заполняем шаблон данными из полученного массива
  function renderPhoto(photo, pageNumber, clear) {
    if (clear) {
      container.innerHTML = '';
    }
    var fragment = document.createDocumentFragment();
    var from = pageNumber * PAGE_SIZE;
    var to = from + PAGE_SIZE;
    var photoPage = photo.slice(from, to);
    photoPage.forEach(function(elem) {
      var element = createTemplate(elem);
      fragment.appendChild(element);
    });
    container.appendChild(fragment);
  }

  // Создаем шаблон
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
