(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {
        module.directive('diarySortableList', sortableDirective);
        module.directive('diarySortableElement', sortableElementDirective);

        function sortableDirective($compile) {
            return {
                restrict: 'A',
                controller: function() {},
                compile: function(element, attributes, transclude) {
                    var initialHtml = element.html();
                    return function(scope, element, attributes) {
                        scope.updateElementsOrder = function(el) {

                            var sortables = element.find('[diary-sortable-element]');
                            //sortables.removeClass('animated');

                            let elements = _.sortBy(sortables,function(el){
                                return $(el).offset().top;
                            });

                            _.each(elements,function(item,index) {
                                var itemScope = angular.element(item).scope();
                                if (index !== itemScope.ngModel) {
                                    itemScope.ngModel = index;
                                }
                            });
                            sortables.attr('style', '');
                            scope.$apply();
                        };
                    };
                }
            };
        }

        function sortableElementDirective ($parse,$timeout) {
            return {
                scope: {
                    ngModel: '=',
                    ngChange: '&'
                },
                require: '^diarySortableList',
                template: '<div ng-transclude></div>',
                transclude: true,
                link: function(scope, element, attributes) {
                    var sortables;
                    let oldValNgModel;

                    ui.extendElement.draggable(element, {
                        lock: {
                            horizontal: true
                        },
                        mouseUp: function() {
                            scope.$parent.updateElementsOrder(element);
                            
                            element.on('click', function() {
                                scope.$parent.$eval(attributes.ngClick);
                            });

                            if (typeof scope.ngChange === 'function'){
                                    scope.ngChange();
                            }
                        },
                        startDrag: function() {
                            sortables = element.parents('[diary-sortable-list]').find('[diary-sortable-element]');
                            sortables.attr('style', '');
                            setTimeout(function() {
                                sortables.addClass('animated');
                            }, 20);
                            element.css({
                                'z-index': 1000
                            });
                            element.width(element.outerWidth());
                        },
                        tick: function() {
                            var moved = [];
                            sortables.each(function(index, sortable) {
                                if (element[0] === sortable) {
                                    return;
                                }
                                var sortableTopDistance = $(sortable).offset().top - parseInt($(sortable).css('margin-top'));
                                if (element.offset().top + element.height() / 2 > sortableTopDistance &&
                                    element.offset().top + element.height() / 2 < sortableTopDistance + $(sortable).height()) {
                                    $(sortable).css({
                                        'margin-top': element.height()
                                    });
                                    moved.push(sortable);
                                }
                                //first widget case
                                if (element.offset().top + element.height() / 2 - 2 < sortableTopDistance && index === 0) {
                                    $(sortable).css({
                                        'margin-top': element.height()
                                    });
                                    moved.push(sortable);
                                }
                            });
                            sortables.each(function(index, sortable) {
                                if (moved.indexOf(sortable) === -1) {
                                    $(sortable).css({
                                        'margin-top': 0 + 'px'
                                    });
                                }
                            });
                        }
                    });
                }
            };
        }
    });

})();
