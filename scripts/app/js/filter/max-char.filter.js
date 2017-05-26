(function() {
	'use strict';

	AngularExtensions.addModuleConfig(function(module){
		module.filter('maxChar', filter);

		function filter (){
			return function (item,maxChar) {
				if (!item){
					return item;
				}

			 let dynamicMaxChar = maxChar;

			 if (item.indexOf('</div>') < dynamicMaxChar){
				 dynamicMaxChar = item.indexOf('</div>') + 6;				 
			 }
			 if (item.length < dynamicMaxChar){
				 return item;
			 }else{
				 return item.substring(0,dynamicMaxChar) + " ...";
			 }

		 };
		}
	});

})();
