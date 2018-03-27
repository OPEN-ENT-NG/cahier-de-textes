/*
import {angular, ng, model, _, ui} from 'entcore';

var tooltip;

export const onFinishRender = ng.directive('onFinishRender', function ($compile, $timeout) {

    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                element.ready(function () {
                    $timeout(()=>{
                        scope.$eval(attr.onFinishRender);
                    },50);
                });
            }
        }

    };
});

*/
