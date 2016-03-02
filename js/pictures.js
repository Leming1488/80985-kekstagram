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
 * @type {Number}
 */
var currentPage = 0;

/**
 * Фильтр по умолчанию
 * @type {String}
 */
var filterAct = localStorage.getItem('filterAct') || 'popular';

/**
 * Количество фото на странице
 * @const {Number}
 */
var PAGE_SIZE = 8;

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
 * @param {Event}
 * @param {function} function()
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
 * @param  {Array} filterSort Массив с картинками
 * @return {Element}
 */
function filterPhoto(filterSort) {
  filteredImg = pictures.slice(0);
  localStorage.setItem('filterAct', filterSort);
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
  renderPhotos = renderPhotos.concat(photoPage.map(function(items, i) {
    var photoElement = new Photo();
    photoElement.setData(items);
    photoElement.render();
    fragment.appendChild(photoElement.element);
    photoElement.onClick = function() {
      photoPreview.setData(photoPage);
      gallery.show();
      photoPreview.setCurrentPicture(i);
    };
  }));
  container.appendChild(fragment);
}

document.querySelector('.filters').classList.remove('hidden');
