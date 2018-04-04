import { ng, moment, idiom as lang, model, _ } from 'entcore';
import { SearchForm, PedagogicDay, Homework } from "../../models/index";
import {PedagogicItemService} from "../../services/pedagogic-item.service";

export const quickSearch = ng.directive('quickSearch', function () {

    return {
        restrict: "E",
        templateUrl: "/diary/public/template/directives/quick-search/quick-search.html",
        scope: {
            /**
             * Item type 'lesson' or 'homework'
             */
            itemType: "@"
        },
        link: function (scope, element, attrs, location) {
        },
        controller: 'QuickSearchController'

    }
});

