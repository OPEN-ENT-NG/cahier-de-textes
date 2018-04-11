import { angular, ng, model, $, loader, http } from 'entcore';
import * as tools from '../tools';
declare let timepicker: any;

export const timePicker = ng.directive('timePicker', function () {
    return {
        scope: {
            ngModel: '=',
            ngChange: '&'
        },
        transclude: true,
        replace: true,
        restrict: 'E',
        template: "<input type='text' />",
        link: function (scope, element, attributes) {
            var hideFunction = function (e) {
                var timepicker = element.data('timepicker');
                if (!timepicker || element[0] === e.target || $('.bootstrap-timepicker-widget').find(e.target).length !== 0) {
                    return;
                }
                timepicker.hideWidget();
            };


            $('body, lightbox').on('click', hideFunction);
            $('body, lightbox').on('focusin', hideFunction);
            if (!$.fn.timepicker) {
                $.fn.timepicker = function () {
                };
                http().loadScript('/infra/public/js/bootstrap-timepicker.js').then(function () {
                    // does not seem to work properly
                    element.timepicker({
                        showMeridian: false,
                        defaultTime: 'current'
                    });
                });
            }

            scope.$watch('ngModel', function (newVal) {
                if(!newVal)
                    return;

                if(newVal.format)
                    element.val(newVal.format("HH:mm"));
                else
                    element.val(newVal);

            });

            element.on('focus', function () {
                element.timepicker({
                    showMeridian: false,
                    defaultTime: 'current',
                    minuteStep: 5
                });
            });

            element.on('blur', function () {
                if (scope.ngModel) {
                    let time = '';
                    if(scope && scope.ngModel && scope.ngModel.get)
                        time = scope.ngModel.get('hour') + ':' + scope.ngModel.get('minute');
                    else
                        time = scope.ngModel;

                    element.timepicker('setTime', time);
                    element.timepicker({
                        showMeridian: false,
                        defaultTime: 'current',
                        minuteStep: 5
                    });
                }
            });

            element.on('change', function () {

                var time = element.val().split(':');
                if (scope.ngModel && scope.ngModel.hour && element.val()) {
                    scope.ngModel.set('hour', time[0]);
                    scope.ngModel.set('minute', time[1]);
                    scope.$apply('ngModel');
                    scope.$parent.$eval(scope.ngChange);
                    scope.$parent.$apply();
                }
            });

            element.on('show.timepicker', function () {
                element.parents().find('lightbox').on('click.timepicker', function (e) {
                    if (timepicker && !(element.parent().find(e.target).length ||
                            timepicker.$widget.is(e.target) ||
                            timepicker.$widget.find(e.target).length)) {
                        timepicker.hideWidget();
                    }
                });
            });
        }
    };
});
