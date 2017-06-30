(function() {
	'use strict';

	AngularExtensions.addModuleConfig(function(module){
		module.directive('entDropdown', function () {
				return {
						restrict: "E",
						templateUrl: "diary/public/template/ent-dropdown.html",
						scope: {
								placeholder: "@",
								list: "=",
								selected: "=",
								property: "@",
								school: "=",
								refreshFunc: "&",
								loadPreviousFunc: "&",
								lesson: "=",
								homework: "="
						},
						link: function(scope, element, attrs) {
								scope.listVisible = false;
								scope.isPlaceholder = true;
								scope.searchPerformed = false;
								scope.otherAudiences = [];
								scope.translated_placeholder = lang.translate(scope.placeholder);

								scope.select = function(audience) {
										scope.isPlaceholder = false;
										scope.selected = audience;
										scope.listVisible = false;
								};

								scope.isSelected = function(audience) {
										return scope.selected !== undefined && scope.selected != null && audience[scope.property] === scope.selected[scope.property];
								};

								scope.show = function() {
										scope.listVisible = true;
								};

								scope.searchAudiences = function () {
										http().get('diary/classes/list/' + scope.school)
												.done(function (structureData) {
														scope.otherAudiences = _.map(structureData, function (data) {
																var audience = {};
																audience.structureId = scope.school;
																audience.type = 'class';
																audience.typeLabel = (data.className === 'class') ? lang.translate('diary.audience.class') :  lang.translate('diary.audience.group');
																audience.id= data.classId;
																audience.name = data.className;
																return audience;
														});

														scope.otherAudiences = _.reject(scope.otherAudiences, function(audience) {
																return _.contains(_.pluck(scope.list, 'name') , audience.name);
														});

														scope.searchPerformed = true;
														scope.listVisible = true;
														scope.$apply();
												}).error(function (e) {
												if (typeof cbe === 'function') {
														cbe(model.parseError(e));
												}
										});
								};

								scope.$watch("selected", function(value) {
										scope.isPlaceholder = true;
										if (scope.selected !== null && scope.selected !== undefined) {
												scope.isPlaceholder = scope.selected[scope.property] === undefined;
												scope.display = scope.selected[scope.property];

												if (scope.lesson && scope.lesson.id && scope.lesson.endTime) {
														if (scope.lesson.homeworks.all.length > 0) {
																scope.$parent.refreshHomeworkLoads(scope.lesson);
														}

														scope.lesson.previousLessonsLoaded = false;
														//scope.$parent.loadPreviousLessonsFromLesson(scope.lesson);
												}

												if (scope.homework && scope.homework.audience) {
														scope.$parent.showHomeworksLoad(scope.homework, null, null);
												}
										}
								});

								/*$(element.context.ownerDocument).click(function (event) {
										scope.listVisible = false;
								});*/
								function handler(event) {
										var isClickedElementChildOfPopup = element
												.find(event.target)
												.length > 0;

										if (isClickedElementChildOfPopup)
												return;

										scope.$apply(function() {
												scope.listVisible = false;
										});
								}
								$(document).bind('click',handler );

								//free on detraoy element & handlers
								scope.$on("$destroy", function() {
										$(document).unbind('click',handler );
								});

						}
				};
		});
	});

})();
