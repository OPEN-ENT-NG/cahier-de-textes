import {_, angular, Behaviours, idiom as lang, model, moment, ng, template} from 'entcore';
import {Course, Homework, PEDAGOGIC_TYPES, Session, Workload} from '../../model';
import {DateUtils} from '../../utils/dateUtils';
import {AutocompleteUtils} from '../../utils/autocomplete/autocompleteUtils';
import {ProgressionFolders} from "../../model/Progression";
import {StructureService, StructureSlot} from "../../services";
import {Groups} from "../../model/group";
import {UPDATE_STRUCTURE_EVENTS} from "../../core/enum/events";
import {PEDAGOGIC_SLOT_PROFILE} from "../../core/enum/pedagogic-slot-profile";
import {CALENDAR_TOOLTIP_EVENTER} from "../../core/const/calendar-tooltip-eventer";

declare let window: any;

export let calendarController = ng.controller('CalendarController',
    ['$scope', '$rootScope', 'route', '$location', 'StructureService',
        async function ($scope, $rootScope, route, $location, StructureService: StructureService) {
            $scope.display = {
                homeworks: true,
                sessions: true,
                listView: false,
                progression: false,
                sessionList: false
            };
            const WORKFLOW_RIGHTS = Behaviours.applicationsBehaviours.diary.rights.workflow;
            $scope.calendar = ($scope.calendar) ? $scope.calendar : model.calendar;
            $scope.legendLightboxIsVisible = false;
            $scope.autocomplete = AutocompleteUtils;
            $scope.isTimeSlotsInitialized = false;
            $scope.progressionFolders = new ProgressionFolders(model.me.userId);

            $scope.TYPE_HOMEWORK = PEDAGOGIC_TYPES.TYPE_HOMEWORK;
            $scope.TYPE_SESSION = PEDAGOGIC_TYPES.TYPE_SESSION;
            $scope.TYPE_COURSE = PEDAGOGIC_TYPES.TYPE_COURSE;

            const pedagogicSlotProfile: typeof PEDAGOGIC_SLOT_PROFILE = PEDAGOGIC_SLOT_PROFILE;

            $scope.timeSlot = {
                slots: null
            };

            $scope.filters = {
                startDate: moment().startOf('isoWeek').toDate(),
                endDate: moment().endOf('isoWeek').toDate()
            };
            model.calendar.setDate(moment());

            $scope.setLegendLightboxVisible = (state: boolean) => {
                $scope.legendLightboxIsVisible = state;
                if ($scope.legendLightboxIsVisible) {
                    template.open('infoBulleTemplate', 'main/toolTip-legendeTemplate');
                }
            };

            $scope.transformDateToFrenchDate = (date: Date) => {
                return moment(date).format("dddd D MMMM YYYY");
            };

            $scope.changeViewCalendar = function () {
                $scope.goTo('/view');
                $scope.display.listView = false;
                if ($scope.display.listView) {
                    $scope.display.sessions = true;
                    $scope.display.homeworks = true;
                }
            };

            $scope.changeViewList = function () {
                $scope.filters.endDate = moment($scope.filters.startDate).add('2', 'weeks').add('4', 'day');
                $scope.goTo('/list');
                $scope.display.listView = true;
                $scope.display.sessionList = !DateUtils.isAChildOrAParent(model.me.type);
                if ($scope.display.listView) {
                    $scope.display.sessions = true;
                    $scope.display.homeworks = true;
                }
            };

            const setTimeSlots = async () => {
                await initTimeSlots();
                $scope.safeApply();
            };

            $scope.createHomeworksLoop = function (pedagogicItem) {
                $scope.homeworks = !pedagogicItem.homeworks ? [pedagogicItem] : pedagogicItem.homeworks;
            };

            const initTimeSlots = async () => {
                const structure_slots: StructureSlot = await StructureService.getSlotProfile(
                    window.structure ? window.structure.id : $scope.structure.id
                );
                if (Object.keys(structure_slots).length > 0) {
                    $scope.timeSlot.slots = structure_slots.slots;
                    model.calendar.setTimeslots($scope.timeSlot.slots);
                } else $scope.timeSlot.slots = null;
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

            $scope.syncPedagogicItems = async (firstRun?: boolean) => {
                $scope.structure.homeworks.all = [];
                $scope.structure.sessions.all = [];
                $scope.structure.courses.all = [];
                $scope.progressionFolders.all = [];
                const teacherSelected = AutocompleteUtils.getTeachersSelected() != undefined ?
                    AutocompleteUtils.getTeachersSelected()[0] : [];
                const classSelected = AutocompleteUtils.getClassesSelected() != undefined ?
                    AutocompleteUtils.getClassesSelected()[0] : [];
                /* personal workflow case */
                if ((model.me.hasWorkflow(WORKFLOW_RIGHTS.diarySearch) && model.me.hasWorkflow(WORKFLOW_RIGHTS.accessExternalData))
                    && ((teacherSelected && teacherSelected.id) || (classSelected && classSelected.id))) {
                    let teacherId = teacherSelected && teacherSelected.id ? teacherSelected.id : null;
                    let audienceId = classSelected && classSelected.id ? classSelected.id : null;
                    await Promise.all([
                        $scope.structure.homeworks.syncExternalHomeworks($scope.filters.startDate, $scope.filters.endDate, teacherId, audienceId),
                        $scope.structure.sessions.syncExternalSessions($scope.filters.startDate, $scope.filters.endDate, teacherId, audienceId),
                        $scope.structure.courses.sync($scope.structure, teacherSelected, classSelected, $scope.filters.startDate, $scope.filters.endDate)
                    ]);
                } else if (model.me.hasWorkflow(WORKFLOW_RIGHTS.accessChildData) && $scope.params.child && $scope.params.child.id) {
                    /* student/parents workflow case */
                    let groups: Groups = new Groups();
                    await groups.sync([$scope.params.child.audience.id], $scope.params.child.id);
                    await Promise.all([
                        $scope.structure.homeworks.syncChildHomeworks($scope.filters.startDate, $scope.filters.endDate, $scope.params.child.id),
                        $scope.structure.sessions.syncChildSessions($scope.filters.startDate, $scope.filters.endDate, $scope.params.child.id),
                        $scope.structure.courses.sync($scope.structure, teacherSelected, $scope.params.child.audience, $scope.filters.startDate, $scope.filters.endDate, groups)
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
                        promises.push($scope.structure.sessions.syncOwnSessions($scope.structure, $scope.filters.startDate, $scope.filters.endDate, audienceId));
                    }
                    promises.push($scope.structure.courses.sync($scope.structure, teacherId, classSelected, $scope.filters.startDate, $scope.filters.endDate));
                    await Promise.all(promises)
                }

                if (model.me.hasWorkflow(WORKFLOW_RIGHTS.accessOwnData)) {
                    await initProgressions();
                }

                // On lie les homeworks à leur session
                $scope.loadPedagogicItems();
                delete ($rootScope.session);
                delete ($rootScope.homework);
                $scope.safeApply();
            };

            async function initProgressions() {
                $scope.progressionFolders = new ProgressionFolders(model.me.userId);
                await $scope.progressionFolders.sync();
                $scope.progressionFolders.all.map((x) => {
                    if (x.id === null && x.parent_id === null) x.title = lang.translate("progression.my.folders");
                    return x;
                });
                $scope.progressionFolders.all.filter((x) => x.id);
            }

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
                $scope.loadCalendarItems();
            };

            $scope.loadCalendarItems = () => {
                $scope.dailyHomeworks = $scope.structure.homeworks.all.filter(h => !h.session_id);
                $scope.calendarItems = $scope.pedagogicItems
                    .filter(i => i.pedagogicType !== PEDAGOGIC_TYPES.TYPE_HOMEWORK)
                    .sort(function (a, b) {
                        return new Date(a.startMoment).getTime() - new Date(b.startMoment).getTime();
                    });
                $scope.safeApply();
            };

            $scope.hoverCalendarItem = ($event, item: any): void => $scope.$broadcast(CALENDAR_TOOLTIP_EVENTER.HOVER_IN, {$event, item});
            $scope.hoverOutCalendarItem = (): void => $scope.$broadcast(CALENDAR_TOOLTIP_EVENTER.HOVER_OUT);

            $scope.loadPedagogicDays = () => {
                $scope.pedagogicItems.sort(function (a, b) {
                    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
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
            
            $scope.initDisplay = (): void => {
                let nbSessionDisplayed: number = 0;
                let nbHomeworkDisplayed: number = 0;
                let indexMinChildHomework: number = $scope.pedagogicDays.length;
                let indexMaxChildHomework: number = -1;

                // hiding all the days
                $scope.pedagogicDays.map(c => {
                    c.displayed = false;
                });

                // display session
                $scope.pedagogicDays.map((c, index) => {
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
                    });
                }
            };

            $scope.selectPedagogicDay = (pedagogicDay) => {
                $scope.pedagogicDays.forEach(p => p.selected = false);
                pedagogicDay.selected = true;
                $scope.selectedPedagogicDay = pedagogicDay;
            };

            $scope.hasAtLeastOneCreateRight = () => {
                return model.me.hasWorkflow(WORKFLOW_RIGHTS.manageHomework) || model.me.hasWorkflow(WORKFLOW_RIGHTS.manageSession);
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


            $scope.getCountPublishedHomeworks = (homeworks: Homework[]): number => {
                return homeworks.filter(homework => homework.isPublished === true).length;
            };

            $scope.getCountUnpublishedHomeworks = (homeworks: Homework[]): number => {
                return homeworks.filter(homework => homework.isPublished === false).length;
            };

            $scope.publishHomework = async (item, event) => {
                event.stopPropagation();
                if (item.homeworks) {
                    for (let homework of item.homeworks) {
                        let homeworkToPublish = new Homework($scope.structure);
                        homeworkToPublish.id = homework.id;
                        $scope.toastHttpCall(await homeworkToPublish.publish());
                    }
                    $scope.syncPedagogicItems();
                    $scope.safeApply();
                }
            };

            $scope.publishSession = async (item, event) => {
                event.stopPropagation();
                let sessionToPublish = new Session($scope.structure);
                sessionToPublish.id = item.id;
                $scope.toastHttpCall(await sessionToPublish.publish());
                if (item.homeworks) {
                    $scope.publishHomework(item,event);
                } else {
                    $scope.syncPedagogicItems();
                    $scope.safeApply();
                }
            };

            $scope.openHomework = (homeworkId: number) => {
                if (model.me.hasWorkflow(WORKFLOW_RIGHTS.manageHomework)) {
                    $scope.goTo('/homework/update/' + homeworkId);
                } else {
                    $scope.goTo('/homework/view/' + homeworkId);
                }
            };

            $scope.calendarUpdateItem = (item) => {
                $scope.params.updateItem = item;
                $scope.goTo('/create');
            };

            $scope.calendarDropItem = (item) => {
                $scope.calendarUpdateItem(item);
            };

            $scope.calendarResizedItem = (item) => {
                $scope.calendarUpdateItem(item);
            };

            $scope.getDisplayDate = (date: any) => {
                return DateUtils.getDisplayDate(date);
            };


            // handle the drop event
            $scope.dropped = function (dragEl, dropEl) {
                if (dragEl == dropEl)
                    return;
                // this is your application logic, do whatever makes sense
                let progression = $('#' + dragEl);
                const typeCourse = "TYPE_COURSE";
                const typeSession = "TYPE_SESSION";

                // set progression or session id
                let progressionOrSession = angular.element(progression[0]).scope();
                let id_progressionOrSession = progressionOrSession.item ? progressionOrSession.item.id : progressionOrSession.session.id;

                let $sessionOrCourse = $('#' + dropEl);
                let typeCourseSession = "";

                // set course or session id
                let courseOrSession = angular.element($sessionOrCourse[0]).scope();
                let idCourseSession = courseOrSession.item._id ? courseOrSession.item._id : courseOrSession.item.id;

                if ($($sessionOrCourse).hasClass(typeSession)) {
                    typeCourseSession = typeSession;
                } else if ($($sessionOrCourse).hasClass(typeCourse)) {
                    typeCourseSession = typeCourse;
                }

                if (progression[0].classList.contains("progression-item-draggable")) {
                    if (typeCourseSession == typeSession) {
                        $scope.updateSession(idCourseSession, id_progressionOrSession);
                    } else if (typeCourseSession == typeCourse) {
                        let course = angular.element($sessionOrCourse[0]).scope();
                        let date = course.item.data.startDisplayDate;
                        $scope.createSessionFromProgression(id_progressionOrSession, idCourseSession, date);
                    }
                } else if ($(progression[0]).hasClass(typeSession)) {
                    if (typeCourseSession == typeSession) {
                        $scope.sessionToSession(id_progressionOrSession, idCourseSession)
                    } else if (typeCourseSession == typeCourse) {
                        let course = angular.element($sessionOrCourse[0]).scope();
                        let date = course.item.data.startDisplayDate;
                        if (progressionOrSession.item.color === pedagogicSlotProfile.HOMEWORK) {
                            // case we drag homework to empty session in order to create homework
                            $scope.homeworkToEmptySession(id_progressionOrSession, courseOrSession.item);
                        } else {
                            $scope.sessionToCourse(id_progressionOrSession, idCourseSession, date);
                        }
                    }

                }
            };

            /**
             * Handle a session drop on another session
             */
            $scope.sessionToSession = async (idSessionDrag: string, idSessionDrop: string): Promise<void> => {
                let sessionDrag: Session;
                $scope.calendarItems.map(async (session: Session) => {
                    if (session.id === idSessionDrag) {
                        sessionDrag = session;
                    }
                });
                $scope.calendarItems.map(async (session: Session) => {
                    if (session.id === idSessionDrop) {
                        $rootScope.session = session;
                    }
                });
                if (sessionDrag) {
                    sessionDrag.subject = $rootScope.session.subject;
                    sessionDrag.subject_id = $rootScope.session.subject_id;
                }
                $rootScope.session.getSessionInfo(sessionDrag);
                $rootScope.session.homeworks.forEach(homework => {
                    homework.sessions.push($rootScope.session);
                });
                $scope.goTo('/session/update/' + $rootScope.session.id);
            };

            /**
             * Handle a homework pedagogic type drop on course to create homework
             */
            $scope.homeworkToEmptySession = async (idSessionDrag: number, sessionDrop: any) => {
                let sessionDrag: any = [];
                $scope.calendarItems.map(async (session: any) => {
                    if (session.id === idSessionDrag) {
                        sessionDrag = session;
                    }
                });
                if (sessionDrag.homeworks.length === 0) {
                    let sessionHomework = new Session($scope.structure);
                    sessionHomework.id = sessionDrag.id;
                    await sessionHomework.sync();
                    prepareHomeworkRedirect(sessionDrop, sessionHomework);
                } else {
                    prepareHomeworkRedirect(sessionDrop, sessionDrag);
                }
                $scope.goTo('/homework/create');
            };

            const prepareHomeworkRedirect = (sessionDrop: any, sessionHomework: Session) => {
                if (sessionDrop.audiences.all.length !== 0) {
                    sessionHomework.homeworks[0].audience = sessionDrop.audiences.all[0];
                    sessionHomework.homeworks[0].dueDate = sessionDrop.startMoment;
                    sessionHomework.homeworks[0].session = sessionDrop;
                    sessionHomework.homeworks[0].subject = sessionDrop.subject;
                    sessionHomework.homeworks[0].id = '';
                }
                $rootScope.homework = sessionHomework.homeworks[0];
            };

            /**
             * Handle a session drop on course
             */
            $scope.sessionToCourse = async (idSession: string, idCourse: string, date: any): Promise<void> => {
                let sessionDrag: Session;
                let course = new Course($scope.structure, idCourse);

                $scope.calendarItems.map(async session => {
                    if (session.id === idSession) {
                        sessionDrag = session;
                    }
                });
                
                // Formatting date
                date = date.split('/').join('-');
                date = date.split('-');
                let tempDateYear = date[2];
                date[2] = date[0];
                date[0] = tempDateYear;
                date = date.join('-');

                // insert data and refresh calendar
                await course.sync(date, date);
                let session = new Session($scope.structure, course);
                session.setFromCourseAndSession(course, sessionDrag);
                // if I have homework, append this session to my sessions array
                if (session.homeworks.length !== 0) {
                    session.homeworks.forEach((homework: Homework) => {
                        homework.sessions.push(session);
                    });
                }
                session.opened = true;
                $rootScope.session = session;

                $scope.goTo('/session/create/' + session.courseId + '/' + DateUtils.getFormattedDate(session.startMoment));
            };

            /**
             * Handle a progression dropped on a session
             */
            $scope.updateSession = async (idSession, idProgression) => {
                let progressionDragged, sessionDroped;
                $scope.progressionFolders.all.forEach(p => {
                    p.progressionSessions.forEach(ps => {
                        if (ps.id == idProgression) {
                            progressionDragged = ps;
                        }
                    })
                });

                // progressionDragged.toSession(idSession);

                $scope.calendarItems.map(async session => {
                    if (session.id == idSession) {
                        sessionDroped = session;
                    }
                });
                sessionDroped.setFromProgression(progressionDragged);
                progressionDragged.progression_homeworks.map(
                    ph => {
                        let homework = new Homework($scope.structure);
                        homework.progression_homework_id = ph.id ? ph.id : null;
                        homework.estimatedTime = ph.estimatedTime;
                        homework.description = ph.description;
                        homework.audience = sessionDroped.audience;
                        homework.sessions.push(sessionDroped);
                        homework.subject = $scope.structure.subjects.all.find(subject => subject.id === ph.subject_id);
                        homework.type = ph.type;
                        sessionDroped.homeworks.push(homework);

                    }
                );

                $rootScope.session = sessionDroped;

                $scope.syncPedagogicItems();

                $scope.safeApply();
                $scope.goTo('/session/update/' + idSession);
            };

            /**
             * Handle a progression dropped on a course
             */
            $scope.createSessionFromProgression = async (idProgression, idCourse, date) => {
                let progressionDragged;
                let progressionSessions = $scope.progressionFolders.all.map((f) => f.progressionSessions);
                progressionSessions = [].concat.apply([], progressionSessions);
                progressionDragged = progressionSessions.find((s) => s.id == idProgression);
                let course = new Course($scope.structure, idCourse);

                // Formating date
                date = date.split('/').join('-');
                date = date.split("-");
                let tempDateAnnee = date[2];
                date[2] = date[0];
                date[0] = tempDateAnnee;
                date = date.join("-");

                //insert data and refresh calendar
                await course.sync(date, date);
                let session = new Session($scope.structure, course, progressionDragged);
                session.setFromCourse(course);
                session.opened = true;
                $rootScope.session = session;
                progressionDragged.progression_homeworks.map(
                    ph => {
                        let homework = new Homework($scope.structure);
                        homework.progression_homework_id = ph.id ? ph.id : null;
                        homework.estimatedTime = ph.estimatedTime;
                        homework.description = ph.description;
                        homework.subject = session.subject;
                        homework.type = ph.type;
                        homework.audience = session.audience ? $.extend(true, Object.create(Object.getPrototypeOf(session.audience)), session.audience) : null;
                        homework.sessions.push(session);
                        session.homeworks.push(homework);
                    }
                );
                $scope.safeApply();
                $scope.goTo('/session/create/' + session.courseId + '/' + DateUtils.getFormattedDate(session.startMoment));

            };

            const load = async () => {
                $scope.isRefreshingCalendar = true;
                await Promise.all([
                    $scope.initializeData(),
                    setTimeSlots()
                ]);
                $scope.syncPedagogicItems();
                AutocompleteUtils.init($scope.structure);
                $scope.isRefreshingCalendar = false;
                $scope.safeApply();
            };

            const initCalendar = () => {
                $scope.calendar = model.calendar;
                let calendarMode = $scope.calendar.increment;
                let momentFirstDay = moment($scope.calendar.firstDay);
                switch (calendarMode) {
                    case 'month':
                        $scope.filters.startDate = momentFirstDay.clone().startOf('month');
                        $scope.filters.endDate = momentFirstDay.clone().endOf('month');
                        break;
                    case 'week':
                        $scope.filters.startDate = momentFirstDay.clone().startOf('isoWeek');
                        if ($scope.display.listview)
                            $scope.filters.endDate = momentFirstDay.clone().endOf('isoWeek');
                        else
                            $scope.filters.endDate = moment($scope.filters.startDate).add('1', 'weeks');
                        break;
                    case 'day':
                        $scope.filters.startDate = momentFirstDay.clone().startOf('day');
                        $scope.filters.endDate = momentFirstDay.clone().endOf('day');
                        break;
                }
            };

            model.calendar.on('date-change', async () => {
                $scope.isRefreshingCalendar = true;
                initCalendar();
                await setTimeSlots();
                $scope.syncPedagogicItems();
                $scope.isRefreshingCalendar = false;
                $scope.safeApply();
            });

            $scope.$on('$destroy', () => model.calendar.callbacks['date-change'] = []);

            $scope.$on(UPDATE_STRUCTURE_EVENTS.UPDATE, () => {
                load();
            });
        }]);