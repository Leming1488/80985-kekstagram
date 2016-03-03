'use strict';

var Photo = require(['photo']);
var Gallery = require(['gallery']);
var PhotoPreview = require(['photo-preview']);

/**
 * Данные фото
 * @type {Array}
 */
var pictures = [];

/**
 * Отфильтрированные фото данные
 * @type {Array}
 */
var filteredImg = [];

/**
 *
 * @type {Array}
 */
var renderPhotos = [];

/**
 * Текущая страница
 * @type {number}
 */
var currentPage = 0;

/**
 * Фильтр по умолчанию
 * @type {string}
 */
var filterAct = localStorage.getItem('filterAct') || 'popular';

/**
 * Количество фото на странице
 * @const {number}
 */
var PAGE_SIZE = 8;

/**
 * Регулярка для хеша фото
 * @const {string}
 */
var REGEXP = /#photos\/(\S+)/;

var xhr = new XMLHttpRequest();
var container = document.querySelector('.pictures');
var gallery = new Gallery();
var photoPreview = new PhotoPreview();

/**
 * Форма сортировки изображения.
 * @type {HTMLFormElement}
 */
var sortFilterForm = document.forms['filter-sort'];

/**
 * Функция загрузки изображения при прокрутки
 */
window.addEventListener('scroll', function() {
  clearTimeout(scrollTimeout);
  var scrollTimeout = setTimeout(function() {
    if (window.pageYOffset + document.documentElement.clientHeight === document.documentElement.scrollHeight) {
      if (currentPage < Math.ceil(filteredImg.length / PAGE_SIZE)) {
        renderPhoto(filteredImg, ++currentPage);
      }
    }
  }, 100);
});

/**
 * Функция проверки изменения хеша
 */
window.addEventListener('hashchange', function() {
  var str = location.hash;
  var localH = str.match(REGEXP);
  if (localH) {
    photoPreview.setCurrentPicture(location.hash);
    gallery.show();
  } else {
    gallery.hide();
  }
});

/**
 * Функция  получения и рендера массива с картинками
 * @return {Element}
 */
function getImage() {
  xhr.open('GET', 'http://o0.github.io/assets/json/pictures.json');
  xhr.timeout = 30000;
  xhr.onload = function(e) {
    var data = e.target.response;
    pictures = JSON.parse(data);
    filterPhoto(filterAct);
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

/**
 * Сортируем массив с картинками по фильтрам
 * @param  {Array} filterSort
 * @return {Element}
 */
function filterPhoto(filterSort) {
  filteredImg = pictures.slice(0);
  localStorage.setItem('filterAct', filterSort);
  switch (filterSort) {
    case 'popular':
      filteredImg = pictures.slice(0);
      sortFilterForm.elements[0].checked = true;
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
      sortFilterForm.elements[1].checked = true;
      break;
    case 'discussed':
      filteredImg = filteredImg.sort(function(a, b) {
        return b.comments - a.comments;
      });
      sortFilterForm.elements[2].checked = true;
      break;
  }
  if (window.pageYOffset + document.documentElement.clientHeight === document.documentElement.scrollHeight) {
    while (currentPage < Math.ceil(filteredImg.length / PAGE_SIZE)) {
      renderPhoto(filteredImg, currentPage);
      currentPage++;
    }
  } else {
    renderPhoto(filteredImg, currentPage, true);
  }
}

/**
 * Заполняем шаблон данными из полученного массива
 * @param  {Array} photo
 * @param  {number} pageNumber
 * @param  {boolean} clear
 * @return {Element}
 */
function renderPhoto(photo, pageNumber, clear) {
  if (clear) {
    var elem;
    while ((elem = renderPhotos.shift())) {
      container.removeChild(elem);
      elem.onClick = null;
      elem.remove();
    }
  }
  var fragment = document.createDocumentFragment();
  var from = pageNumber * PAGE_SIZE;
  var to = from + PAGE_SIZE;
  var photoPage = photo.slice(from, to);
  renderPhotos = renderPhotos.concat(photoPage.map(function(items) {
    var photoElement = new Photo();
    photoElement.setData(items);
    photoElement.render();
    fragment.appendChild(photoElement.element);
    /**
     * Обработчик клика по фото в списке
     */
    photoElement.onClick = function() {
      location.hash = items.url;
      photoPreview.setData(photoPage);
      photoPreview.setCurrentPicture(location.hash);
    };
  }));
  container.appendChild(fragment);
  var str = location.hash;
  var localH = str.match(REGEXP);
  if (localH) {
    photoPreview.setData(photoPage);
    photoPreview.setCurrentPicture(location.hash);
    gallery.show();
  }
}

document.querySelector('.filters').classList.remove('hidden');
