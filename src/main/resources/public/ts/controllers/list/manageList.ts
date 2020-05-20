import {_, Behaviours, model, moment, ng} from 'entcore';
import {DateUtils} from '../../utils/dateUtils';
import {
    Homework, PEDAGOGIC_TYPES, Session, Workload
} from '../../model';
import {AutocompleteUtils} from "../../utils/autocompleteUtils";

export let manageListCtrl = ng.controller('manageListController',
    ['$scope','$window', '$route', '$location', '$timeout', '$compile', async function ($scope,$window, $rootScope) {
        $scope.showcalendar = false;
        const WORKFLOW_RIGHTS = Behaviours.applicationsBehaviours.diary.rights.workflow;
        $scope.display.listView = true;

        $scope.TYPE_HOMEWORK = PEDAGOGIC_TYPES.TYPE_HOMEWORK;
        $scope.TYPE_SESSION = PEDAGOGIC_TYPES.TYPE_SESSION;
        $scope.TYPE_COURSE = PEDAGOGIC_TYPES.TYPE_COURSE;

        $scope.indexItemsDisplayed = [];
        if ($scope.homeworks) {
            $scope.homeworks.syncHomeworks();
        }

        $scope.filters = {
            startDate: moment().startOf('isoWeek').toDate(),
            endDate: moment().endOf('isoWeek').toDate()
        };

        $scope.syncPedagogicItems = async () => {
            if (moment($scope.filters.startDate).isAfter(moment($scope.filters.endDate))) {
                // incorrect dates
                return;
            }
            $scope.structure.homeworks.all = [];
            $scope.structure.sessions.all = [];
            $scope.structure.courses.all = [];
            const teacherSelected = AutocompleteUtils.getTeachersSelected() != undefined ?
                AutocompleteUtils.getTeachersSelected()[0] : [];
            const classSelected = AutocompleteUtils.getTeachersSelected() != undefined ?
                AutocompleteUtils.getClassesSelected()[0] : [];
            if (model.me.hasWorkflow(WORKFLOW_RIGHTS.accessChildData) && $scope.params.child && $scope.params.child.id) {
                /* student/parents workflow case */
                await Promise.all([
                    $scope.structure.homeworks.syncChildHomeworks($scope.filters.startDate, $scope.filters.endDate, $scope.params.child.id),
                    $scope.structure.sessions.syncChildSessions($scope.filters.startDate, $scope.filters.endDate, $scope.params.child.id),
                    $scope.structure.courses.sync($scope.structure, teacherSelected, classSelected, $scope.filters.startDate, $scope.filters.endDate)
                ]);
            } else if (model.me.hasWorkflow(WORKFLOW_RIGHTS.accessOwnData)) {
                /* teacher workflow case */
                let teacherId = (teacherSelected && teacherSelected.id) ? teacherSelected.id : model.me.userId;
                let audienceId = classSelected && classSelected.id ? classSelected.id : null;
                const promises: Promise<void>[] = [];
                if (teacherId != model.me.userId) {
                    promises.push($scope.structure.homeworks.syncExternalHomeworks($scope.filters.startDate, $scope.filters.endDate, teacherId, audienceId));
                    promises.push($scope.structure.sessions.syncExternalSessions($scope.filters.startDate, $scope.filters.endDate, teacherId, audienceId));
                } else {
                    promises.push($scope.structure.homeworks.syncOwnHomeworks($scope.structure, $scope.filters.startDate, $scope.filters.endDate));
                    promises.push($scope.structure.sessions.syncOwnSessions($scope.structure, $scope.filters.startDate, $scope.filters.endDate));
                }
                promises.push($scope.structure.courses.sync($scope.structure, teacherId, classSelected, $scope.filters.startDate, $scope.filters.endDate));
                await Promise.all(promises)
            }

            // link homeworks to their session
            $scope.loadPedagogicItems();
            delete ($rootScope.session);
            $scope.safeApply();
        };

        $scope.loadPedagogicItems = () => {
            $scope.pedagogicItems = [];
            $scope.pedagogicItems = _.map($scope.structure.homeworks.all, function (item) {
                if (item instanceof Homework) {
                    item["homeworks"] = [item];
                }
                return item;
            });
            if (DateUtils.isAChildOrAParent(model.me.type)) {
                $scope.structure.sessions.all.map((s, i) => {
                    if (!s.isPublished) {
                        $scope.structure.sessions.all.splice(i, 1);
                    }
                });
                $scope.structure.homeworks.all.map((h, i) => {
                    if (!h.isPublished) {
                        $scope.structure.homeworks.all.splice(i, 1);
                    }
                })
            }

            $scope.pedagogicItems = $scope.pedagogicItems.concat($scope.structure.sessions.all);
            let courses = $scope.structure.courses.all.filter(c => !($scope.structure.sessions.all.find(s => s.courseId == c._id)));
            $scope.pedagogicItems = $scope.pedagogicItems.concat(courses);

            $scope.loadPedagogicDays();
        };

        $scope.loadPedagogicDays = () => {
            $scope.pedagogicItems.sort(function (a, b) {
                return new Date(a.startMoment).getTime() - new Date(b.startMoment).getTime();
            });

            let group_to_values = $scope.pedagogicItems.reduce(function (obj, item) {
                let date = item.startMoment.format('YYYY-MM-DD');
                obj[date] = obj[date] || [];
                obj[date].push(item);
                return obj;
            }, {});

            $scope.getNbHomework = (pedagogicDay) => {
                let nbHomework = 0;
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

            $scope.pedagogicDays = Object.keys(group_to_values).map(function (key: string) {
                let pedagogicItems = group_to_values[key];
                let nbHomework = 0;
                let publishedHomeworkByAudience = {};
                pedagogicItems.forEach(i => {
                    if (i.pedagogicType === $scope.TYPE_HOMEWORK) {
                        nbHomework++;
                    }
                });


                let audienceIds = pedagogicItems.filter(p => p.pedagogicType === $scope.TYPE_HOMEWORK).map(p => {
                    if (p.audience)
                        return p.audience.id
                });
                let uniqueAudienceIdsArray = Array.from(new Set(audienceIds));
                let homeworksAreForOneAudienceOnly = uniqueAudienceIdsArray.length === 1;


                let nbSession = pedagogicItems.filter(i => i.pedagogicType === $scope.TYPE_SESSION).length;
                let nbCourse = pedagogicItems.filter(i => i.pedagogicType === $scope.TYPE_COURSE).length;
                let nbCourseAndSession = nbSession + nbCourse;

                let fullDayNameStr = moment(key).format('dddd LL');
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

        $scope.initDisplay = () => {
            let nbSessionDisplayed = 0;
            let nbHomeworkDisplayed = 0;
            let indexMinChildHomework = $scope.pedagogicDays.length;
            let indexMaxChildHomework = -1;

            //hiding all the days
            $scope.pedagogicDays.map(c => {
                c.displayed = false;
            });

            function containsSession(c: any) {
                return c.nbSession != 0;
            }

            $scope.isCounselorUser = () => {
                return model.me.hasWorkflow(WORKFLOW_RIGHTS.viescoSettingHomeworkAndSessionTypeManage);
            };

            function containsHomeworks(c: any) {
                let isDisplayedByDefault = false;
                c.pedagogicItems.map(pi => {
                    if (pi.pedagogicType === $scope.TYPE_HOMEWORK)
                        if ($scope.isChild) {
                            if (!pi.isDone) {
                                isDisplayedByDefault = true;

                            }
                        } else {
                            isDisplayedByDefault = true;
                        }
                });
                return c.nbHomework != 0 && isDisplayedByDefault;
            }

            //display session
            $scope.pedagogicDays.map((c, index) => {
                if (c.shortDate === "17/04")

                    containsSession(c);
                if (containsSession(c) && nbSessionDisplayed < 3) {
                    c.displayed = true;
                    nbSessionDisplayed++;
                }
                if (containsHomeworks(c) && nbHomeworkDisplayed < 3) {
                    if ($scope.isChild) {
                        (indexMinChildHomework > index) ? indexMinChildHomework = index : indexMinChildHomework;
                        (indexMaxChildHomework < index) ? indexMaxChildHomework = index : indexMaxChildHomework;
                    } else {
                        c.displayed = true;

                    }
                    nbHomeworkDisplayed++;
                }
            });
            if ($scope.isChild) {
                $scope.pedagogicDays.map((c, index) => {
                    if (index => indexMinChildHomework && index <= indexMaxChildHomework) {
                        c.displayed = true;
                    }
                })
            }
        };

        $scope.openHomework = (homeworkId: number) => {
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

        $scope.filterHomeworkState = (homework) => {
            let isInFilter = false;
            if($scope.display.homeworksFilter){
                if($scope.display.todo){
                    isInFilter =  isInFilter || !homework.isDone;
                }
                if($scope.display.done){
                    isInFilter = isInFilter ||  homework.isDone ;
                }
            }else{
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
            if ($scope.display.listView) {
                $scope.display.sessions = true;
                $scope.display.homeworks = true ;
            }
        };

        $scope.containsOnlyCourses = (pedagogicDay) => {
            let containsOnlyCourseBool = true;
            pedagogicDay.pedagogicItems.map(p => {
                if (p.pedagogicType === PEDAGOGIC_TYPES.TYPE_SESSION || p.pedagogicType === PEDAGOGIC_TYPES.TYPE_HOMEWORK){
                    containsOnlyCourseBool = false ;

                }
            })
            return containsOnlyCourseBool;
        };
        //check the display mod and if display session check the homeworks an the sessions which have homeworks
        $scope.displaySession = (displaySession,pedagogicItem) => {
            if (displaySession)
                return pedagogicItem.pedagogicType === PEDAGOGIC_TYPES.TYPE_SESSION;
            else
                return pedagogicItem.pedagogicType === PEDAGOGIC_TYPES.TYPE_HOMEWORK || (pedagogicItem.homeworks && pedagogicItem.homeworks.length && pedagogicItem.homeworks.length > 0);
        };

        $scope.hasPedagogicDayToDisplay = (pedagogicDays, display) => {
            let hasOneDayToDisplay=false;
            if(pedagogicDays)
                pedagogicDays.map(p =>{
                    p.pedagogicItems.map( pd => {
                        if(display.sessionList && pd instanceof Session){
                            hasOneDayToDisplay = true;
                        }
                        if(!display.sessionList && pd instanceof Homework){

                            if(DateUtils.isAChildOrAParent(model.me.type) ){
                                if( display.todo || display.done) {
                                    if(display.todo && !pd.isDone)
                                        hasOneDayToDisplay = true;
                                    if(display.done && pd.isDone)
                                        hasOneDayToDisplay = true;
                                }
                                else
                                    hasOneDayToDisplay = false;
                            }else{
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

        $scope.syncPedagogicItems();
    }]
);