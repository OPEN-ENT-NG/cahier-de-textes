import {AngularExtensions} from '../app';

(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {
        module.filter('highlight', filter);

        function filter( $sce) {
            return function(text, phrase) {
                if (phrase) text = text.replace(new RegExp('(' + phrase + ')', 'gi'), '<span class="highlighted">$1</span>');
                return $sce.trustAsHtml(text);
            };
        }
    });

})();
