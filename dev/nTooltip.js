/* version 2.0.0 */

(function ($) {
    var globals = {
        count_elem: 0,
        collection_elems: [],
        display_elem: false,
        current_self_elem: undefined,
        positions_old: undefined,
        paramsElem: function(options) {
            return this, $.extend(true, {
                globals: this,
                self: undefined,
                align: 'center',
                placement: undefined,
                elem_global: 'body',
                top: 0,
                left: 0,
                time: 500,
                resize: true,
                start_elem: true,
                stop_elem: true,
                cursor: {
                    event: 'hover',
                    is_over: true,
                },
                elem: {
                    eventStart: function(self, self_elem, options){},
                    eventStop: function(self, self_elem, options){},
                    name: 'nTooltip',
                    width: 200,
                    html: undefined,
                    html_before: '',
                    html_after: '',
                    style: {
                        'opacity': '0',
                        'z-index' : '9999',
                        'position' : 'absolute',
                        'width' : '100%',
                    }
                },
                before: {
                    eventStart: function(self, self_elem, options){},
                    eventStop: function(self, self_elem, options){},
                    display: true,
                    width: 15,
                    height: 15,
                    html: '',
                    style: {
                        'position' : 'absolute',
                    }
                },
                animation: {
                    eventStart: function(self, self_elem, options){},
                    eventStop: function(self, self_elem, options){},
                    active: true,
                    moving: true,
                    scale: true,
                    scale_start: true,
                    scale_end: true,
                    time_scale: 650,
                    to_1_css: { 'opacity': '0' },
                    to_2_css: { 'opacity': '1' },
                    end_1_css: { 'opacity': '1' },
                    end_2_css: { 'opacity': '0' },
                },
            }, options);
        },
        setElem: function(elem, index = undefined) {
            if (index === undefined) {
                this.collection_elems[this.count_elem] = {
                    elem: elem,
                    index: this.count_elem,
                };
                this.count_elem++;
            } else {
                this.collection_elems[index-1].elem = elem;
            }

            this.display_elem = true;

            return index === undefined ? this.count_elem : index;
        },
        deleteElem: function(index) {
            if (this.collection_elems[index-1] !== undefined) {
                if (this.collection_elems[index-1].elem !== undefined) {
                    this.collection_elems[index-1].elem = undefined;
                }
            }

            this.display_elem = false;
        }
    };

    $.fn.nTooltip = function (options) {

        /* нажатия анимации */
        $(document).on('click', function (e) {
            var self = $('body').data().nTooltip_data;

            if (self != undefined && globals.display_elem) {
                if(!self.options.cursor.is_over) {
                    if (!$(self.self).is(e.target)){
                        self.options.elem.eventStop(self, self.self_elem, self.options);

                        if (self.options.stop_elem) {
                            self.stopElem();
                        }
                    }
                } else {
                    if (!$(self.self).is(e.target)
                        && !$(self.self_elem).is($(e.target).parent())
                        && !$(e.target).closest('div').length) {
                        self.options.elem.eventStop(self, self.self_elem, self.options);

                        if (self.options.stop_elem) {
                            self.stopElem();
                        }
                    }
                }
            }
        });

        /* изменение элемент при изменеии размера или положение экрана */
        $(window).resize(function() {
            var self = $('body').data().nTooltip_data;

            if (self != undefined) {
                self.resizeElem();
            }
        });

        /* запуск */
        return this.each(function() {
            init(globals.paramsElem($.extend({ self: this }, options)));
        });

        function init(options) {
            return this, {
                self: options.self,
                options: options,
                self_elem: undefined,
                self_elem_before: undefined,
                elem_index: undefined,
                elem_id: options.elem.name,
                elem_id_next: options.elem.name,
                elem_class: options.elem.name,
                elem_class_inner: options.elem.name + '-inner',
                elem_class_before: options.elem.name + '_before',
                elem_class_inner_line: options.elem.name + '-inner-line',
                elem_class_transition_block: options.elem.name + '-transition-block',
                class_name_placement: options.placement,
                class_name_align: options.align,
                class_do_start_animate: 'do_to_animate',
                class_start_animate: 'to_animate',
                class_stop_animate: 'end_animate',
                fixed_placement: 'top',

                /* Главная инициализации плагина */
                init: function(){
                    var self = this;

                    switch (this.options.cursor.event) {
                        case 'hover' :
                            var cursor_elem = false;
                            var cursor_self = false;

                            $(this.self).stop(true, true).hover(
                                function(){
                                    $(self.self_elem).stop(true, true);
                                    cursor_self = true;

                                    if (!self.options.cursor.is_over) {
                                        setTimeout(function(){
                                            self.options.elem.eventStart(self, self.self_elem, self.options);
                                        },1);

                                        if (self.options.start_elem) {
                                            self.startElem();
                                        }
                                    } else {
                                        if (!cursor_elem) {
                                            setTimeout(function(){
                                                self.options.elem.eventStart(self, self.self_elem, self.options);
                                            }, 1);

                                            if (self.options.start_elem) {
                                                self.startElem();
                                            }
                                        } else {
                                            cursor_elem = false;
                                        }

                                        $(self.self_elem).hover(
                                            function(){
                                                cursor_elem = true;
                                                cursor_self = false;
                                                self.options.before.eventStart(self, self.self_elem, self.options);
                                            },
                                            function(){
                                                setTimeout(function(){
                                                    cursor_elem = false;

                                                    if(cursor_self == false) {
                                                        self.options.before.eventStop(self, self.self_elem, self.options);

                                                        if (self.options.stop_elem) {
                                                            self.stopElem();
                                                        }
                                                    }
                                                }, 1);
                                            });
                                    }
                                },
                                function(){
                                    if (!self.options.cursor.is_over) {
                                        self.options.elem.eventStop(self, self.self_elem, self.options);

                                        if (self.options.stop_elem) {
                                            self.stopElem();
                                        }
                                    } else {
                                        setTimeout(function(){
                                            if(cursor_elem == false) {
                                                cursor_self = false;
                                                self.options.elem.eventStop(self, self.self_elem, self.options);

                                                if (self.options.stop_elem) {
                                                    self.stopElem();
                                                }
                                            }
                                        }, 1);
                                    }
                                });
                            break;
                        case 'click':
                            $(this.self).on('click', function(e){
                                $(self.self_elem).stop(true, true);

                                globals.collection_elems.forEach(function(elem){
                                    $(elem.elem).stop(true, true)
                                        .animate(self.options.animation.end_css, self.options.time, function(){
                                        $(this).remove();
                                    });
                                });

                                if (!self.options.cursor.is_over) {
                                    setTimeout(function(){
                                        self.options.elem.eventStart(self, self.self_elem, self.options);
                                    },1);

                                    if (self.options.start_elem) {
                                        self.startElem();
                                    }
                                } else {
                                    var is_over = false;

                                    if ($(self.self_elem).is(globals.current_self_elem) && globals.display_elem) {
                                        is_over = true;
                                    }

                                    if (!is_over) {
                                        setTimeout(function(){
                                            self.options.elem.eventStart(self, self.self_elem, self.options);
                                        },1);

                                        if (self.options.start_elem) {
                                            self.startElem();
                                        }
                                    }
                                }
                            });
                            break;
                    }

                    return this, this.setDataForElem();
                },

                /* появляется элемент */
                startElem: function(){
                    $('body').data('nTooltip_data', this);

                    var self = this;
                    var position = this.doDeleteElem().setMediaForElem().createElem().positionElem();

                    $(this.self_elem).stop(true, true);

                    var style_elem = this.options.animation.to_2_css;

                    if (this.options.animation.moving && globals.positions_old != undefined) {
                        $(this.self_elem).css({ 'left' : globals.positions_old.elem_left,  'top' : globals.positions_old.elem_top })
                            .css(this.options.animation.to_1_css);
                        $(this.self_elem_before).css({ 'left' : position.elem_before_left, 'top' : position.elem_before_top });

                        style_elem = $.extend(true, style_elem, {
                            'left' : position.elem_left,
                            'top' : position.elem_top,
                        });

                        globals.positions_old = position;
                    } else {
                        $(this.self_elem).css({ 'left' : position.elem_left,  'top' : position.elem_top });
                        $(this.self_elem_before).css({ 'left' : position.elem_before_left, 'top' : position.elem_before_top });

                        globals.positions_old = position;
                    }

                    if (this.options.animation.active) {
                        $(this.self_elem)
                            .css(this.options.animation.to_1_css)
                            .css({'pointer-events' : 'none'})
                            .addClass(self.class_do_start_animate)
                            .animate(style_elem, self.options.time, function (){
                                $(this).removeClass(self.class_do_start_animate).addClass(self.class_start_animate);
                                if (!self.options.animation.scale) {
                                    $(this).css({'pointer-events': 'auto'});
                                }
                            });
                    } else {
                        $(this.self_elem).css(style_elem);
                    }

                    if(this.options.animation.scale && this.options.animation.active) {
                        var time_scale = self.options.time;

                        if (this.options.animation.time_scale) {
                            time_scale = this.options.animation.time_scale;
                        }

                        if (this.options.animation.scale_start) {
                            $(this.self_elem).animate({  now: '+=' + 0.1 }, {
                                duration: time_scale,
                                queue: false,
                                step: function(now) {
                                    var scale = now / 0.1;

                                    $(this).css({
                                        '-webkit-transform':'scale(' + scale + ')',
                                        '-moz-transform':'scale(' + scale + ')',
                                        '-o-transform':'scale(' + scale + ')',
                                        'transform':'scale(' + scale + ')',
                                    });
                                },
                                complete : function(){
                                    $(this).css({
                                        'pointer-events' : 'auto'
                                    });
                                }
                            });
                        }
                    }

                    this.options.animation.eventStart(this, this.self_elem, this.options);

                    return this;
                },

                /* изчизает элемент */
                stopElem: function(){
                    var self = this;

                    $(this.self_elem).stop(true, true);

                    if (this.options.animation.active) {
                        $(this.self_elem).removeClass(this.class_start_animate).addClass(this.class_stop_animate)
                            .css(this.options.animation.end_1_css)
                            .css({'pointer-events' : 'none'})
                            .animate(this.options.animation.end_2_css, {
                                duration: self.options.time,
                                queue: false,
                            }, function(){
                                if (!self.options.animation.scale) {
                                    $(this).css({'pointer-events' : 'auto'});
                                    self.deleteElem();
                                }
                            });
                    } else {
                        self.deleteElem();
                    }

                    if (this.options.animation.scale && this.options.animation.active) {
                        var time_scale = self.options.time;

                        if (this.options.animation.time_scale) {
                            time_scale = this.options.animation.time_scale;
                        }

                        if (this.options.animation.scale_end) {
                            $(this.self_elem).animate({  now: '+=' + 0.1 }, {
                                duration: time_scale,
                                //queue: false,
                                step: function(now) {
                                    var scale = 1 - ((now / 0.1) - 1);

                                    if (scale > 1) {
                                        scale = scale - parseInt(scale);
                                    }

                                    $(this).css({
                                        '-webkit-transform':'scale(' + scale + ')',
                                        '-moz-transform':'scale(' + scale + ')',
                                        '-o-transform':'scale(' + scale + ')',
                                        'transform':'scale(' + scale + ')',
                                    });
                                },
                                complete : function(){
                                    $(this).css({'pointer-events' : 'auto'});
                                    self.deleteElem();
                                }
                            });
                        }
                    }

                    this.options.animation.eventStop(this, this.self_elem, this.options);

                    return this;
                },

                /* обновляем элемент */
                resizeElem: function(){
                    if (this.options.resize) {
                        var position = this.positionElem();

                        $(this.self_elem).css({ 'left' : position.elem_left,  'top' : position.elem_top });
                        $(this.self_elem_before).css({ 'left' : position.elem_before_left, 'top' : position.elem_before_top });

                        globals.positions_old = position;
                    }

                    return this;
                },

                /* Добавляем данные внутри элемента */
                setDataForElem: function(){
                    return this, $(this.self).data({
                        'self' : this,
                        setOptions: function(options){
                            this.self.setOptions(options);
                        },
                        setAnimationFun: function(){

                        },
                        resizeElem: function(){
                            this.self.resizeElem();
                        }
                    }).data();

                    return this;
                },

                setOptions: function(options) {
                    $.extend(true, this.options, options);

                    return this;
                },

                /* Задаем начальные стили или координаты для элемента */
                setMediaForElem: function() {
                    this.options.placement = (this.options.placement != undefined) ? (
                        this.options.placement
                    ) : ($(this.self).attr('data-placement') != undefined ? (
                        $(this.self).attr('data-placement')
                    ) : this.fixed_placement);

                    this.options.elem.html = (this.options.elem.html == undefined) ? (
                        ($(this.self).attr('data-original-title') != undefined) ? (
                            $(this.self).attr('data-original-title')
                        ) : $(this.self).text()
                    ) : this.options.elem.html;

                    this.options.elem.style['max-width'] = this.options.elem.width;
                    this.options.before.style['width'] = this.options.before.width;
                    this.options.before.style['height'] = this.options.before.height;

                    return this;
                },

                /* удаляет предыдущие созданные элементы */
                doDeleteElem: function(){
                    $('#' + this.elem_id).map(function(){
                        var elem_in_html = this;
                        var bool_elem = true;

                        globals.collection_elems.forEach(function(elem){
                            if ($(elem.elem).is($(elem_in_html))) {
                                bool_elem = false;
                            }
                        });

                        if (bool_elem) {
                            $(this).remove();
                        }
                    });

                    var prev_elem = (this.elem_class + this.elem_index);

                    $('.' + prev_elem).each(function(){
                       $(this).remove();
                       $(this).stop(true, true);
                    });

                    return this;
                },

                /* Удаление созданного текущего элемента */
                deleteElem: function(status = '') {
                    globals.deleteElem(this.elem_index);
                    $(this.self_elem).remove();

                    return this;
                },

                /* Создание элемента, нового или обновленного */
                createElem: function(){
                    if (this.elem_index == undefined) {
                        this.elem_index = globals.setElem(this.self_elem);
                    } else {
                        this.elem_index = globals.setElem(this.self_elem, this.elem_index);
                    }

                    var block_transition = '';

                    if (this.options.cursor.is_over && this.options.before.display) {
                        block_transition = $('<div></div>').addClass(this.elem_class_transition_block)[0].outerHTML;
                    }

                    var elem_html = $([
                        '<div id="' + (this.elem_id) + '" class="'+ (this.elem_class + this.elem_index) + ' ' + this.elem_class + '">',
                        '<div class="'+ this.elem_class_inner + '">',
                        '<div class="'  + this.elem_class_inner_line + '">',
                        this.options.elem.html_before,
                        this.options.elem.html,
                        this.options.elem.html_after,
                        '</div>',
                        (this.options.before.display ?
                            '<div class="' + this.elem_class_before + '">' + (this.options.before.html) + '</div>' : '')
                        ,
                        '</div>',
                        block_transition,
                        '</div>'
                    ].join(''));

                    if (this.options.before.display) {
                        elem_html = elem_html
                            .css(this.options.elem.style)
                            .find('.' + this.elem_class_before)
                            .css(this.options.before.style)
                            .parents('#' + (this.elem_id))[0].outerHTML;
                    } else {
                        elem_html = elem_html
                            .css(this.options.elem.style)[0].outerHTML;
                    }

                    globals.current_self_elem = this.self_elem = $(this.options.elem_global)
                        .prepend(elem_html)
                        .find('#' + (this.elem_id));

                    this.self_elem_before = $(this.self_elem).find('.' + this.elem_class_before);

                    return this;
                },

                /* Узнаем позиции элемента после создания */
                positionElem: function() {
                    return this, {
                        _this: this,
                        self: this.self,
                        self_elem: this.self_elem,
                        self_elem_before: $(this.self_elem).find('.' + this.elem_class_before),
                        options: this.options,
                        nLeft: 0,
                        nTop: 0,
                        beforeLeft: 0,
                        beforeTop: 0,
                        global_elem_width: $(this.options.elem_global).outerWidth(true),
                        global_elem_height: $(this.options.elem_global).outerHeight(true),
                        self_offset_top: $(this.self).offset().top,
                        self_offset_left: $(this.self).offset().left,
                        self_width: $(this.self).outerWidth(true),
                        self_height: $(this.self).outerHeight(true),
                        elem_height: $(this.self_elem).outerHeight(true),
                        elem_width: $(this.self_elem).outerWidth(true),

                        get: function() {
                            this.options.class_name_align = this.options.align;

                            this.removeClassPositionElem();

                            switch (this.options.placement) {
                                case 'top':
                                    this.options.class_name_placement = 'top';

                                    if (this.positionElem(this.options.placement)) {
                                        this.beforeElem(this.options.placement);
                                    }
                                    break;
                                case 'right':
                                    this.options.class_name_placement = 'right';

                                    if (this.positionElem(this.options.placement)) {
                                        this.beforeElem(this.options.placement);
                                    }

                                    if (this.nLeft < 0) {
                                        this.options.class_name_placement = 'top';
                                        this.positionElem('top');
                                        this.beforeElem('top');
                                    }
                                    break;
                                case 'left':
                                    this.options.class_name_placement = 'left';

                                    if (this.positionElem(this.options.placement)) {
                                        this.beforeElem(this.options.placement);
                                    }

                                    if ((this.nLeft + this.elem_width) > $(this.options.elem_global).outerWidth(true)) {
                                        this.options.class_name_placement = 'top';
                                        this.positionElem('top');
                                        this.beforeElem('top');
                                    }
                                    break;
                                case 'bottom':
                                    this.options.class_name_placement = 'bottom';

                                    if (this.positionElem(this.options.placement)) {
                                        this.beforeElem(this.options.placement);
                                    }
                                    break;
                            }

                            this.addClassPositionElem();

                            if (this.options.cursor.is_over && this.options.before.display) {
                                switch (this.options.class_name_placement) {
                                    case 'top' :
                                        $('.' + this._this.elem_class_transition_block).css({
                                            'position': 'absolute',
                                            'width': '100%',
                                            'height': this.options.before.height,
                                            'left': 0,
                                            'top': '100%',
                                        });
                                        break;
                                    case 'bottom' :
                                        $('.' + this._this.elem_class_transition_block).css({
                                            'position': 'absolute',
                                            'width': '100%',
                                            'height': this.options.before.height,
                                            'left': 0,
                                            'bottom': '100%',
                                        });
                                        break;
                                    case 'left' :
                                        $('.' + this._this.elem_class_transition_block).css({
                                            'position': 'absolute',
                                            'width': this.options.before.width,
                                            'height': '100%',
                                            'left': '100%',
                                            'top': '0',
                                        });
                                        break;
                                    case 'right' :
                                        $('.' + this._this.elem_class_transition_block).css({
                                            'position': 'absolute',
                                            'width': this.options.before.width,
                                            'height': '100%',
                                            'right': '100%',
                                            'top': '0',
                                        });
                                        break;
                                }
                            }

                            return {
                                elem_top: this.nTop,
                                elem_left: this.nLeft,
                                elem_before_left: this.beforeLeft,
                                elem_before_top: this.beforeTop,
                            }
                        },
                        removeClassPositionElem: function(){
                            $(this.self_elem).removeClass(this.options.elem.name + '_placement_' + this.options.class_name_placement)
                                .removeClass(this.options.elem.name + '_align_' + this.options.class_name_align);
                        },
                        addClassPositionElem: function(){
                            $(this.self_elem).addClass(this.options.elem.name + '_placement_' + this.options.class_name_placement)
                                .addClass(this.options.elem.name + '_align_' + this.options.class_name_align);
                        },
                        positionElem: function(status) {
                            switch (status) {
                                case 'top':
                                    this.nTop = this.self_offset_top - this.elem_height;
                                    this.alignElem('left');
                                    this.nLeft = this.nLeft < 0 ? 0 : this.nLeft;
                                    this.nLeft = (this.nLeft + this.elem_width) > this.global_elem_width ? (this.global_elem_width - this.elem_width) : this.nLeft;
                                    break;
                                case 'right':
                                    this.nLeft = (this.self_offset_left + this.self_width);
                                    this.alignElem('top');

                                    if ((this.nLeft + this.elem_width) > $(this.options.elem_global).outerWidth(true)) {
                                        this.nLeft = (this.self_offset_left - this.elem_width) - (this.options.left);
                                        return this.beforeElem('rest_left');
                                    }
                                    break;
                                case 'left':
                                    this.nLeft = (this.self_offset_left - this.elem_width);
                                    this.alignElem('top');

                                    if (this.nLeft < 0) {
                                        this.nLeft = (this.self_offset_left + this.self_width) - (this.options.left);
                                        return this.beforeElem('rest_right');
                                    }
                                    break;
                                case 'bottom':
                                    this.nTop = (this.self_offset_top + this.self_height);
                                    this.alignElem('left');
                                    this.nLeft = this.nLeft < 0 ? 0 : this.nLeft;
                                    this.nLeft = (this.nLeft + this.elem_width) > this.global_elem_width ? (this.global_elem_width - this.elem_width) : this.nLeft;
                                    break;
                            }

                            return true;
                        },
                        alignElem: function(status) {
                            switch (status) {
                                case 'left':
                                    this.nLeft = this.self_offset_left - ((this.elem_width / 2) - (this.self_width / 2));

                                    switch (this.options.align) {
                                        case 'left' :
                                            this.nLeft = this.self_offset_left - (this.elem_width - this.self_width);
                                            break;
                                        case 'right' :
                                            this.nLeft = this.self_offset_left;
                                            break;
                                    }

                                    this.nTop = this.nTop + this.options.top;
                                    this.nLeft = this.nLeft + this.options.left;
                                    break;
                                case 'top':
                                    this.nTop = this.self_offset_top - ((this.elem_height / 2) - (this.self_height / 2));

                                    switch (this.options.align) {
                                        case 'top':
                                            this.nTop = (this.self_offset_top - this.elem_height) + this.self_height;
                                            break;
                                        case 'bottom':
                                            this.nTop = this.self_offset_top;
                                            break;
                                    }

                                    this.nTop = this.nTop + this.options.top;
                                    this.nLeft = this.nLeft + this.options.left;
                                    break;
                            }
                        },
                        beforeElem: function(status) {
                            var top = this.self_offset_top - this.nTop;
                            var left = this.self_offset_left - this.nLeft;
                            var flag = true;

                            if (this.options.before.display) {
                                switch (status) {
                                    case 'top':
                                        this.beforeLeft = (left + (this.self_width / 2)) - (this.self_elem_before.outerWidth(true) / 2);
                                        this.beforeTop = (top - this.self_elem_before.outerHeight(true)) + this.self_elem_before.outerHeight(true);
                                        this.nTop = this.nTop - this.self_elem_before.outerHeight(true);
                                        break;
                                    case 'left':
                                        this.beforeLeft = (left - this.self_elem_before.outerWidth(true)) + this.self_elem_before.outerWidth(true);
                                        this.beforeTop = (top + (this.self_height / 2)) - (this.self_elem_before.outerHeight(true) / 2);
                                        this.nLeft = this.nLeft - this.self_elem_before.outerWidth(true);
                                        break;
                                    case 'right':
                                        this.beforeLeft = (left + this.self_width) - this.self_elem_before.outerWidth(true);
                                        this.beforeTop = (top + (this.self_height / 2)) - (this.self_elem_before.outerHeight(true) / 2);
                                        this.nLeft = this.nLeft + this.self_elem_before.outerWidth(true);
                                        break
                                    case 'bottom':
                                        this.beforeLeft = (left + (this.self_width / 2)) - (this.self_elem_before.outerWidth(true) / 2);
                                        this.beforeTop = (top + this.self_height) - this.self_elem_before.outerHeight(true);
                                        this.nTop = this.nTop + this.self_elem_before.outerHeight(true);
                                        break;
                                    case 'rest_left':
                                        this.beforeLeft = (left - this.self_elem_before.outerWidth(true)) + this.self_elem_before.outerWidth(true);
                                        this.beforeTop = (top + (this.self_height / 2)) - (this.self_elem_before.outerHeight(true) / 2);
                                        this.nLeft = this.nLeft - this.self_elem_before.outerWidth(true);
                                        flag = false;
                                        break;
                                    case 'rest_right':
                                        this.beforeLeft = (left + this.self_width) - this.self_elem_before.outerWidth(true);
                                        this.beforeTop = (top + (this.self_height / 2)) - (this.self_elem_before.outerHeight(true) / 2);
                                        this.nLeft = this.nLeft + this.self_elem_before.outerWidth(true);
                                        flag = false;
                                        break;
                                }

                                this.beforeLeft = this.beforeLeft + this.options.left;
                                this.beforeTop = this.beforeTop + this.options.top;
                            }

                            return flag;
                        }
                    }.get();
                },
            }.init();
        }
    }
})(jQuery);