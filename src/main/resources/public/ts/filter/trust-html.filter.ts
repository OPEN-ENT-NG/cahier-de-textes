import {AngularExtensions} from '../app';

(function() {
    'use strict';

	AngularExtensions.addModuleConfig(function(module){
		module.filter('trusthtml', filter);

		function filter ($sce){
			return function(text) {				
					 return $sce.trustAsHtml(text);
			 };
		}
	});

})();
