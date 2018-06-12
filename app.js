// нужны клоны каждого слайда, а не только первого и последнего?????
/**
 * Конструктор слайдера (работоспособен в IE)
 * @param {string} CSSSliderName css имя слайдера
 * @param {integer} timeout задержка для анимации
 * @param {integer} initialSlideNumber номер стартового слайда
 * @param {boolean} animation вкл/выкл анимации
 */
function Slider(CSSSliderName, timeout, initialSlideNumber, animation){
    var sel = this;
    // установка значение по умолчанию
    if(timeout == undefined) timeout = 1000;
    if(initialSlideNumber == undefined) initialSlideNumber = 1;
    
    // инициализация полей объекта-слайдера 
    this.timeout = timeout;
    this.initialSlideNumber = initialSlideNumber;
    this.animation = !!animation;
    // слайдер в виде HTML элемента из HTML кода
    this.slider = document.querySelector(CSSSliderName);
    
    // принудительно отключить анимацию для IE
    if( /*@cc_on ! @*/ false ){
        // код, специфический для Internet Explorer версий ≤ 10
        this.animation = false;
    }    
    // инициализация слайдера
    this.init();

}
// библиотека методов и функция инициализации слайдера
Slider.prototype = {
    init: function(){
        // функция в конструкторе вызывается с контекстом this, поэтому можно использовать this, а не self
        // инициализация ленты слайдов this.tapeInit();
        this.tapeInit();
        // инициализация кнопок this.buttonInit();
        this.buttonInit();
        // инициализация навигационной панели this.navPanelInit();
        this.navPanelInit();
        // инициализация обработчиков событий управления кнопками и навигационной панелью this.eventListInit();
        this.eventListInit();

    },
    // инициализация ленты слайдов
    tapeInit: function(){
        // имя класса клонируемых слайдов
        this.cloneClassName = "slider__slides_clone";
        // общий класс для слайдов в ленте
        this.slidesClassName = "slider__slides";
        // лента слайдов в виде HTML элемента
        this.tape = this.slider.querySelector(".slider__tape");
        // исходное количество слайдов в ленте
        this.numOfSlides = this.tape.children.length;
        // имя класса контейнера ленты слайдов (рамка с overflow: hidden)
        this.tapeContainerClassName = "slider__container";
        // флаг установки анимации ленты
        this.animationIsSet = false;
        // реальный индекс текущего слайда (по совместительству номер слайда)
        // структура ленты слайдов: клон_последнего_слайда, первый_слайд,...,последний_слайд,клон_первого_слайда
        this.currentIndex = 1;
        // ---- инициализация ленты слайдов ----
        // клон первого слайда
        var cloneStartSlide = this.tape.children[0].cloneNode(true);
        // установка имени класса для клонов слайдов
        cloneStartSlide.className = cloneStartSlide.className + " " + this.cloneClassName;
        // клон последнего слайда
        var cloneEndSlide = this.tape.children[this.numOfSlides-1].cloneNode(true);
        // установка имени класса для клонов слайдов
        cloneEndSlide.className = cloneEndSlide.className + " " + this.cloneClassName;
        // добавление клона первого слайда в конец ленты
        this.tape.appendChild(cloneStartSlide);
        // добавление клона последнего слайда в начало ленты
        this.tape.insertBefore(cloneEndSlide, this.tape.children[0]);
        // установка ширины ленты
        this.tape.style.width = this.getTapeWidth() + 'px'; 
        
        // проверка на допустимость стартового номера слайда initialSlideNumber
        this.initialSlideNumber = (this.initialSlideNumber>0)&&(this.initialSlideNumber<=this.numOfSlides) ? this.initialSlideNumber : 1;
        //установка ленты на слайд с номером initialSlideNumber
        // currentIndex - реальный индекс текущего слайда (по совместительству номер слайда)
        // структура ленты слайдов: клон_последнего_слайда, первый_слайд,...,последний_слайд,клон_первого_слайда
        this.currentIndex = this.setTapeState(this.initialSlideNumber);
    },
    // инициализация кнопок
    buttonInit: function(){
        // кнопка влево в виде HTML элемента
        this.leftButton = this.slider.querySelector(".slider__nav-button_left");
        // кнопка вправо в виде HTML элемента
        this.rightButton = this.slider.querySelector(".slider__nav-button_right");
    },
    // инициализация навигационной панели
    navPanelInit: function(){
        // имя класса "индикатора" слайда
        this.navClassName = "slider__nav-item";
        // имя класса активного "индикатора" слайда
        this.activeClassName = "slider__nav-item_active";
        // навигационная панель
        this.navPanel = this.slider.querySelector(".slider__nav-panel");
        // "зачистка" навигационной панели (для IE коментарии - это тоже узлы)
        this.navPanel.innerHTML = "";
        // инициализация навигационной панели
        this.initNavBlock();
        // удалить класс активности slider__nav-item_active у пунктов навигационной панели
        this.deleteClassName(this.activeClassName);
        // установить активным пункт с номером initialSlideNumber (его индекс будет initialSlideNumber-1)
        this.setActiveItem(this.initialSlideNumber-1, this.activeClassName);
    },
    // инициализация обработчиков событий управления кнопками и навигационной панелью
    eventListInit: function(){
        // для передачи контекста вызова в анонимные callback функции обработчиков событий
        var self = this;
        // кнопка влево
        this.leftButton.addEventListener("click", function(event){
            // элемент-источник события
            var target = event.target;
            // если закончилась анимация
            if(!self.animationIsSet){
                // если анимация доступна, то включить её
                if(self.animation) self.setAnimation(self.timeout);
                self.currentIndex = self.moveRight();
                // определяем индекс индикатора слайда в навигационной панели:
                // ф-ции moveLeft/moveRight возвращают реальный индекс
                // слайда в ленте с учетом клонов первого и последнего слайда
                // индекс индикатора слайда не учитывает клонов слайдов
                // поэтому требуется пересчет индексов
                var itemIndex = self.currentIndex ? Math.abs((self.currentIndex - 1) % self.numOfSlides) : self.numOfSlides-1;
                // установка индикаторов текущего положения слайдов
                self.setActiveItem(itemIndex, self.activeClassName);
            }
            // если анимация отключена вообще
            if(!self.animation){
                // нормализуем положение ленты (если она остановилась на слайдах-клонах)
                self.normalizeTapeState();
            }
        });
        // кнопка вправо
        this.rightButton.addEventListener("click", function(event){
            // элемент-источник события
            var target = event.target;
            // если закончилась анимация 
            if(!self.animationIsSet){
                // если анимация доступна, то включить её
                if(self.animation) self.setAnimation(self.timeout);
                self.currentIndex = self.moveLeft();
                // определяем индекс индикатора слайда:
                // ф-ции moveLeft/moveRight возвращают реальный индекс
                // слайда в ленте с учетом клонов первого и последнего слайда
                // индекс индикатора слайда не учитывает клонов слайдов
                // поэтому требуется пересчет индексов
                var itemIndex = Math.abs((self.currentIndex - 1) % self.numOfSlides);
                // установка индикаторов текущего положения слайдов
                self.setActiveItem(itemIndex, self.activeClassName);
            }
            // если анимация отключена вообще
            if(!self.animation){
                // нормализум положение ленты
                self.normalizeTapeState();
            }
        });
        // событие окончания анимации
        this.slider.querySelector("." + this.tapeContainerClassName).addEventListener("transitionend", function(event){
            // элемент-источник события
            var target = event.target;
            // остановка всплытия события transitionend
            event.stopPropagation();
            // отключаем анимацию
            self.clearAnimation(target);
            // нормализум положение ленты
            self.normalizeTapeState();
        });
        // клик по пунктам навигационной панели
        this.navPanel.addEventListener("click",function(event){
            // элемент, на котором сработал click
            var target = event.target;
            // остановка всплытия события click
            event.stopPropagation();
            // если нет анимации
            if(!self.animationIsSet){
                // click произошел по индикатору или навигационной панели?
                if(!target.children.length){
                    // определяем номер "индикатора" слайда
                    // target.parentNode.children.length = количество "индикаторов" в навигационной панели
                    for(var i = 0; i < target.parentNode.children.length; i++){
                        if(target.parentNode.children[i] == target) break;
                    }
                    // если кликнутый индикатор не соответствует текущему слайду
                    // то можно включить и отработать анимацию
                    if(self.currentIndex != (i+1) && !self.animationIsSet){
                        // если анимация доступна, то включаем её
                        if(self.animation) self.setAnimation(self.timeout);
                    }
                    // установка ленты в нужное положение
                    self.currentIndex = self.setTapeState(i+1);
                    // если нет анимации, то надо провести нормализацию положения ленты "вручную"
                    if(!self.animation) self.normalizeTapeState();
                    // устанавливаем индикатор слайда в навигационной панели
                    self.setActiveItem(i, self.activeClassName);
                }
            }
        });
    },
    // ----- методы для работы с навигационной панелью -----
    /**
     * Определяет ширину отдельного "индикатора" слайда
     * @param {HTMLElement} item 
     */
    getItemNavWidth: function (item){
        var style = this.getStyle(item);
        return  this.convertValueToPx(style.width) + 
                this.convertValueToPx(style.paddingLeft) +
                this.convertValueToPx(style.paddingRight) +
                this.convertValueToPx(style.marginLeft) + 
                this.convertValueToPx(style.marginRight) + 
                this.convertValueToPx(style.borderLeftWidth) + 
                this.convertValueToPx(style.borderRightWidth);
    },
    /**
     * Инициализирует навигационную панель
     * (устанавливает активным индикатор первого слайда)
     * Для всех element.children: коментарии так же добавляются в коллекцию 
     * поэтому нужно предусмотреть их игнорирование или удалить их
     */
     initNavBlock: function (){
        // заполняе навигационную панель индикаторами
        // даже html коментарий воспринимается как узел и дает увеличение количества элементов в this.navPanel.children.length
        for(var i = 0; i < this.numOfSlides; i++){
            // добавить элемент <div> в блок навигационной панели
            this.navPanel.appendChild( document.createElement("div") );
            // добавить элементу имя класса
            this.navPanel.children[i].className = this.navClassName;
        }
        // ширина навигационной панели в px
        var w = this.getItemNavWidth(this.navPanel.children[0]) * this.numOfSlides;
        // установка ширины навигационной панели
        this.navPanel.style.width = w + 'px';
        return this.navPanel;
    },
    /**
     * Удаляет класс className у дочерних элементов блока navPanel
     * @param {string} className имя удаляемого класса
     */
    deleteClassName: function (className){
        var names = "";
        for(var i = 0; i < this.navPanel.children.length; i++){
            // текущие имена классов дочернего элемента
            names = this.navPanel.children[i].className;
            // удалить подстроку className из строки names
            names = names.replace((" " + className), "");
            // установить строку names в качестве имени класса navPanel.children[i]).className
            this.navPanel.children[i].className = names;
        }
    },
     /**
     * Устанавливает класс "активный" у "индикатора" класса
     * @param {HTMLElement} navPanel навигационная панель
     * @param {integer} numItem индекс "индикатора" слайда
     * @param {string} activeClassName имя класса активного "индикатора" слайда
     */
    setActiveItem: function (numItem, activeClassName){
        // установка значения по умолчанию
        if(activeClassName == undefined) activeClassName = "slider__nav-item_active";
        // общее количество индикаторов класса
        var totalItem = this.navPanel.children.length;
        // защита от неверных исходных данных
        numItem = Math.abs(numItem % totalItem);
        // удалить класс активности у всех индикаторов
        this.deleteClassName(this.activeClassName);
        // Установить класс activeClassName у нового "индикатора"
        this.navPanel.children[numItem].className = this.navPanel.children[numItem].className + " " + this.activeClassName;
    },
    // ----------- служебные методы -----------
    // принудительный пересчет стилей
    recountStyle: function (){
        this.getStyle(document.body);
    },
    // преобразует строку value в корректное значение в px
    // "" auto inherit % em pt ex ch rem vw vh vmin vmax in cm mm pc ==> возвращает 0
    // px ==> возвращает значение в px
    convertValueToPx: function(value){
        // единица измерения
        var unit = value.replace( /([+-]?)([0-9]*)([.]?)([0-9]*)/,"");
        var result = 0;
        switch(unit){
            case "": break;
            case "auto": break;
            case "inherit": break;
            case "%": break;
            case "em": break;
            case "pt": break;
            case "ex": break;
            case "ch": break;
            case "rem": break;
            case "vh": break;
            case "vmin": break;
            case "vmax": break;
            case "in": break;
            case "cm": break;
            case "mm": break;
            case "pc": break;
            case "px": result = parseFloat(value);
        }

        return result;
    },
    // ------------ get методы ------------
    // Возвращает ширину ленты в px
    getTapeWidth: function(){
        // ширина ленты
        var w = 0;
        for(var i = 0; i<this.tape.children.length; i++){
            // сложение ширины всех слайдов
            w += this.getSlideTotalWidth(this.tape.children[i]);
        }
        return w;
    },
    // Возвращает текущее значение стиля left у ленты слайдов
    getTapeLeft: function(){
        return this.convertValueToPx(this.getStyle(this.tape).left);
    },
    // возвращает полную ширину слайда slide
    getSlideTotalWidth: function(slide){
        return  (this.getSlideMarginLeft(slide) +
                this.getSlideMarginRight(slide) +
                this.getSlidePaddingLeft(slide) +
                this.getSlidePaddingRight(slide) +
                this.getSlideWidth(slide) +
                this.getSlideBorderLeft(slide) +
                this.getSlideBorderRight(slide));
    },
    // возвращает значение margin-left слайда slide
    getSlideMarginLeft: function(slide){
        return this.convertValueToPx(this.getStyle(slide).marginLeft);
    },
    // возвращает значение margin-right слайда slide
    getSlideMarginRight: function(slide){
        return this.convertValueToPx(this.getStyle(slide).marginRight);
    },
    // возвращает padding-left слайда slide
    getSlidePaddingLeft: function(slide){
        return this.convertValueToPx(this.getStyle(slide).paddingLeft);
    },
    // возвращает padding-rught слайда slide
    getSlidePaddingRight: function(slide){
        return this.convertValueToPx(this.getStyle(slide).paddingRight);
    },
    // возвращает значение width слайда slide
    getSlideWidth: function(slide){
        return this.convertValueToPx(this.getStyle(slide).width);
    },
    // возвращает величину borger-left слайда slide
    getSlideBorderLeft: function(slide){
        return this.convertValueToPx(this.getStyle(slide).borderLeftWidth);
    },
    // возвращает величину borger-right слайда slide
    getSlideBorderRight: function(slide){
        return this.convertValueToPx(this.getStyle(slide).borderRightWidth);
    },
    /**
     * Кроссбраузерный вариант window.getComputedStyle()
     * @param {HTMLElement} element HTML элемент
     * @param {string} pseudo псевдоэлемент
     * @return {CSSStyleDeclaration} возвращает вычесленные стили элемента
     */
    getStyle: function(element, pseudo){
        // инициализация значения по умолчанию
        if(pseudo == undefined) pseudo="";
        return (window.getComputedStyle ? getComputedStyle(element, pseudo) : element.currentStyle);
    },
    // ------------ set методы ------------
    /**
     * Устанавлявает ленту слайдов в нужное положение
     * @param {integer} index реальный индекс слайда, который будет отображаться 
     * @return {integer} реальный индекс текущего видимого слайда
     */
    setTapeState: function(index){
        var left = 0;
        // рассчет смещения
        for(var i = 0; i < index; i++){
            left += this.getSlideTotalWidth(this.tape.children[i]);
        }
        // установка смещения
        this.tape.style.left = -left + 'px';
        // принудительный пересчет стилей
        this.recountStyle();
        return index;
    },
    // устанавливает ленту в нормальное положение, если в процессе перелистывания
    // видимыми стали клонированные слайды
    normalizeTapeState: function(){
        if(this.currentIndex==0){
            // индекс последнего элемента = length - 1
            // индекс последнего слайда = индекс последнего элемента - 1
            // т.к. в начале и в конце ленты стоят "служебные" слайды
            // установка на последний слайд, его индекс численно равен количеству реальных слайдов
            this.currentIndex = this.setTapeState(this.numOfSlides);
        }
        // если лента установлена в крайнее левое положение (установлена на клон первого слайда)
        if(this.currentIndex==(this.tape.children.length-1)){
            // установка на первый слайд
            this.currentIndex = this.setTapeState(1);
        }
    },
    /**
     * Установка свойства анимации у ленты слайдов
     * @param {int} timeout время выполнения анимации в мс
     */
    setAnimation: function (timeout){
        if(timeout == undefined) timeout = 1000;
        // Установка флага анимации
        this.animationIsSet = true;
        // установка анимации
        this.tape.style.transitionDuration = timeout + 'ms';
        // принудительный пересчет стилей
        this.recountStyle();
    },
    // Отключает анимацию
    clearAnimation: function (){
        this.tape.style.transitionDuration = "";
        // Установка флага анимации
        this.animationIsSet = false;
        // принудительный пересчет стилей
        this.recountStyle();
    },
    /**
     * Смещает ленту на один слайд влево
     * @return {integer} индекс нового текущего слайда
     */
    moveLeft: function(){
        // текущее значение left ленты слайдов
        var absLeft = Math.abs(this.getTapeLeft());
        // новое значение left ленты слайдов
        var newLeft = 0;
        // пребираем все слайды и суммируем left
        var i = 0;
        for(i = 0; (newLeft <= absLeft) && (i<(this.tape.children.length-1)); i++){
            // ширина i-го слайда
            var w = this.getSlideTotalWidth(this.tape.children[i]);
            newLeft += w;
        }
        this.tape.style.left = -newLeft + 'px';
        // принудительный пересчет стилей
        this.recountStyle();
        return i;
    },
    /**
     * Смещает ленту на один слайд вправо
     * @return {integer} индекс нового текущего видимого слайда
     */
    moveRight: function(){
        // текущее значение left
        var absLeft = Math.abs(this.getTapeLeft());
        // определяем индекс текущего первого видимого слайда
        var newLeft = 0;
        for(var i = 0; (newLeft < absLeft) && (i<this.tape.children.length); i++ ){
            // ширина i-го слайда
            var w = this.getSlideTotalWidth(this.tape.children[i]);
            newLeft += w;
        }
        // новое смещение ленты
        newLeft = absLeft - w;
        // установка нового смещения
        this.tape.style.left = -newLeft + 'px';
        // принудительный пересчет стилей
        this.recountStyle();
        // если i == 0, то предыдущий индекс расчитывать не нужно
        return (--i)>0 ? i: 0;
    }
}