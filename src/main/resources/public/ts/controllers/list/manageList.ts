import {_, Behaviours, model, moment, ng} from 'entcore';
import {DateUtils} from '../../utils/dateUtils';
import {
    Homework, PEDAGOGIC_TYPES, Session, Subjects, Toast, Workload, Course, Audience
} from '../../model';
import {UPDATE_STRUCTURE_EVENTS, UPDATE_SUBJECT_EVENTS} from '../../core/enum/events';
import {IAngularEvent} from 'angular';
import {AutocompleteUtils} from '../../utils/autocomplete/autocompleteUtils';
import {MobileUtils} from "../../utils/mobile";

declare let window: any;

export let manageListCtrl = ng.controller('manageListController',
    ['$scope', '$window', '$route', '$location', '$timeout', '$compile', function ($scope, $window, $rootScope) {
        $scope.showcalendar = false;
        const WORKFLOW_RIGHTS = Behaviours.applicationsBehaviours.diary.rights.workflow;

        $scope.display = {
            sessionList: false,
            listView: true,
            homeworks: (window.item && ('display' in window.item)) ? window.item.display.homeworks : true,
            todo: true,
            done: true,
            listViewArea: {
                filter: !MobileUtils.isMobile(),
                structure: !MobileUtils.isMobile(),
                children: !MobileUtils.isMobile()
            }
        };

        $scope.collapseMobile = (areaType: string): void => {
            if ($scope.isMobile()) {
                switch (areaType) {
                    case 'filter': {
                        $scope.display.listViewArea.filter = !$scope.display.listViewArea.filter;
                        break;
                    }
                    case 'structure': {
                        $scope.display.listViewArea.structure = !$scope.display.listViewArea.structure;
                        break;
                    }
                    case 'children': {
                        $scope.display.listViewArea.children = !$scope.display.listViewArea.children;
                        break;
                    }
                }
            }
        };

        $scope.autocomplete = AutocompleteUtils;
        $scope.subjects = new Subjects();
        $scope.TYPE_HOMEWORK = PEDAGOGIC_TYPES.TYPE_HOMEWORK;
        $scope.TYPE_SESSION = PEDAGOGIC_TYPES.TYPE_SESSION;
        $scope.TYPE_COURSE = PEDAGOGIC_TYPES.TYPE_COURSE;

        $scope.indexItemsDisplayed = [];
        if ($scope.homeworks) {
            $scope.homeworks.syncHomeworks();
        }

        $scope.filters = {
            startDate: (window.item && ('filters' in window.item)) ? window.item.filters.startDate : moment().toDate(),
            endDate: (window.item && ('filters' in window.item)) ? window.item.filters.endDate : moment().add(28, 'day').toDate(),
            subject: (window.item && ('filters' in window.item)) ? window.item.filters.subject : null
        };

        const init = async (): Promise<void> => {
            await Promise.all([
                $scope.subjects.sync($scope.structure.id),
                $scope.syncPedagogicItems()
            ]);
        };

        $scope.syncPedagogicItems = async (subject): Promise<void> => {
            if (moment($scope.filters.startDate).isAfter(moment($scope.filters.endDate))) {
                // incorrect dates
                return;
            }
            $scope.structure.homeworks.all = [];
            $scope.structure.sessions.all = [];
            $scope.structure.courses.all = [];

            const teacherSelected: any = AutocompleteUtils.getTeachersSelected() !== undefined ?
                AutocompleteUtils.getTeachersSelected()[0] : [];
            const classSelected: any = AutocompleteUtils.getClassesSelected() !== undefined ?
                AutocompleteUtils.getClassesSelected()[0] : [];

            let subjectId: string = subject && subject.id ? subject.id :
                $scope.filters.subject ? $scope.filters.subject.id : null;

            if (model.me.hasWorkflow(WORKFLOW_RIGHTS.accessChildData) && $scope.params.child && $scope.params.child.id
                && ((teacherSelected && teacherSelected.id) || (classSelected && classSelected.id) ||
                    !teacherSelected || !classSelected)) {
                /* parents workflow case */

                await Promise.all([
                    $scope.structure.homeworks.syncChildHomeworks($scope.filters.startDate, $scope.filters.endDate, $scope.params.child.id, subjectId),
                    $scope.structure.sessions.syncChildSessions($scope.filters.startDate, $scope.filters.endDate, $scope.params.child.id, subjectId),
                    $scope.structure.courses.sync($scope.structure, null, null, $scope.filters.startDate, $scope.filters.endDate)
                ]);
            } else if (model.me.hasWorkflow(WORKFLOW_RIGHTS.accessOwnData)) {
                let teacherId: string = teacherSelected && teacherSelected.id ? teacherSelected.id : null;
                let audienceId: string = classSelected && classSelected.id ? classSelected.id : null;

                const promises: Promise<void>[] = [];
                /* student/teacher workflow case */
                if (audienceId || teacherId) {
                    promises.push($scope.structure.homeworks.syncExternalHomeworks($scope.filters.startDate, $scope.filters.endDate, teacherId, audienceId, subjectId));
                    promises.push($scope.structure.sessions.syncExternalSessions($scope.filters.startDate, $scope.filters.endDate, teacherId, audienceId, subjectId));

                } else {
                    promises.push($scope.structure.homeworks.syncOwnHomeworks($scope.structure, $scope.filters.startDate, $scope.filters.endDate, subjectId, teacherId ? teacherId : model.me.userId, audienceId));
                    promises.push($scope.structure.sessions.syncOwnSessions($scope.structure, $scope.filters.startDate, $scope.filters.endDate, [audienceId], subjectId));
                }

                promises.push($scope.structure.courses.sync($scope.structure, teacherId ? teacherId : model.me.userId, classSelected, $scope.filters.startDate, $scope.filters.endDate));

                await Promise.all(promises);
            }

            // link homeworks to their session
            $scope.loadPedagogicItems();
            delete ($rootScope.session);
            $scope.safeApply();
        };

        $scope.loadPedagogicItems = (): void => {
            $scope.pedagogicItems = [];
            $scope.pedagogicItems = _.map($scope.structure.homeworks.all, (item: Homework) => {
                item['homeworks'] = [item];
                return item;
            });

            if (DateUtils.isAChildOrAParent(model.me.type)) {
                $scope.structure.sessions.all.map((s: Session, i: number) => {
                    if (!s.isPublished) {
                        $scope.structure.sessions.all.splice(i, 1);
                    }
                });
                $scope.structure.homeworks.all.map((h: Homework, i: number) => {
                    if (!h.isPublished) {
                        $scope.structure.homeworks.all.splice(i, 1);
                    }
                });
            }

            $scope.pedagogicItems = $scope.pedagogicItems.concat($scope.structure.sessions.all);
            let courses: Array<Course> = $scope.structure.courses.all
                .filter((c: Course) => !($scope.structure.sessions.all.find((s: Session) => s.courseId === c._id)));
            $scope.pedagogicItems = $scope.pedagogicItems.concat(courses);

            $scope.loadPedagogicDays();
        };

        $scope.loadPedagogicDays = (): void => {
            $scope.pedagogicItems.sort((a: Homework, b: Homework) => {
                return new Date(a.startMoment).getTime() - new Date(b.startMoment).getTime();
            });

            let group_to_values = $scope.pedagogicItems.reduce((obj, item) => {
                let date: string = item.startMoment.format('YYYY-MM-DD');
                obj[date] = obj[date] || [];
                obj[date].push(item);
                return obj;
            }, {});

            $scope.getNbHomework = (pedagogicDay): number => {
                let nbHomework : number = 0;
                pedagogicDay.pedagogicItems.map(p => {
                    if (p.pedagogicType === $scope.TYPE_HOMEWORK) {
                        if ($scope.display.todo && !p.isDone) {
                            nbHomework++;
                        }
                        if ($scope.display.done && p.isDone) {
                            nbHomework++;
                        }
                    }
                });
                return nbHomework;
            };

            $scope.pedagogicDays = Object.keys(group_to_values).map((key: string) => {
                let pedagogicItems: Array<any> = group_to_values[key];
                let nbHomework: number = 0;
                let publishedHomeworkByAudience = {};
                pedagogicItems.forEach(i => {
                    if (i.pedagogicType === $scope.TYPE_HOMEWORK) {
                        nbHomework++;
                    }
                });

                let audienceIds: Array<string> = pedagogicItems.filter(p => p.pedagogicType === $scope.TYPE_HOMEWORK).map(p => {
                    if (p.audience) {
                        return p.audience.id;
                    }
                });
                let uniqueAudienceIdsArray: Array<string> = Array.from(new Set(audienceIds));
                let homeworksAreForOneAudienceOnly: boolean = uniqueAudienceIdsArray.length === 1;

                let nbSession: number = pedagogicItems.filter(i => i.pedagogicType === $scope.TYPE_SESSION).length;
                let nbCourse: number = pedagogicItems.filter(i => i.pedagogicType === $scope.TYPE_COURSE).length;
                let nbCourseAndSession: number = nbSession + nbCourse;

                let fullDayNameStr: string = moment(key).format('dddd LL');
                fullDayNameStr = `${fullDayNameStr[0].toUpperCase()}${fullDayNameStr.slice(1)}`;
                return {
                    descriptionMaxSize: 140,
                    date: moment(key),
                    pedagogicItems: pedagogicItems,
                    shortDate: moment(key).format('DD/MM'),
                    fullDayName: fullDayNameStr,
                    dayName: moment(key).format('dddd'),
                    shortDayName: moment(key).format('dd'),
                    nbHomework: nbHomework,
                    nbPublishHomework: publishedHomeworkByAudience,
                    nbSession: nbSession,
                    nbCourse: nbCourse,
                    nbCourseAndSession: nbCourseAndSession,
                    homeworksAreForOneAudienceOnly: homeworksAreForOneAudienceOnly,
                    audience: audienceIds,
                    color: Workload.getWorkloadColor(nbHomework)
                };
            });
            $scope.initDisplay();
        };

        $scope.initDisplay = (): void => {
            let indexMinChildHomework: number = $scope.pedagogicDays.length;
            let indexMaxChildHomework: number = -1;

            // hiding all the days
            $scope.pedagogicDays.map(c => {
                c.displayed = false;
            });

            function containsSession(c: any): boolean {
                return c.nbSession !== 0;
            }

            $scope.isCounselorUser = (): boolean => {
                return model.me.hasWorkflow(WORKFLOW_RIGHTS.viescoSettingHomeworkAndSessionTypeManage);
            };

            function containsHomeworks(c: any): boolean {
                let isDisplayedByDefault = false;
                c.pedagogicItems.map(pi => {
                    if (pi.pedagogicType === $scope.TYPE_HOMEWORK) {
                        if ($scope.isChild) {
                            if (!pi.isDone) {
                                isDisplayedByDefault = true;

                            }
                        } else {
                            isDisplayedByDefault = true;
                        }
                    }
                });
                return c.nbHomework !== 0 && isDisplayedByDefault;
            }

            // display session
            $scope.pedagogicDays.map((c: any, index: number) => {
                if (containsSession(c)) {
                    c.displayed = true;
                }
                if (containsHomeworks(c)) {
                    if ($scope.isChild) {
                        (indexMinChildHomework > index) ? indexMinChildHomework = index : indexMinChildHomework;
                        (indexMaxChildHomework < index) ? indexMaxChildHomework = index : indexMaxChildHomework;
                    } else {
                        c.displayed = true;

                    }
                }
            });
            if ($scope.isChild) {
                $scope.pedagogicDays.map((c: any, index: number) => {
                    if (index => indexMinChildHomework && index <= indexMaxChildHomework) {
                        c.displayed = true;
                    }
                });
            }
        };

        $scope.setHomeworkProgress = (homework: Homework): void => {
            if (homework.isDone) {
                $scope.notifications.push(new Toast('homework.done.notification', 'info'));
            }
            else {
                $scope.notifications.push(new Toast('homework.todo.notification', 'info'));
            }

            $scope.setProgress(homework);
            $scope.safeApply();
        };

        $scope.setProgress = (homework: Homework): void => {
            homework.setProgress(homework.isDone ? Homework.HOMEWORK_STATE_DONE : Homework.HOMEWORK_STATE_TODO);
        };

        $scope.openHomework = (homeworkId: number): void => {
            window.item = {
                filters: $scope.filters,
                display: $scope.display
            };
            if (model.me.hasWorkflow(WORKFLOW_RIGHTS.manageHomework)) {
                $scope.goTo('/homework/update/' + homeworkId  );
            } else {
                $scope.goTo('/homework/view/' + homeworkId );
            }
        };

        $scope.goToViewList = () => {
            $window.location.reload();
        };

        $scope.displayDay = (pedagogicDay) => {
            pedagogicDay.displayed = !pedagogicDay.displayed;
            $scope.safeApply();
        };

        $scope.filterHomeworkState = (homework: Homework): boolean => {
            let isInFilter: boolean = false;
            if ($scope.display.homeworks) {
                if ($scope.display.todo) {
                    isInFilter =  isInFilter || !homework.isDone;
                }
                if ($scope.display.done) {
                    isInFilter = isInFilter ||  homework.isDone ;
                }
            } else {
                isInFilter = true;
            }
            return isInFilter;
        };

        $scope.isClickableByStudentOrParent = (pedagogicItem) => {
            if (DateUtils.isAChildOrAParent(model.me.type)){
                if(pedagogicItem.isPublished){
                    return pedagogicItem.pedagogicType === 2;
                }else{
                    return false;
                }
            }else{
                return pedagogicItem.pedagogicType === 2;
            }
        };

        $scope.openSession = (sessionId: number) => {
            window.item = {
                filters: $scope.filters,
                display: $scope.display
            };
            if (model.me.hasWorkflow(WORKFLOW_RIGHTS.manageSession)) {
                $scope.goTo('/session/update/' + sessionId);
            } else {
                $scope.goTo('/session/view/' + sessionId);
            }
            $scope.safeApply();
        };

        $scope.openSessionFromCourse = (calendar_course) => {
            if (model.me.hasWorkflow(WORKFLOW_RIGHTS.manageSession)) {
                $scope.goTo('/session/create/' + calendar_course._id + '/' + DateUtils.getFormattedDate(calendar_course.startMoment));
            }
            $scope.safeApply();
        };

        $scope.changeViewCalendar = function () {
            $scope.goTo('/view');
            $scope.display.listView = false;
        };

        $scope.containsOnlyCourses = (pedagogicDay): boolean => {
            let containsOnlyCourseBool: boolean = true;
            pedagogicDay.pedagogicItems.map(p => {
                if (p.pedagogicType === PEDAGOGIC_TYPES.TYPE_SESSION || p.pedagogicType === PEDAGOGIC_TYPES.TYPE_HOMEWORK) {
                    containsOnlyCourseBool = false ;
                }
            });
            return containsOnlyCourseBool;
        };

        $scope.hasPedagogicDayToDisplay = (pedagogicDays, display): boolean => {
            let hasOneDayToDisplay: boolean = false;
            if (pedagogicDays)
                pedagogicDays.forEach(p => {
                    p.pedagogicItems.forEach(pd => {
                        if (display.sessionList && pd.pedagogicType === $scope.TYPE_SESSION) {
                            hasOneDayToDisplay = true;
                        }
                        if(display.homeworks && pd.pedagogicType === $scope.TYPE_HOMEWORK) {
                            if(DateUtils.isAChildOrAParent(model.me.type) ){
                                if (display.todo || display.done) {
                                    if (display.todo && !pd.isDone)
                                        hasOneDayToDisplay = true;
                                    if (display.done && pd.isDone)
                                        hasOneDayToDisplay = true;
                                }
                                else
                                    hasOneDayToDisplay = false;
                            } else {
                                hasOneDayToDisplay = true;
                            }
                        }
                    })
                });
            return hasOneDayToDisplay
        };

        $scope.hasHomeworksToDisplay = (display, pedagogicDay) => {
            let hasHomeworkToDisplay = false;
            if(display.sessionList)
                hasHomeworkToDisplay = hasHomeworkToDisplay || true;
            else{
                pedagogicDay.pedagogicItems.map(p =>{
                    if(p instanceof Homework && (p.isDone != display.todo || p.isDone == display.done )){
                        if(display.todo && !p.isDone){
                            hasHomeworkToDisplay = hasHomeworkToDisplay || true;

                        }
                        if(display.done && p.isDone){
                            hasHomeworkToDisplay = hasHomeworkToDisplay || true;

                        }
                    }
                })
            }
            return hasHomeworkToDisplay;
        };

        $scope.filterTeacherOptions = async (value: string): Promise<void> => {
            await AutocompleteUtils.filterTeacherOptions(value);
            $scope.safeApply();
        };

        $scope.filterClassOptions = async (value: string): Promise<void> => {
            await AutocompleteUtils.filterClassOptions(value);
            $scope.safeApply();
        };

        $scope.selectTeacher = async (model, item) => {
            AutocompleteUtils.setTeachersSelected([item]);
            AutocompleteUtils.resetSearchFields();
            await $scope.syncPedagogicItems();
        };

        $scope.selectClass = async (model, item) => {
            AutocompleteUtils.setClassesSelected([item]);
            AutocompleteUtils.resetSearchFields();
            await $scope.syncPedagogicItems();
        };

        $scope.removeTeacher = async (value) => {
            AutocompleteUtils.removeTeacherSelected(value);
            await $scope.syncPedagogicItems();
        };

        $scope.removeClass = async (value) => {
            AutocompleteUtils.removeClassSelected(value);
            await $scope.syncPedagogicItems();
        };

        init();

        $scope.$on(UPDATE_STRUCTURE_EVENTS.UPDATE,  () => {
            init();
        });

        $scope.$on(UPDATE_SUBJECT_EVENTS.UPDATE,  (event: IAngularEvent, data) => {
            $scope.filters.subject = data;
            if (data != null) {
                $scope.syncPedagogicItems($scope.filters.subject);
            }
            else $scope.syncPedagogicItems();
        });
    }]
);