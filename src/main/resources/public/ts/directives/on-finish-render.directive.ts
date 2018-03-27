import {ng} from 'entcore';

export const onFinishRender = ng.directive('onFinishRender', function ($timeout) {

    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function() {
                    scope.$evalAsync(attr.onFinishRender);
                });
            }
        }
    };
});