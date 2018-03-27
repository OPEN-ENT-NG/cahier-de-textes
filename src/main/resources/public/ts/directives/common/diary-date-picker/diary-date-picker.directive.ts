/*
import {angular, ng, model, _, moment} from 'entcore';

export const diaryDatePicker = ng.directive('diaryDatePicker', function ($compile) {

            return {
                scope: {
                    minDate: '=',
                    ngModel: '=',
                    ngChange: '&',
                    nullable : '='
                },
                transclude: true,
                replace: true,
                restrict: 'E',
                template: '<input ng-transclude type="text" data-date-format="dd/mm/yyyy"  />',
                link: function(scope, element, attributes) {

                    scope.$watch('ngModel', function(newVal) {
                        if (scope.nullable && !scope.ngModel) {
                            return;
                        }
                        element.val(moment(scope.ngModel).format('DD/MM/YYYY'));
                        if (element.datepicker)
                            element.datepicker('setValue', moment(scope.ngModel).format('DD/MM/YYYY'));
                    });

                    if (scope.minDate) {
                        scope.$watch('minDate', function(newVal) {
                            setNewDate();
                        });
                    }

                    function setNewDate() {
                        var minDate = scope.minDate;
                        var date = element.val().split('/');
                        var temp = date[0];
                        date[0] = date[1];
                        date[1] = temp;
                        date = date.join('/');
                        scope.ngModel = new Date(date);
                        if (scope.nullable && scope.ngModel == 'Invalid Date') {
                            scope.ngModel=undefined;
                            return;
                        }
                        if (scope.ngModel < minDate) {
                            scope.ngModel = minDate;
                            element.val(moment(minDate).format('DD/MM/YYYY'));
                        }

                        scope.$apply('ngModel');
                        scope.$parent.$eval(scope.ngChange);
                        scope.$parent.$apply();
                    }

                    loader.asyncLoad('/' + infraPrefix + '/public/js/bootstrap-datepicker.js', function() {
                        element.datepicker({
                                dates: {
                                    months: moment.months(),
                                    monthsShort: moment.monthsShort(),
                                    days: moment.weekdays(),
                                    daysShort: moment.weekdaysShort(),
                                    daysMin: moment.weekdaysMin()
                                },
                                weekStart: 1
                            })
                            .on('changeDate', function() {
                                setTimeout(setNewDate, 10);
                                $(this).datepicker('hide');
                            });
                        element.datepicker('hide');
                    });

                    var hideFunction = function(e) {
                        if (e.originalEvent && (element[0] === e.originalEvent.target || $('.datepicker').find(e.originalEvent.target).length !== 0)) {
                            return;
                        }
                        element.datepicker('hide');
                    };

                    $('body, lightbox').on('click', hideFunction);
                    $('body, lightbox').on('focusin', hideFunction);

                    element.on('focus', function() {
                        var that = this;
                        $(this).parents('form').on('submit', function() {
                            $(that).datepicker('hide');
                        });
                        element.datepicker('show');
                    });

                    element.on('change', setNewDate);

                    element.on('$destroy', function() {
                        element.datepicker('hide');
                    });
                }
            };
    });
*/
