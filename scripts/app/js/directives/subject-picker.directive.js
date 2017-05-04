(function() {
	'use strict';

	AngularExtensions.addModuleConfig(function(module){
    module.directive('subjectPicker', function () {
            return {
                scope: {
                    ngModel: '=',
                    ngChange: '&',
                    lesson: "=",
                    homework: "="
                },
                transclude: true,
                replace: true,
                restrict: 'E',
                templateUrl: 'diary/public/template/subject-picker.html',
                link: function (scope, element) {


                    var sortBySubjectLabel = function (a, b) {
                        if (a.label > b.label)
                            return 1;
                        if (a.label < b.label)
                            return -1;
                        return 0;
                    };

                    scope.search = null;
                    scope.displaySearch = false;

                    // init suggested subjects with all subjects
                    scope.suggestedSubjects = new Array();

                    // custom subject collection
                    // containing base subject collection + current ones being created by used
                    var subjects = new Array();

                    model.subjects.all.forEach(function (subject) {
                        subjects.push(subject);
                    });

                    subjects.sort(sortBySubjectLabel);

                    var setNewSubject = function (subjectLabel) {

                        if(!subjectLabel){
                            return;
                        }

                        subjectLabel = subjectLabel.trim();

                        var existingSubject = null;

                        for (var i = 0; i < subjects.length; i++) {
                            if (sansAccent(subjects[i].label).toUpperCase() === sansAccent(subjectLabel).toUpperCase()) {
                                existingSubject = subjects[i];
                            }
                        }

                        if (!existingSubject) {
                            scope.ngModel = new Subject();
                            scope.ngModel.label = subjectLabel;
                            scope.ngModel.id = null;
                            scope.ngModel.school_id = scope.lesson ? scope.lesson.audience.structureId : scope.homework.audience.structureId;
                            scope.ngModel.teacher_id = model.me.userId;
                            subjects.push(scope.ngModel);
                        } else {
                            scope.ngModel = existingSubject;
                        }
                    };
										scope.$watch('lesson.audience.structureId',function(){
											if (scope.lesson && scope.lesson.audience && scope.lesson.audience.structureId){
												console.log("set new school_id");
												scope.ngModel.school_id = scope.lesson ? scope.lesson.audience.structureId : scope.homework.audience.structureId;
											}

										});
                    var initSuggestedSubjects = function() {
                        scope.suggestedSubjects = new Array();

                        for (var i = 0; i < subjects.length; i++) {
                            scope.suggestedSubjects.push(subjects[i]);
                        }
                    };

                    initSuggestedSubjects();

                    scope.goToSearchMode = function(){
                        scope.displaySearch = true;
                        scope.search = '';
                        initSuggestedSubjects();
                    };

                    scope.isSelected = function (subject) {

                        if(scope.ngModel && subject){
                            if(scope.ngModel.id){
                                return scope.ngModel.id === subject.id;
                            }
                            // subject may not have id if it's new one
                            else {
                                return sansAccent(scope.ngModel.label) === sansAccent(subject.label);
                            }
                        } else {
                            return false;
                        }
                    };

                    /**
                     * Search subject from input by user
                     */
                    scope.searchSubject = function (event) {

                        if (event.type === 'keydown' && event.keyCode === 9) {
                            scope.displaySearch = false;

                            if (scope.search != '') {
                                setNewSubject(scope.search);
                            }
                            return;
                        }

                        scope.search = scope.search.trim();

                        if (scope.search != '') {
                            var matchingSubjects = model.findSubjectsByLabel(scope.search);
                            scope.suggestedSubjects = new Array();

                            for (var i = 0; i < matchingSubjects.length; i++) {
                                scope.suggestedSubjects.push(matchingSubjects[i]);
                            }

                        } else {
                            initSuggestedSubjects();
                        }
                    };

                    scope.selectSubject = function (subject) {
                        scope.ngModel = subject;
                        scope.displaySearch = false;
                        if (scope.lesson) {
                            scope.lesson.previousLessonsLoaded = false;
                            //scope.$parent.loadPreviousLessonsFromLesson(scope.lesson);
                        }
                    };

                    $(element.context.ownerDocument).click(function (event) {
                        if (!$(event.target).is("item-suggest") && !$(event.target).is("#remove-subject") && !$(event.target).is("#input-subject")) {
                            scope.displaySearch = false;

                            // new subject that will need to be created on lesson/homework save
                            if (scope.suggestedSubjects.length === 0) {
                                setNewSubject(scope.search);
                            }
                            scope.$apply();
                        }
                    });
                }
            }
        });
	});

})();
