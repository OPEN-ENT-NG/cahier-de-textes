(function() {
	'use strict';

	AngularExtensions.addModuleConfig(function(module){

		module.directive('diaryCalendar', directive);

		function directive() {
		    return {
		        restrict: 'E',
						templateUrl: '/diary/public/js/common/directives/calendar/calendar.template.html',
						scope : {
							items : '=',
							mondayOfWeek : '=',
							itemTemplate : '@',
							readOnly : '=',
							displayTemplate : '=',
							onCreateOpenAction :  '&',
							params : '='
						},

		        controller: 'DiaryCalendarController',
						controllerAs:"DiaryCalendarCtrl"
		    };
		}
	});

})();
