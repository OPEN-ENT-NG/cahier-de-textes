import {ng} from 'entcore';
import {SecureService} from "../services/secure.service";

export const secure = ng.directive('secure', function () {
    return {
        restrict: "A",
        link: function (scope, elem, attrs) {
            if (!SecureService.hasRight(attrs.secure)) {
                elem[0].remove();
            }
        },
    };
});
