'use strict';

/**
 * @constructor
 * @param {string} image
 */
var Resizer = function(image) {
  // Изображение, с которым будет вестись работа.
  this._image = new Image();
  this._image.src = image;

  // Холст.
  this._container = document.createElement('canvas');
  this._ctx = this._container.getContext('2d');

  // Создаем холст только после загрузки изображения.
  this._image.onload = function() {
    // Размер холста равен размеру загруженного изображения. Это нужно
    // для удобства работы с координатами.
    this._container.width = this._image.naturalWidth;
    this._container.height = this._image.naturalHeight;

    /**
     * Предлагаемый размер кадра в виде коэффициента относительно меньшей
     * стороны изображения.
     * @const
     * @type {number}
     */
    var INITIAL_SIDE_RATIO = 0.75;
    // Размер меньшей стороны изображения.
    var side = Math.min(
      this._container.width * INITIAL_SIDE_RATIO,
      this._container.height * INITIAL_SIDE_RATIO);

    // Изначально предлагаемое кадрирование — часть по центру с размером в 3/4
    // от размера меньшей стороны.
    this._resizeConstraint = new Square(
      this._container.width / 2 - side / 2,
      this._container.height / 2 - side / 2,
      side);
    window.dispatchEvent(new CustomEvent('resizerchange'));
    // Отрисовка изначального состояния канваса.
    this.redraw();
  }.bind(this);

  // Фиксирование контекста обработчиков.
  this._onDragStart = this._onDragStart.bind(this);
  this._onDragEnd = this._onDragEnd.bind(this);
  this._onDrag = this._onDrag.bind(this);
};

Resizer.prototype = {
  /**
   * Родительский элемент канваса.
   * @type {Element}
   * @private
   */
  _element: null,

  /**
   * Положение курсора в момент перетаскивания. От положения курсора
   * рассчитывается смещение на которое нужно переместить изображение
   * за каждую итерацию перетаскивания.
   * @type {Coordinate}
   * @private
   */
  _cursorPosition: null,

  /**
   * Объект, хранящий итоговое кадрирование: сторона квадрата и смещение
   * от верхнего левого угла исходного изображения.
   * @type {Square}
   * @private
   */
  _resizeConstraint: null,

  /**
   * Отрисовка канваса.
   */
  redraw: function() {
    // Очистка изображения.
    this._ctx.clearRect(0, 0, this._container.width, this._container.height);

    // Параметры линии.
    // NB! Такие параметры сохраняются на время всего процесса отрисовки
    // canvas'a поэтому важно вовремя поменять их, если нужно начать отрисовку
    // чего-либо с другой обводкой.

    // Толщина линии.
    this._ctx.lineWidth = 6;
    // Цвет обводки.
    this._ctx.strokeStyle = '#ffe753';
    // Размер штрихов. Первый элемент массива задает длину штриха, второй
    // расстояние между соседними штрихами.
    // this._ctx.setLineDash([15, 10]);
    // Смещение первого штриха от начала линии.
    // this._ctx.lineDashOffset = 7;

    // Цвет заливки
    this._ctx.fillStyle = 'rgba(0, 0, 0, .8)';

    // Стиль шрифта
    this._ctx.font = '24px sans-serif';
    // Горизонтальное выравнивание текста
    this._ctx.textAlign = 'center';
    // Выравнивает текста по вертикали
    this._ctx.textBaseline = 'bottom';

    // Сохранение состояния канваса.
    // Подробней см. строку 132.
    this._ctx.save();

    // Установка начальной точки системы координат в центр холста.
    this._ctx.translate(this._container.width / 2, this._container.height / 2);

    var displX = -(this._resizeConstraint.x + this._resizeConstraint.side / 2);
    var displY = -(this._resizeConstraint.y + this._resizeConstraint.side / 2);
    // Отрисовка изображения на холсте. Параметры задают изображение, которое
    // нужно отрисовать и координаты его верхнего левого угла.
    // Координаты задаются от центра холста.
    this._ctx.drawImage(this._image, displX, displY);

    // Отрисовка чёрного слоя с прозрачностью 80% под размер кадрируемого изображения.
    this._ctx.beginPath();
    this._ctx.moveTo(displX, displY);
    this._ctx.lineTo(displX, this._container.height);
    this._ctx.lineTo(this._container.width, this._container.height);
    this._ctx.lineTo(this._container.width, displY);
    this._ctx.lineTo(displX, displY);
    this._ctx.moveTo(
      (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2, (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2
    );
    this._ctx.lineTo(
      (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2,
      this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2
    );
    this._ctx.lineTo(
      this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2,
      this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2
    );
    this._ctx.lineTo(
      this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2, (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2
    );
    this._ctx.lineTo(
      (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2, (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2
    );
    this._ctx.closePath();
    this._ctx.fill('evenodd');

    // Начальные и конечные координаты для рамки.
    var frameStartX = (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2;
    var frameStartY = (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2;
    var frameEndX = this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2;
    var frameEndY = this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2;


    // // Отрисовка  точками прямоугольника, обозначающего область изображения после
    // // кадрирования.
    //
    // // Радиус точки.
    // var arcRadius = 3;
    // // Шаг между точками.
    // var arcStep = 10;
    //
    // // Рисуем линию из точек по X
    // function drawBorderX(ctx, frameStartX, frameStartY, frameEndX) {
    //   drawArc(ctx, frameStartX, frameStartY, arcRadius);
    //   if (frameStartX  < frameEndX  ) {
    //     return drawBorderX(ctx, frameStartX + arcStep, frameStartY, frameEndX);
    //   } else {
    //     return;
    //   }
    // }
    // // Рисуем линию из точек по Y
    // function drawBorderY(ctx, frameStartX, frameStartY, frameEndY) {
    //   drawArc(ctx, frameStartX, frameStartY, arcRadius);
    //   if (frameStartY  < frameEndY ) {
    //     return drawBorderY(ctx, frameStartX, frameStartY + arcStep, frameEndY);
    //   } else {
    //     return;
    //   }
    // }
    // // Рисуем точку
    // var drawArc = function(ctx, frameStartX, frameStartY, arcRadius) {
    //   ctx.beginPath();
    //   ctx.arc(frameStartX, frameStartY, arcRadius, 0, Math.PI * 2, true);
    //   ctx.fill();
    //   ctx.closePath();
    // };
    //
    // // Цвет заливки рамки с точками
    // this._ctx.fillStyle = '#ffe753';
    // // Рисуем рамку.
    // drawBorderX(this._ctx, frameStartX, frameStartY, frameEndX);
    // drawBorderX(this._ctx, frameStartX, frameEndY, frameEndX);
    // drawBorderY(this._ctx, frameStartX, frameStartY, frameEndY);
    // drawBorderY(this._ctx, frameEndX, frameStartY, frameEndY);

    // Отрисовка  зигзагами прямоугольника, обозначающего область изображения после
    // кадрирования.

    // Рисуем линию зигзагов по X
    var lineWidthZig = 12;
    var lineHeigthZig = 10;

    // Рисуем линию из зигзагов по Х
    function drawZigX(ctx, startX, startY, endX, widthZig, heigthZig) {
      ctx.beginPath();
      ctx.moveTo(startX + widthZig / 2, startY);
      for (var i = 0; i < Math.ceil(endX * 2 / widthZig); i++) {
        if (i % 2 === 0) {
          ctx.lineTo(startX + widthZig * i, startY + heigthZig / 2);
        } else {
          ctx.lineTo(startX + widthZig * i, startY - heigthZig / 2);
        }
      }
      ctx.lineTo(startX + widthZig * i, startY + heigthZig / 2);
      ctx.stroke();
      ctx.closePath();
    }
    // Рисуем линию из зигзагов по Y
    function drawZigY(ctx, startX, startY, endX, widthZig, heigthZig) {
      ctx.beginPath();
      ctx.moveTo(startX, startY + widthZig / 2);
      for (var i = 0; i < Math.ceil(endX * 2 / widthZig); i++) {
        if (i % 2 === 0) {
          ctx.lineTo(startX - heigthZig / 2, startY + widthZig * i);
        } else {
          ctx.lineTo(startX + heigthZig / 2, startY + widthZig * i);
        }
      }
      ctx.lineTo(startX - heigthZig / 2, startY + widthZig * i);
      ctx.stroke();
      ctx.closePath();
    }
    // Рисуем рамку из зигзагов
    drawZigX(this._ctx, frameStartX, frameStartY, frameEndX, lineWidthZig, lineHeigthZig);
    drawZigY(this._ctx, frameStartX, frameStartY, frameEndX, lineWidthZig, -lineHeigthZig);
    drawZigX(this._ctx, frameStartX, frameEndY, frameEndX, lineWidthZig, -lineHeigthZig);
    drawZigY(this._ctx, frameEndX, frameStartY, frameEndX, lineWidthZig, lineHeigthZig);

    // Отрисовка прямоугольника, обозначающего область изображения после
    // кадрирования. Координаты задаются от центра.
    // this._ctx.strokeRect(
    //     (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2,
    //     (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2,
    //     this._resizeConstraint.side - this._ctx.lineWidth / 2,
    //     this._resizeConstraint.side - this._ctx.lineWidth / 2);

    // Цвет заливки текста
    this._ctx.fillStyle = '#fff';

    // Отрисовка размера кадрируемого изображения.
    this._ctx.fillText(
      this._image.naturalWidth + ' ' + '+' + ' ' + this._image.naturalHeight,
      0, (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2);

    // Восстановление состояния канваса, которое было до вызова ctx.save
    // и последующего изменения системы координат. Нужно для того, чтобы
    // следующий кадр рисовался с привычной системой координат, где точка
    // 0 0 находится в левом верхнем углу холста, в противном случае
    // некорректно сработает даже очистка холста или нужно будет использовать
    // сложные рассчеты для координат прямоугольника, который нужно очистить.
    this._ctx.restore();
  },

  /**
   * Включение режима перемещения. Запоминается текущее положение курсора,
   * устанавливается флаг, разрешающий перемещение и добавляются обработчики,
   * позволяющие перерисовывать изображение по мере перетаскивания.
   * @param {number} x
   * @param {number} y
   * @private
   */
  _enterDragMode: function(x, y) {
    this._cursorPosition = new Coordinate(x, y);
    document.body.addEventListener('mousemove', this._onDrag);
    document.body.addEventListener('mouseup', this._onDragEnd);
  },

  /**
   * Выключение режима перемещения.
   * @private
   */
  _exitDragMode: function() {
    this._cursorPosition = null;
    document.body.removeEventListener('mousemove', this._onDrag);
    document.body.removeEventListener('mouseup', this._onDragEnd);
  },

  /**
   * Перемещение изображения относительно кадра.
   * @param {number} x
   * @param {number} y
   * @private
   */
  updatePosition: function(x, y) {
    this.moveConstraint(
      this._cursorPosition.x - x,
      this._cursorPosition.y - y);
    this._cursorPosition = new Coordinate(x, y);
  },

  /**
   * @param {MouseEvent} evt
   * @private
   */
  _onDragStart: function(evt) {
    this._enterDragMode(evt.clientX, evt.clientY);
  },

  /**
   * Обработчик окончания перетаскивания.
   * @private
   */
  _onDragEnd: function() {
    this._exitDragMode();
  },

  /**
   * Обработчик события перетаскивания.
   * @param {MouseEvent} evt
   * @private
   */
  _onDrag: function(evt) {
    this.updatePosition(evt.clientX, evt.clientY);
  },

  /**
   * Добавление элемента в DOM.
   * @param {Element} element
   */
  setElement: function(element) {
    if (this._element === element) {
      return;
    }

    this._element = element;
    this._element.insertBefore(this._container, this._element.firstChild);
    // Обработчики начала и конца перетаскивания.
    this._container.addEventListener('mousedown', this._onDragStart);
  },

  /**
   * Возвращает кадрирование элемента.
   * @return {Square}
   */
  getConstraint: function() {
    return this._resizeConstraint;
  },

  /**
   * Смещает кадрирование на значение указанное в параметрах.
   * @param {number} deltaX
   * @param {number} deltaY
   * @param {number} deltaSide
   */
  moveConstraint: function(deltaX, deltaY, deltaSide) {
    this.setConstraint(
      this._resizeConstraint.x + (deltaX || 0),
      this._resizeConstraint.y + (deltaY || 0),
      this._resizeConstraint.side + (deltaSide || 0));
  },

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} side
   */
  setConstraint: function(x, y, side) {
    if (typeof x !== 'undefined') {
      this._resizeConstraint.x = x;
    }

    if (typeof y !== 'undefined') {
      this._resizeConstraint.y = y;
    }

    if (typeof side !== 'undefined') {
      this._resizeConstraint.side = side;
    }

    requestAnimationFrame(function() {
      this.redraw();
      window.dispatchEvent(new CustomEvent('resizerchange'));
    }.bind(this));
  },

  /**
   * Удаление. Убирает контейнер из родительского элемента, убирает
   * все обработчики событий и убирает ссылки.
   */
  remove: function() {
    this._element.removeChild(this._container);

    this._container.removeEventListener('mousedown', this._onDragStart);
    this._container = null;
  },

  /**
   * Экспорт обрезанного изображения как HTMLImageElement и исходником
   * картинки в src в формате dataURL.
   * @return {Image}
   */
  exportImage: function() {
    // Создаем Image, с размерами, указанными при кадрировании.
    var imageToExport = new Image();

    // Создается новый canvas, по размерам совпадающий с кадрированным
    // изображением, в него добавляется изображение взятое из канваса
    // с измененными координатами и сохраняется в dataURL, с помощью метода
    // toDataURL. Полученный исходный код, записывается в src у ранее
    // созданного изображения.
    var temporaryCanvas = document.createElement('canvas');
    var temporaryCtx = temporaryCanvas.getContext('2d');
    temporaryCanvas.width = this._resizeConstraint.side;
    temporaryCanvas.height = this._resizeConstraint.side;
    temporaryCtx.drawImage(this._image, -this._resizeConstraint.x, -this._resizeConstraint.y);
    imageToExport.src = temporaryCanvas.toDataURL('image/png');

    return imageToExport;
  }
};

/**
 * Вспомогательный тип, описывающий квадрат.
 * @constructor
 * @param {number} x
 * @param {number} y
 * @param {number} side
 * @private
 */
var Square = function(x, y, side) {
  this.x = x;
  this.y = y;
  this.side = side;
};

/**
 * Вспомогательный тип, описывающий координату.
 * @constructor
 * @param {number} x
 * @param {number} y
 * @private
 */
var Coordinate = function(x, y) {
  this.x = x;
  this.y = y;
};

module.exports = Resizer;
