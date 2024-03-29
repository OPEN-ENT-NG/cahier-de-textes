import {_, angular, Behaviours, idiom as lang, model, moment, ng} from 'entcore';
import {
    Audience,
    Course,
    Homework,
    PEDAGOGIC_TYPES,
    Session,
    Structure,
    Structures, Student,
    Subject, Teacher,
    Workload
} from '../../model';
import {DateUtils} from '../../utils/dateUtils';
import {AutocompleteUtils} from '../../utils/autocomplete/autocompleteUtils';
import {ProgressionFolder, ProgressionFolders, ProgressionHomework, ProgressionSession} from '../../model/Progression';
import {
    CourseService,
    GroupService, SearchItem,
    StructureService,
    StructureSlot
} from '../../services';
import {CHILD_EVENTS, STRUCTURES_EVENTS, UPDATE_STRUCTURE_EVENTS} from '../../core/enum/events';
import {CALENDAR_TOOLTIP_EVENTER} from '../../core/const/calendar-tooltip-eventer';
import {FORMAT} from '../../core/const/dateFormat';
import {EXCEPTIONAL} from '../../core/const/exceptional-subject';
import {MobileUtils} from "../../utils/mobile";
import {IAngularEvent} from "angular";
import {UserUtils} from "../../utils/user.utils";
import {DAY_OF_WEEK} from "../../core/enum/dayOfWeek.enum";
import {Group, Groups} from "../../model/group";

declare let window: any;

export let calendarController = ng.controller('CalendarController',
    ['$scope', '$rootScope', 'route', '$location', 'StructureService', 'GroupService', 'CourseService',
        async function ($scope, $rootScope, route, $location, StructureService: StructureService, groupService: GroupService,
                        courseService: CourseService) {
            $scope.userUtils = UserUtils;
            $scope.display = {
                homeworks: true,
                sessions: true,
                listView: false,
                progression: false,
                sessionList: true,
                listViewArea: {
                    filter: !MobileUtils.isMobile(),
                    structure: !MobileUtils.isMobile(),
                    children: !MobileUtils.isMobile()
                }
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

            $scope.timeSlot = {
                slots: null
            };

            $scope.filters = {
                startDate: moment().startOf('isoWeek').toDate(),
                endDate: moment().endOf('isoWeek').toDate()
            };
            model.calendar.setDate(
                moment().day() === DAY_OF_WEEK.SUNDAY
                    ? moment().add(1, 'week').startOf('week')
                    : moment()
            );

            $scope.transformDateToFrenchDate = (date: Date) => {
                return moment(date).format("dddd D MMMM YYYY");
            };

            const setTimeSlots = async () => {
                await initTimeSlots();
                $scope.safeApply();
            };

            $scope.createHomeworksLoop = function (pedagogicItem) {
                $scope.homeworks = !pedagogicItem.homeworks ? [pedagogicItem] : pedagogicItem.homeworks;
            };

            const initTimeSlots = async () => {
                let structureId: string = null;
                if (window.structure) structureId = window.structure.id;
                else if ($scope.structure) structureId = $scope.structure.id;
                const structure_slots: StructureSlot = structureId ? await StructureService.getSlotProfile(structureId) : null;

                if (structure_slots && structure_slots.slots &&
                    structure_slots.slots.length > 0 && Object.keys(structure_slots).length > 0) {
                    $scope.timeSlot.slots = structure_slots.slots;
                    model.calendar.setTimeslots($scope.timeSlot.slots);
                } else {
                    $scope.timeSlot.slots = null;
                }
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

            $scope.selectClass = async (model, item: SearchItem) => {
                let groups: Groups = new Groups(await groupService.initGroupsFromClassIds([item.id]));
                if (!groups || !groups.all || groups.all.length == 0) groups = new Groups([Group.setFromSearchItem(item)]);
                AutocompleteUtils.setClassesSelected($scope.structure.audiences.getAudiencesFromGroups(groups));
                AutocompleteUtils.resetSearchFields();
                await $scope.syncPedagogicItems();
            };

            $scope.setClasses = async (audiences: Audience[]): Promise<void> => {
                AutocompleteUtils.setClassesSelected(audiences);
                await $scope.syncPedagogicItems();
            }

            $scope.removeTeacher = async (value) => {
                AutocompleteUtils.removeTeacherSelected(value);
                await $scope.syncPedagogicItems();
            };

            $scope.syncPedagogicItems = async (firstRun?: boolean) => {
                if ($scope.structure) {
                    $scope.structure.homeworks.all = [];
                    $scope.structure.sessions.all = [];
                    $scope.structure.courses.all = [];
                }
                $scope.progressionFolders.all = [];
                const teacherSelected: Teacher = !!AutocompleteUtils.getTeachersSelected() &&
                AutocompleteUtils.getTeachersSelected().length > 0 ? AutocompleteUtils.getTeachersSelected()[0] : null;

                const audiencesSelected: Audience[] = AutocompleteUtils.getClassesSelected() != undefined ?
                    AutocompleteUtils.getClassesSelected() : [];
                let audienceIds: string[] = audiencesSelected ? audiencesSelected.filter((audience: Audience) => !!audience.id)
                    .map((audience: Audience) => audience.id) : null;
                /* personal workflow case */
                if ((model.me.hasWorkflow(WORKFLOW_RIGHTS.diarySearch) && model.me.hasWorkflow(WORKFLOW_RIGHTS.accessExternalData))
                    && !UserUtils.amITeacher() && !UserUtils.amIStudentOrParent() &&
                    ((teacherSelected && teacherSelected.id) || (audiencesSelected && !!audiencesSelected.length))) {
                    let teachers: Teacher[] = (teacherSelected && teacherSelected.id) ? [teacherSelected] : [];
                    let teacherId: string = teachers[0] ? teachers[0].id : null;
                    let result: any[] = await Promise.all([
                        courseService.initCourses($scope.structure, $scope.filters.startDate, $scope.filters.endDate, teachers, audiencesSelected),
                        $scope.structure.homeworks.syncExternalHomeworks($scope.filters.startDate, $scope.filters.endDate, teacherId, audienceIds),
                        $scope.structure.sessions.syncExternalSessions($scope.filters.startDate, $scope.filters.endDate, teacherId, audienceIds)
                    ]);
                    $scope.structure.setCourses(<Course[]>result[0]);
                } else if (model.me.hasWorkflow(WORKFLOW_RIGHTS.accessChildData) && $scope.params.child && $scope.params.child.id) {
                    /* parents workflow case */
                    let result: any[] = await Promise.all([
                        courseService.initCoursesFromStudents($scope.structure, [$scope.params.child.id], $scope.filters.startDate, $scope.filters.endDate),
                        $scope.structure.homeworks.syncChildHomeworks($scope.filters.startDate, $scope.filters.endDate, $scope.params.child.id),
                        $scope.structure.sessions.syncChildSessions($scope.filters.startDate, $scope.filters.endDate, $scope.params.child.id),
                    ]);
                    $scope.structure.setCourses(<Course[]>result[0]);
                } else if (model.me.hasWorkflow(WORKFLOW_RIGHTS.accessOwnData)) {
                    /* teacher/student workflow case */
                    let teachers: Teacher[] = null;
                    let teacherId: string = null;
                    if (UserUtils.amITeacher()) {
                        if ((teacherSelected && teacherSelected.id) || (audienceIds && audienceIds.length > 0))
                            teachers = (teacherSelected && teacherSelected.id) ? [teacherSelected] : [];
                        else teachers = [new Teacher().setFromMe()];
                        teacherId = teachers[0] ? teachers[0].id : null;
                    }

                    const promises: Promise<any>[] = [];
                    promises.push(
                        UserUtils.amIStudent() ?
                            courseService.initCoursesFromStudents($scope.structure, [model.me.userId], $scope.filters.startDate, $scope.filters.endDate) :
                            courseService.initCourses($scope.structure, $scope.filters.startDate, $scope.filters.endDate, teachers, audiencesSelected)
                    );
                    if (UserUtils.amITeacher() && teacherId != model.me.userId) {
                        promises.push($scope.structure.homeworks.syncExternalHomeworks($scope.filters.startDate, $scope.filters.endDate, teacherId, audienceIds));
                        promises.push($scope.structure.sessions.syncExternalSessions($scope.filters.startDate, $scope.filters.endDate, teacherId, audienceIds));
                    } else {
                        promises.push($scope.structure.homeworks.syncOwnHomeworks($scope.structure, $scope.filters.startDate, $scope.filters.endDate,
                            null, null, audienceIds));
                        promises.push($scope.structure.sessions.syncOwnSessions($scope.structure, $scope.filters.startDate, $scope.filters.endDate, audienceIds));
                    }

                    let result: any[] = await Promise.all(promises);
                    $scope.structure.setCourses(<Course[]>result[0]);
                }

                if (model.me.hasWorkflow(WORKFLOW_RIGHTS.accessOwnData)) {
                    await initProgressions();
                }

                // On lie les homeworks à leur session
                if ($scope.structure) $scope.loadPedagogicItems();
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

            $scope.loadPedagogicItems = (): void => {
                $scope.pedagogicItems = [];
                $scope.structure.notPublishedSessions = [];
                $scope.pedagogicItems = _.map($scope.structure.homeworks.all, (item) => {
                    if (item instanceof Homework) {
                        item["homeworks"] = [item];
                    }
                    return item;
                });
                if (DateUtils.isAChildOrAParent(model.me.type)) {
                    $scope.structure.sessions.all.map((s: Session, i: number) => {
                        if (!s.isPublished) {
                            $scope.structure.notPublishedSessions.push(s);
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
                $scope.loadCalendarItems();
            };

            $scope.loadCalendarItems = (): void => {
                $scope.dailyHomeworks = $scope.structure.homeworks.all.filter((h: Homework) => !h.session_id);

                if (UserUtils.amIStudentOrParent()) {
                    for (let h of $scope.structure.homeworks.all) {

                        let matchingSession: Session = $scope.structure.notPublishedSessions
                            .find((s: Session): boolean => s.id === h.session_id);

                        if (matchingSession !== undefined && $scope.structure.sessions.all
                            .find((s: Session) => s.id === matchingSession.id) === undefined) {
                            matchingSession.setToUnpublishedWithHomework();
                            $scope.structure.sessions.all.push(matchingSession);
                            $scope.pedagogicItems.push(matchingSession);

                            $scope.pedagogicItems = $scope.pedagogicItems
                                .filter((item: any): boolean => (item.pedagogicType === PEDAGOGIC_TYPES.TYPE_COURSE
                                    && !($scope.structure.sessions.all.find((s: Session) => s.courseId === item._id)))
                                    || item.pedagogicType !== PEDAGOGIC_TYPES.TYPE_COURSE);
                        }
                    }
                }

                $scope.calendarItems = $scope.pedagogicItems
                    .filter((i: Homework): boolean => i.pedagogicType !== PEDAGOGIC_TYPES.TYPE_HOMEWORK)
                    .sort((a: any, b: any): number => {
                        return new Date(a.startMoment).getTime() - new Date(b.startMoment).getTime();
                    });
                $scope.safeApply();
            };

            $scope.hoverCalendarItem = ($event, item: any): void => $scope.$broadcast(CALENDAR_TOOLTIP_EVENTER.HOVER_IN, {
                $event,
                item
            });
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

            $scope.isSessionOwner = (session: Session): boolean =>
                session && session.teacher && session.teacher.id === model.me.userId;

            $scope.openSession = (session: Session) => {
                if (model.me.hasWorkflow(WORKFLOW_RIGHTS.manageSession) && $scope.isSessionOwner(session)) {
                    $scope.goTo('/session/update/' + session.id);
                } else {
                    $scope.goTo('/session/view/' + session.id);
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
                    $scope.publishHomework(item, event);
                } else {
                    $scope.syncPedagogicItems();
                    $scope.safeApply();
                }
            };

            $scope.isHomeworkOwner = (homework: Homework): boolean =>
                homework && homework.teacher && homework.teacher.id === model.me.userId;

            $scope.openHomework = (homework: Homework) => {
                if (model.me.hasWorkflow(WORKFLOW_RIGHTS.manageHomework) && $scope.isHomeworkOwner(homework)) {
                    $scope.goTo('/homework/update/' + homework.id);
                } else {
                    $scope.goTo('/homework/view/' + homework.id);
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
            $scope.dropped = (dragEl: string, dropEl: string) => {
                if (dragEl === dropEl) {
                    return;
                }
                // this is your application logic, do whatever makes sense
                let progression: JQuery = $('#' + dragEl);
                const typeCourse: string = 'TYPE_COURSE';
                const typeSession: string = 'TYPE_SESSION';

                // set progression or session id
                let progressionOrSession = angular.element(progression[0]).scope();
                let id_progressionOrSession: string = progressionOrSession.item ? progressionOrSession.item.id : progressionOrSession.session.id;

                let $sessionOrCourse: JQuery = $('#' + dropEl);
                let typeCourseSession: string = '';

                // set course or session id
                let courseOrSession = angular.element($sessionOrCourse[0]).scope();

                if (!courseOrSession || !courseOrSession.item || !courseOrSession.item.data || !courseOrSession.item.data.startDisplayDate) {
                    return;
                }

                let courseDate: string = courseOrSession.item.data.startDisplayDate;

                let idCourseSession: string = courseOrSession.item._id ? courseOrSession.item._id : courseOrSession.item.id;

                if ($($sessionOrCourse).hasClass(typeSession)) {
                    typeCourseSession = typeSession;
                } else if ($($sessionOrCourse).hasClass(typeCourse)) {
                    typeCourseSession = typeCourse;
                }

                if (progression[0].classList.contains('progression-item-draggable')) {
                    if (typeCourseSession === typeSession) {
                        $scope.updateSession(idCourseSession, id_progressionOrSession);
                    } else if (typeCourseSession === typeCourse) {
                        $scope.createSessionFromProgression(id_progressionOrSession, idCourseSession, courseDate);
                    }
                } else if ($(progression[0]).hasClass(typeSession)) {
                    if (typeCourseSession === typeSession) {
                        $scope.sessionToSession(id_progressionOrSession, idCourseSession);
                    } else if (typeCourseSession === typeCourse) {
                        if (progressionOrSession.item.is_empty) {
                            // case we drag homework to empty session in order to create homework
                            $scope.homeworkToEmptySession(id_progressionOrSession, courseOrSession.item, idCourseSession, courseDate);
                        } else {
                            $scope.sessionToCourse(id_progressionOrSession, idCourseSession, courseDate);
                        }
                    }

                }
            };

            /**
             * Handle a session drop on another session
             */
            $scope.sessionToSession = async (idSessionDrag: number, idSessionDrop: number): Promise<void> => {
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
                $rootScope.session.homeworks.forEach((homework: Homework) => {
                    homework.session_id = idSessionDrop;
                    homework.sessions.push($rootScope.session);
                });
                $scope.goTo('/session/update/' + $rootScope.session.id);
            };

            /**
             * Handle a homework pedagogic type drop on course to create homework
             */
            $scope.homeworkToEmptySession = async (idSessionDrag: number, sessionDrop: any, idCourse: string, date: string) => {
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
                    await prepareHomeworkRedirect(sessionDrop, sessionHomework, idCourse, date);
                } else {
                    await prepareHomeworkRedirect(sessionDrop, sessionDrag, idCourse, date);
                }
                $scope.goTo('/homework/create');
            };

            const prepareHomeworkRedirect = async (sessionDrop: any, sessionHomework: Session, idCourse: string, date: string) => {
                let course: Course = await syncCourseFromDate(idCourse, date);
                let homework: Homework = sessionHomework.homeworks[0];

                homework.courseId = course._id;
                homework.subject = new Subject();
                if (course.exceptionnal) {
                    homework.subject.id = EXCEPTIONAL.subjectId;
                    homework.subject.label = EXCEPTIONAL.subjectCode;
                    homework.exceptional_label = course.exceptionnal;
                } else {
                    homework.subject.id = course.subject ? course.subject.id : null;
                    homework.subject.label = course.subject.name ? course.subject.name : course.subject.label;
                }
                homework.audience = course.audiences.all[0];
                homework.dueDate = sessionDrop.startMoment;
                homework.session = sessionDrop;
                homework.id = '';
                $rootScope.session = sessionDrop;
                $rootScope.homework = homework;
            };

            /**
             * Handle a session drop on course
             */
            $scope.sessionToCourse = async (idSession: string, idCourse: string, date: string): Promise<void> => {
                let sessionDrag: Session;
                let course: Course = await syncCourseFromDate(idCourse, date);

                $scope.calendarItems.map(async session => {
                    if (session.id === idSession) {
                        sessionDrag = session;
                    }
                });

                // insert data and refresh calendar
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

            const syncCourseFromDate = async (idCourse: string, date: string): Promise<Course> => {
                let course = new Course($scope.structure, idCourse);
                date = DateUtils.getFormattedDate(date, FORMAT['DAY/MONTH/YEAR']);
                await course.sync(date, date);
                return course;
            };

            /**
             * Handle a progression dropped on a session
             */
            $scope.updateSession = async (idSession, idProgression) => {
                let progressionDragged: ProgressionSession = [].concat.apply([],
                    $scope.progressionFolders.all.map((folder: ProgressionFolder) => folder.progressionSessions)
                )
                    .find((session: ProgressionSession) => session.id === idProgression)

                let sessionDroped = $scope.calendarItems.find((session: any) => session.id === idSession);
                if (sessionDroped && progressionDragged) {
                    sessionDroped.setFromProgression(progressionDragged);
                    progressionDragged.progression_homeworks.map(
                        (ph: ProgressionHomework) => {
                            let homework = new Homework($scope.structure);
                            homework.progression_homework_id = ph.id ? ph.id : null;
                            homework.estimatedTime = ph.estimatedTime;
                            homework.description = ph.description;
                            homework.audience = sessionDroped.audience;
                            homework.subject = sessionDroped.subject;
                            homework.sessions.push(sessionDroped);
                            sessionDroped.homeworks.push(homework);

                        }
                    );

                    $rootScope.session = sessionDroped;

                    $scope.syncPedagogicItems();

                    $scope.safeApply();
                    $scope.goTo('/session/update/' + idSession);
                }
            };

            /**
             * Handle a progression dropped on a course
             */
            $scope.createSessionFromProgression = async (idProgression: string, idCourse: string, date: string) => {
                let progressionDragged;
                let progressionSessions = $scope.progressionFolders.all.map((f) => f.progressionSessions);
                progressionSessions = [].concat.apply([], progressionSessions);
                progressionDragged = progressionSessions.find((s) => s.id == idProgression);
                let course: Course = await syncCourseFromDate(idCourse, date);

                let session = new Session($scope.structure, course, progressionDragged);
                await session.setFromCourse(course);
                session.opened = true;
                $rootScope.session = session;
                progressionDragged.progression_homeworks.map(
                    ph => {
                        let homework = new Homework($scope.structure);
                        homework.progression_homework_id = ph.id ? ph.id : null;
                        homework.estimatedTime = ph.estimatedTime;
                        homework.description = ph.description;
                        homework.subject = session.subject;
                        homework.audience = session.audience ? $.extend(true, Object.create(Object.getPrototypeOf(session.audience)), session.audience) : null;
                        homework.sessions.push(session);
                        session.homeworks.push(homework);
                    }
                );
                $scope.safeApply();
                $scope.goTo('/session/create/' + session.courseId + '/' + DateUtils.getFormattedDate(session.startMoment));

            };

            $scope.isShownSidebar = (): boolean =>
                UserUtils.amIStudentOrParent() || UserUtils.amITeacher() || AutocompleteUtils.getClassesSelected().length > 0;


            const load = async () => {
                if ($scope.structure) {
                    $scope.isRefreshingCalendar = true;
                    await Promise.all([
                        $scope.initializeData(),
                        setTimeSlots()
                    ]);
                    $scope.syncPedagogicItems();
                    AutocompleteUtils.init($scope.structure);
                    $scope.isRefreshingCalendar = false;
                }
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
                if ($scope.structure) $scope.syncPedagogicItems();
                $scope.isRefreshingCalendar = false;
                $scope.safeApply();
            });

            $scope.$on('$destroy', () => model.calendar.callbacks['date-change'] = []);

            $scope.$on(UPDATE_STRUCTURE_EVENTS.UPDATE, (event: IAngularEvent, structure: Structure) => {
                if (structure) $scope.structure = structure;
                load();
            });

            $scope.$on(CHILD_EVENTS.UPDATED, (event: IAngularEvent, student: Student) => {
                if (student) $scope.params.child = student;
                if ($scope.params.child.structureId != $scope.structure.id)
                    $scope.$emit(UPDATE_STRUCTURE_EVENTS.TO_UPDATE, $scope.params.child.structureId)
                else
                    load()
            });

            $scope.$on(STRUCTURES_EVENTS.UPDATED, async (event: IAngularEvent, structures: Structures) => {
                if (structures) $scope.structures = structures;
            });

        }]);