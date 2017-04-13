(function() {
    'use strict';

    /* create singleton */
    AngularExtensions.addModuleConfig(function(module) {
        module.service("ResizableService", ResizableService);
    });


    class ResizableService {
        constructor() {}

        resizable(element, params) {
            if (!params) {
                params = {};
            }
            if (!params.lock) {
                params.lock = {};
            }

            if (element.length > 1) {
                element.each(function(index, item) {
                    ui.extendElement.resizable($(item), params);
                });
                return;
            }

            //cursor styles to indicate resizing possibilities
            element.on('mouseover', function(e) {
                element.on('mousemove', function(e) {
                    if (element.data('resizing') || element.data('lock')) {
                        return;
                    }
                    var mouse = {
                        x: e.pageX,
                        y: e.pageY
                    };
                    var resizeLimits = {
                        horizontalRight: element.offset().left + element.width() + 15 > mouse.x && mouse.x > element.offset().left + element.width() - 15 &&
                            params.lock.horizontal === undefined && params.lock.right === undefined,

                        horizontalLeft: element.offset().left + 15 > mouse.x && mouse.x > element.offset().left - 15 &&
                            params.lock.horizontal === undefined && params.lock.left === undefined,

                        verticalTop: element.offset().top + 5 > mouse.y && mouse.y > element.offset().top - 15 &&
                            params.lock.vertical === undefined && params.lock.top === undefined,

                        verticalBottom: element.offset().top + element.height() + 5 > mouse.y && mouse.y > element.offset().top + element.height() - 5 &&
                            params.lock.vertical === undefined && params.lock.bottom === undefined
                    };

                    var orientations = {
                        'ns': resizeLimits.verticalTop || resizeLimits.verticalBottom,
                        'ew': resizeLimits.horizontalLeft || resizeLimits.horizontalRight,
                        'nwse': (resizeLimits.verticalBottom && resizeLimits.horizontalRight) || (resizeLimits.verticalTop && resizeLimits.horizontalLeft),
                        'nesw': (resizeLimits.verticalBottom && resizeLimits.horizontalLeft) || (resizeLimits.verticalTop && resizeLimits.horizontalRight)

                    };

                    var cursor = '';
                    for (var orientation in orientations) {
                        if (orientations[orientation]) {
                            cursor = orientation;
                        }
                    }


                    if (cursor) {
                        cursor = cursor + '-resize';
                    }
                    element.css({
                        cursor: cursor
                    });
                    element.find('[contenteditable]').css({
                        cursor: cursor
                    });
                });
                element.on('mouseout', function(e) {
                    element.unbind('mousemove');
                });
            });

            //actual resize
            element.on('mousedown.resize touchstart.resize', function(e) {
                if (element.data('lock') === true || element.data('resizing') === true) {
                    return;
                }

                $('body').css({
                    '-webkit-user-select': 'none',
                    '-moz-user-select': 'none',
                    'user-select': 'none'
                });
                var interrupt = false;
                var mouse = {
                    y: e.pageY || e.originalEvent.touches[0].pageY,
                    x: e.pageX || e.originalEvent.touches[0].pageX
                };
                var resizeLimits = {
                    horizontalRight: element.offset().left + element.width() + 15 > mouse.x && mouse.x > element.offset().left + element.width() - 15 &&
                        params.lock.horizontal === undefined && params.lock.right === undefined,

                    horizontalLeft: element.offset().left + 15 > mouse.x && mouse.x > element.offset().left - 15 &&
                        params.lock.horizontal === undefined && params.lock.left === undefined,

                    verticalTop: element.offset().top + 5 > mouse.y && mouse.y > element.offset().top - 15 &&
                        params.lock.vertical === undefined && params.lock.top === undefined,

                    verticalBottom: element.offset().top + element.height() + 5 > mouse.y && mouse.y > element.offset().top + element.height() - 5 &&
                        params.lock.vertical === undefined && params.lock.bottom === undefined
                };

                var initial = {
                    pos: element.offset(),
                    size: {
                        width: element.width(),
                        height: element.height()
                    }
                };
                var parent = element.parents('.drawing-zone');
                var parentData = {
                    pos: parent.offset(),
                    size: {
                        width: parent.width(),
                        height: parent.height()
                    }
                };

                if (resizeLimits.horizontalLeft || resizeLimits.horizontalRight || resizeLimits.verticalTop || resizeLimits.verticalBottom) {
                    element.trigger('startResize');
                    e.preventDefault();
                    e.stopPropagation();
                    element.data('resizing', true);
                    $('.main').css({
                        'cursor': element.css('cursor')
                    });

                    $(window).unbind('mousemove.drag touchmove.start');
                    $(window).on('mousemove.resize touchmove.resize', function(e) {
                        element.unbind("click");
                        mouse = {
                            y: e.pageY || e.originalEvent.touches[0].pageY,
                            x: e.pageX || e.originalEvent.touches[0].pageX
                        };
                    });

                    //animation for resizing
                    var resize = function() {
                        var newWidth = 0;
                        var newHeight = 0;
                        if (resizeLimits.horizontalLeft || resizeLimits.horizontalRight) {
                            var p = element.offset();
                            if (resizeLimits.horizontalLeft) {
                                var distance = initial.pos.left - mouse.x;
                                if (initial.pos.left - distance < parentData.pos.left) {
                                    distance = initial.pos.left - parentData.pos.left;
                                }
                                if (params.moveWithResize !== false) {
                                    element.offset({
                                        left: initial.pos.left - distance,
                                        top: p.top
                                    });
                                }

                                newWidth = initial.size.width + distance;
                            } else {
                                var distance = mouse.x - p.left;
                                if (element.offset().left + distance > parentData.pos.left + parentData.size.width) {
                                    distance = (parentData.pos.left + parentData.size.width) - element.offset().left - 2;
                                }
                                newWidth = distance;
                            }
                            if (newWidth > 0) {
                                element.width(newWidth);
                            }
                        }
                        if (resizeLimits.verticalTop || resizeLimits.verticalBottom) {


                            var p = element.offset();
                            if (resizeLimits.verticalTop) {
                                console.log("resizeLimits.verticalTop");
                                var distance = initial.pos.top - mouse.y;
                                if (initial.pos.top - distance < parentData.pos.top) {
                                    distance = initial.pos.top - parentData.pos.top;
                                }
                                if (params.moveWithResize !== false) {
                                    element.offset({
                                        left: p.left,
                                        top: initial.pos.top - distance
                                    });
                                }

                                newHeight = initial.size.height + distance;
                            } else {
                                console.log("!resizeLimits.verticalTop");
                                var distance = mouse.y - p.top;
                                if (element.offset().top + distance > parentData.pos.top + parent.height()) {
                                    distance = (parentData.pos.top + parentData.size.height) - element.offset().top - 2;
                                }
                                newHeight = distance;
                            }
                            if (newHeight > 0) {
                                element.height(newHeight);
                            }
                        }
                        element.trigger('resizing');
                        if (!interrupt) {
                            requestAnimationFrame(resize);
                        }
                    };
                    resize();

                    $(window).on('mouseup.resize touchleave.resize touchend.resize', function(e) {
                        interrupt = true;
                        setTimeout(function() {
                            element.data('resizing', false);
                            element.trigger('stopResize');
                            if (params && typeof params.mouseUp === 'function') {
                                params.mouseUp(e);
                            }
                        }, 100);
                        $(window).unbind('mousemove.resize touchmove.resize mouseup.resize touchleave.resize touchend.resize');
                        $('body').unbind('mouseup.resize touchleave.resize touchend.resize');

                        $('.main').css({
                            'cursor': ''
                        });
                    });
                }
            });
        }
    }
})();
