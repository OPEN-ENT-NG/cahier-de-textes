import { _ } from 'entcore';
import {AngularExtensions} from '../app';

(function() {
    'use strict';

	AngularExtensions.addModuleConfig(function(module){
		module.filter('arraytostring', filter);

		function filter (){
			return function (item) {
			 // return the current `item`, but call `toUpperCase()` on it

			 if (!item){
				 return "";
			 }
			 let result = "";
				_.each(item,(it)=>{
					result+= it + ",";
				});
				result = result.substring(0,result.length -1);				
			 return result;
		 };
		}
	});

})();
