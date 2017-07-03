(function() {
	'use strict';

	AngularExtensions.addModuleConfig(function(module){
		module.filter('formatHour', filter);

		function filter (){
			return function(text) {
					if (!text){
						return text;
					}
					 return text.substring(0,5).replace(":","h");
			 };
		}
	});

})();
