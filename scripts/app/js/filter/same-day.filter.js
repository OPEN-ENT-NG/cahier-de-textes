(function() {
	'use strict';

	AngularExtensions.addModuleConfig(function(module){
		module.filter('sameDate', filter);

		function filter (){
			return function (items,properties) {
				let d = properties[Object.keys(properties)[0]];
				if (!d){
					return items;
				}
				let valueCompare = moment(d);
				let result = items.filter((item)=>{
					let valueItem = moment(item.date);
					return valueItem.isSame(valueCompare,'d');
				});				
				return result;
		 };
		}
	});

})();
