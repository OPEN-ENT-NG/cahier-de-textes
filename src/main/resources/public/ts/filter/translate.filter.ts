import { idiom as lang } from 'entcore';
import {AngularExtensions} from '../app';

(function() {
    'use strict';

	AngularExtensions.addModuleConfig(function(module){
		module.filter('translate', filter);

		function filter (){
			return function(text) {
					 return lang.translate(text);
			 };
		}
	});

})();
