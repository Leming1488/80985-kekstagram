/* global Resizer: true */

/**
 * @fileoverview
 * @author Igor Alexeenko (o0)
 */

'use strict';

(function() {
  /** @enum {string} */
  var FileType = {
    'GIF': '',
    'JPEG': '',
    'PNG': '',
    'SVG+XML': ''
  };

  /** @enum {number} */
  var Action = {
    ERROR: 0,
    UPLOADING: 1,
    CUSTOM: 2
  };

  var resizerPoint;

  /**
   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
   * из ключей FileType.
   * @type {RegExp}
   */
  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

  /**
   * @type {Object.<string, string>}
   */
  var filterMap;

  /**
   * Объект, который занимается кадрированием изображения.
   * @type {Resizer}
   */
  var currentResizer;


  window.addEventListener('resizerchange', function() {
     resizerPoint = resizer.getConstraint();
     console.log(resizerPoint);
  })
  /**
   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
   * изображением.
   */
  function cleanupResizer() {
    if (currentResizer) {
      currentResizer.remove();
      currentResizer = null;
    }
  }

  /**
   * Ставит одну из трех случайных картинок на фон формы загрузки.
   */
  function updateBackground() {
    var images = [
      'img/logo-background-1.jpg',
      'img/logo-background-2.jpg',
      'img/logo-background-3.jpg'
    ];

    var backgroundElement = document.querySelector('.upload');
    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
  }

  /**
   * Проверяет, валидны ли данные, в форме кадрирования.
   * @return {boolean}
   */
  function resizeFormIsValid() {
    var resizeX = resizeForm.elements.x.value;
    var resizeY = resizeForm.elements.y.value;
    var resizeSize = resizeForm.elements.size.value;
    if (resizeX < 0 || resizeY < 0 ) {
      return 1;
    } else if (resizeX + resizeSize > currentResizer._image.naturalWidth || resizeY + resizeSize > currentResizer._image.naturalHeight ) {
      return 2;
    } else {
      return 3;
    }
  }

  /**
   * Форма загрузки изображения.
   * @type {HTMLFormElement}
   */
  var uploadForm = document.forms['upload-select-image'];

  /**
   * Форма кадрирования изображения.
   * @type {HTMLFormElement}
   */
  var resizeForm = document.forms['upload-resize'];

  /**
   * Форма добавления фильтра.
   * @type {HTMLFormElement}
   */
  var filterForm = document.forms['upload-filter'];

  /**
   * @type {HTMLImageElement}
   */
  var filterImage = filterForm.querySelector('.filter-image-preview');

  /**
   * @type {HTMLElement}
   */
  var uploadMessage = document.querySelector('.upload-message');

  /**
   * @param {Action} action
   * @param {string=} message
   * @return {Element}
   */
  function showMessage(action, message) {
    var isError = false;

    switch (action) {
      case Action.UPLOADING:
        message = message || 'Кексограмим&hellip;';
        break;

      case Action.ERROR:
        isError = true;
        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
        break;
    }

    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
    uploadMessage.classList.remove('invisible');
    uploadMessage.classList.toggle('upload-message-error', isError);
    return uploadMessage;
  }

  function hideMessage() {
    uploadMessage.classList.add('invisible');
  }

  function cordinateElem(elem) {
    var box = elem.getBoundingClientRect();
    return {
      top: box.top + pageYOffset,
      left: box.left + pageXOffset
    };
  }

  /**
  * Сообщение об ошибке, если данные невалидны.
  * @type {HTMLElement}
  */

  var tooltip = document.querySelector('.upload-form-tooltip');

  function uploadFormTooltip(text, event) {
    var cord = cordinateElem(event);
    tooltip.classList.remove('invisible');
    tooltip.innerHTML = '<p>' + text + '</p>';
    var height = tooltip.offsetHeight;
    var width = tooltip.offsetWidth;
    var evWidth = event.offsetWidth;
    tooltip.style.top = cord.top - height - 10 + 'px';
    tooltip.style.left = cord.left - (width - evWidth) / 2 + 'px';
  }


  /**
   * Обработчик изменения изображения в форме загрузки. Если загруженный
   * файл является изображением, считывается исходник картинки, создается
   * Resizer с загруженной картинкой, добавляется в форму кадрирования
   * и показывается форма кадрирования.
   * @param {Event} evt
   */
  uploadForm.addEventListener('change', function(evt) {
    var element = evt.target;
    if (element.id === 'upload-file') {
      // Проверка типа загружаемого файла, тип должен быть изображением
      // одного из форматов: JPEG, PNG, GIF или SVG.
      if (fileRegExp.test(element.files[0].type)) {
        var fileReader = new FileReader();

        showMessage(Action.UPLOADING);

        fileReader.addEventListener('load', function() {
          cleanupResizer();

          currentResizer = new Resizer(fileReader.result);
          currentResizer.setElement(resizeForm);
          uploadMessage.classList.add('invisible');

          uploadForm.classList.add('invisible');
          resizeForm.classList.remove('invisible');

          hideMessage();
        });

        fileReader.readAsDataURL(element.files[0]);
      } else {
        // Показ сообщения об ошибке, если загружаемый файл, не является
        // поддерживаемым изображением.
        showMessage(Action.ERROR);
      }
    }
  });

  /**
   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
   * и обновляет фон.
   * @param {Event} evt
   */
  resizeForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    tooltip.classList.add('invisible');

    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });


  /**
   * Обработка валидации формы кадрирования.
   * @param {Event} evt
   */
  resizeForm.addEventListener('change', function(evt) {
    var element = evt.target;
    var text;

    /**
     * Проверяет, действительно ли существует cookie с переданным названием.
     * @return {boolean}
     */
    if (docCookies.hasItem('filter')) {
      var filterCookies = docCookies.getItem('filter');
      var filters = filterForm['upload-filter'];
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia'
      };

      /**
       * Устанавливаем  фильтр по умолчанию.
       *
       */
      for (var i = 0; i < filters.length; i++) {
        var filterValue = filters[i];
        if (filterValue.value === filterCookies) {
          filterValue.setAttribute('checked', true);
          filterImage.className = 'filter-image-preview ' + filterMap[filterCookies];
          break;
        }
      }
    }

    switch (resizeFormIsValid()) {
      case 1:
        text = 'Поля «сверху» и «слева» не могут быть отрицательными';
        uploadFormTooltip(text, element);
        resizeForm.fwd.setAttribute('disabled', true);
        break;
      case 2:
        text = 'Сумма значений полей «слева» или «сверху» и «сторона» не должна быть больше ширины исходного изображения';
        uploadFormTooltip(text, element);
        resizeForm.fwd.setAttribute('disabled', true);
        break;
      case 3:
        tooltip.classList.add('invisible');
        resizeForm.fwd.removeAttribute('disabled');
        break;
    }
  });


  /**
   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
   * кропнутое изображение в форму добавления фильтра и показывает ее.
   * @param {Event} evt
   */
  resizeForm.addEventListener('submit', function(evt) {
    evt.preventDefault();
    filterImage.src = currentResizer.exportImage().src;
    resizeForm.classList.add('invisible');
    filterForm.classList.remove('invisible');
  });

  /**
   * Сброс формы фильтра. Показывает форму кадрирования.
   * @param {Event} evt
   */
  filterForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  });

  /**
   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
   * записав сохраненный фильтр в cookie.
   * @param {Event} evt
   */
  filterForm.addEventListener('submit', function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    filterForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
    /**
     * Получаем значения выбранного фильтра.
     *
     *
     */
    var filters = filterForm['upload-filter'];
    for (var i = 0; i < filters.length; i++) {
      var filter = filters[i];
      if (filter.checked) {
        break;
      }
    }

    /**
     * Функция получения количество дней, прошедшее с  ближайшего дня рождения.
     *
     *
     */
    var expiresDate = function() {
      function diffDate(myBithday) {
        var total = Math.round( (today - myBithday) / (1000 * 60 * 60 * 24) );
        today.setDate(todayDate + total);
        return today.toUTCString();
      }
      var today = new Date();
      var todayYear = today.getFullYear();
      var myMonth = 4;
      var myDate = 21;
      var myBithday = new Date(todayYear, myMonth, myDate);
      var todayDate = today.getDate();
      var todayMonth = today.getMonth();
      if (todayMonth > myMonth || (todayMonth === myMonth && todayDate > myDate ) ) {
        return diffDate(myBithday);
      } else {
        myBithday.setFullYear(todayYear - 1);
        return diffDate(myBithday);
      }
    };

    /**
     * Сохраняем в cookies последний выбранный фильтр и
     * устанавливаем срок жизни cookie.
     *
     */
    document.cookie = 'filter=' + filter.value + ';expires=' + expiresDate();

    filterForm.submit();
  });

  /**
   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
   * выбранному значению в форме.
   */
  filterForm.addEventListener('change', function() {
    if (!filterMap) {
      // Ленивая инициализация. Объект не создается до тех пор, пока
      // не понадобится прочитать его в первый раз, а после этого запоминается
      // навсегда.
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia'
      };
    }


    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
      return item.checked;
    })[0].value;

    // Класс перезаписывается, а не обновляется через classList потому что нужно
    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
    // состояние или просто перезаписывать.
    filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
  });

  cleanupResizer();
  updateBackground();
})();
