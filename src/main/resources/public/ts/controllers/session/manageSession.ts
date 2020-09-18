import {idiom as lang, model, moment, ng, template, toasts} from 'entcore';
import {
    Course, Courses,
    Homework,
    HomeworkTypes, ISessionHomeworkBody, ISessionHomeworkService,
    Session, Sessions,
    SessionTypes,
    Toast,
    WorkloadDay
} from '../../model';
import {SubjectService} from "../../services";
import {AutocompleteUtils} from "../../utils/autocomplete/autocompleteUtils";
import {Moment} from 'moment';

export let manageSessionCtrl = ng.controller('manageSessionCtrl',
    ['$scope', '$rootScope', '$routeParams', '$location', '$attrs', '$filter',
        'SubjectService', 'SessionHomeworkService',
        async function ($scope, $rootScope, $routeParams, $location, $attrs, $filter,
                        SubjectService: SubjectService, sessionHomeworkService: ISessionHomeworkService) {
            $scope.isReadOnly = modeIsReadOnly();
            $scope.autocomplete = AutocompleteUtils;
            $scope.sessionChoose = lang.translate("sessions.choose");
            $scope.isInsideDiary = $attrs.insideDiary;
            $scope.session = $rootScope.session ? $rootScope.session : new Session($scope.structure);
            $scope.sessionGetter = new Sessions($scope.structure);
            $scope.courses = new Courses($scope.structure);
            $scope.subjects = $.extend(true, Object.create(Object.getPrototypeOf($scope.structure.subjects)), $scope.structure.subjects);
            $scope.homeworkTypes = new HomeworkTypes($scope.structure.id);
            $scope.sessionTypes = new SessionTypes($scope.structure.id);
            $scope.form = {
                homework: null
            };
            $scope.homeworks = [];

            $scope.session.teacher = {id: model.me.userId};
            $scope.isSelectSubjectAndAudienceSession = true;

            if ($scope.structure.audiences.all.length === 1) {
                $scope.session.audience = $scope.structure.audiences.all[0];
            }
            $scope.validate = false;
            $scope.hidePencil = false;
            $scope.oldHomework = new Homework($scope.structure);
            $scope.formIsOpened = false;

            $scope.disableFieldSetSubjectAndAudienceSession = (audience: any, subject: any) => {
                let res = !audience || !subject;
                $scope.isSelectSubjectAndAudienceSession = res;
                if (!res) $scope.session.opened = true;
            };

            $scope.isUpdateHomework = () => {
                return $scope.form.homework && ($scope.form.homework.id || $scope.form.progression_homework_id || $scope.form.editedId);
            };

            $scope.closeFormHomework = () => {
                $scope.form.homework = null;
            };

            $scope.sessionTitle = () => {
                return $scope.form.homework.sessions
                    ? $scope.form.homework.sessions.length + " " + lang.translate("sessions.selected")
                    : 0 + " " + lang.translate("sessions.selected");
            };

            $scope.sessionIsInTable = (session, tableSession) => {
                return tableSession.findIndex(s => $scope.isSameSession(s, session)) != -1;
            };

            $scope.isSameSession = (s1, s2) => {
                return s1.audience.id === s2.audience.id
                    && s1.getStartMoment().isSame(s2.getStartMoment());
            };

            $scope.isHomeworkInSession = (h, s) => {
                return h.attachedToSession && (s.date.getTime() === h.due_date ? h.due_date.getTime() : h.dueDate.getTime()) && (s.audience && h.audience ? s.audience.id === h.audience.id : false);
            };

            function modeIsReadOnly() {
                let currentPath = $location.path();
                return currentPath.includes('view') || $attrs.readOnly;
            }

            $scope.cancelCreation = () => {
                $scope.goTo("/main");
            };

            $scope.getTeacherSubjects = () => {
                return $scope.subjects.all.filter(s => s.teacherId === model.me.userId);
            };

            $scope.validDate = () => {
                return moment($scope.session.endTime).isAfter(moment($scope.session.startTime).add(14, "minutes"));
            };

            $scope.isValidForm = () => {
                return $scope.session
                    && $scope.session.subject
                    && $scope.session.type
                    && $scope.session.audience
                    && $scope.session.date
                    && $scope.session.startTime
                    && $scope.session.endTime
                    && $scope.validDate();
            };


            $scope.deleteSession = async () => {
                $scope.session.delete().then(() => {
                    if ($scope.session.homeworks.length !== 0) {
                        $scope.session.homeworks.forEach((homework: Homework) => {
                            if (homework.session_id === $scope.session.id) {
                                homework.delete();
                            }
                        });
                    }
                    toasts.confirm('session.deleted');
                    $scope.back();
                });
            };


            $scope.saveSession = async (): Promise<void> => {
                if (!$scope.isValidForm) {
                    $scope.notifications.push(new Toast('utils.unvalidForm', 'error'));
                    return;
                }
                if ($scope.form.homework) {
                    $scope.closeHomework();
                }
                // Sauvegarde de la session
                $scope.session.is_empty = false;
                let sessionSaveResponse: any = await $scope.session.save($scope.placeholder);
                if (sessionSaveResponse.succeed) {
                    if (!$scope.session.id && sessionSaveResponse.data.id) {
                        $scope.session.id = sessionSaveResponse.data.id;
                    } else if (!$scope.session.id && !sessionSaveResponse.data.id) {
                        $scope.notifications.push(new Toast('Error no id for session', 'error'));
                        return;
                    }

                    $scope.homeworks.forEach(h => h.sessions.forEach(s => {
                        if ($scope.isSameSession(s, $scope.session)) {
                            s.id = $scope.session.id;
                        }

                        if (!s.type_id) {
                            s.type_id = $scope.session.type_id ? $scope.session.type_id : $scope.session.type.id;
                        }
                    }));

                    await saveSessionHomeworks();
                }
                $scope.safeApply();
            };

            const createSessionsHomework = async () => {
                // using $scope.homeworks
                let sessionsHomework: ISessionHomeworkBody = {homeworks: $scope.homeworks.filter(h => !h.id)};
                if (sessionsHomework.homeworks.length) {
                    let response = await sessionHomeworkService.create(sessionsHomework);
                    if (response.status == 200 || response.status == 201) {
                        return true;
                    } else {
                        toasts.warning(response.data.toString());
                        return false;
                    }
                }
                return true;
            };

            const updateSessionsHomework = async () => {
                // using $scope.homeworks
                let sessionsHomework: ISessionHomeworkBody = {homeworks: $scope.homeworks.filter(h => h.id)};
                if (sessionsHomework.homeworks.length) {
                    let response = await sessionHomeworkService.update(sessionsHomework);
                    if (response.status == 200 || response.status == 201) {
                        return true;
                    } else {
                        toasts.warning(response.data.toString());
                        return false;
                    }
                }
                return true;
            };

            const saveSessionHomeworks = async (): Promise<void> => {
                Promise.all([
                    await createSessionsHomework(),
                    await updateSessionsHomework()
                ]).then((values: boolean[]) => {
                    if (values.indexOf(false) === -1) {
                        toasts.confirm('session.created');
                        $scope.back();
                    }
                });
            }

            // region Gestion des homework
            $scope.areValidHomeworks = () => {
                let back = true;
                if (!$scope.homeworks || $scope.homeworks.length == 0)
                    return back;
                $scope.session.homeworks.forEach((item) => {
                    if (!item.isDeleted)
                        return back && item.isValidForm();
                });
                return back;
            };

            $scope.deleteHomework = async (homework: Homework, i) => {
                $scope.localRemoveHomework(i);
                if (homework.id) {
                    $scope.toastHttpCall(await homework.delete());
                }
            };

            $scope.cancelHomework = () => {
                $scope.validate = false;
                $scope.hidePencil = false;
                $scope.formIsOpened = false;
                $scope.form.homework = null;
            };


            $scope.closeHomework = () => {
                $scope.validate = false;
                $scope.hidePencil = false;
                $scope.formIsOpened = false;
                let homework = $.extend(true, Object.create(Object.getPrototypeOf($scope.form.homework)), $scope.form.homework);
                homework.alreadyValidate = true;
                homework.formatDateToDisplay();
                if (!homework.idTemp && (!homework.id && !homework.progression_homework_id && !homework.editedId)) {
                    do {
                        homework.idTemp = Math.floor((Math.random() * (99999 - 10000 + 1)) + 10000);
                    } while ($scope.homeworks.includes((h) => h.idTemp === homework.idTemp));

                    $scope.homeworks.push(homework);
                } else {
                    let index = $scope.homeworks.findIndex(h => {
                        if (homework.idTemp) {
                            return h.idTemp === homework.idTemp;
                        } else if (h.progression_homework_id) {
                            return h.progression_homework_id === homework.progression_homework_id;
                        } else if (h.editedId) { // trick for drag & drop session with homeworks that will be created (to prevent form to PUT)
                            return h.editedId === homework.editedId;
                        } else {
                            return h.id === homework.id;
                        }
                    });
                    $scope.homeworks.splice(index, 1, homework);
                }
                $scope.closeFormHomework();
                $scope.safeApply();
            };

            $scope.manageHomework = async (homework = null) => {
                let newHomework = homework ? homework : new Homework($scope.structure);
                if (!homework) {
                    newHomework.audience = $scope.session.audience;
                    newHomework.subject = $scope.session.subject;
                    newHomework.session = $scope.session;
                    newHomework.isNewField = true;
                }
                newHomework.audiences = [$scope.session.audience];
                newHomework.isPublished = $scope.session.isPublished ? $scope.session.isPublished : false;
                $scope.validate = true;
                $scope.hidePencil = true;
                $scope.formIsOpened = true;
                $scope.hidePencil = true;
                $scope.form.homework = $.extend(true, Object.create(Object.getPrototypeOf(newHomework)), newHomework);
                await initHomeworkForm();

                template.open('formHomework', '/homework/homework-formPrinter');
                $scope.safeApply();
            };

            $scope.attachHomework = (toSession: boolean = null) => {
                if (!$scope.isUpdateHomework()) {
                    if (toSession !== null) {
                        $scope.form.homework.audiences = $scope.autocomplete.getClassesSelected();
                        $scope.form.homework.attachedToSession = toSession;
                    } else if (!$scope.form.homework.idTemp) {
                        $scope.form.homework.attachedToSession = true;
                    }
                }
            };

            async function initHomeworkForm() {
                $scope.attachHomework();
                if (!$scope.isUpdateHomework()) {
                    if (!$scope.form.homework.subject_id) {
                        $scope.form.homework.subject = $scope.session.subject;
                        $scope.form.homework.subject_id = $scope.session.subject ? $scope.session.subject.id : null;
                    }
                    $scope.autocomplete.init($scope.structure);
                    if ($scope.session.audience && !$scope.form.homework.sessions.length) $scope.autocomplete.classesSelected.push($scope.session.audience);
                    if ($scope.form.homework.sessions.length) {
                        let audienceSelectedIds = $scope.form.homework.sessions.map(s => s.audience.id);
                        $scope.autocomplete.classesSelected = $scope.structure.audiences.all.filter(a => audienceSelectedIds.indexOf(a.id) !== -1);
                    }
                    if ($scope.form.homework.attachedToSession) {
                        await $scope.syncSessionsAndCourses();
                    }
                    // if new homework, we set the default homeworkType
                    if (!$scope.form.homework.type) $scope.form.homework.type = $scope.homeworkTypes.all.find(ht => ht.rank > 0);
                }
                await $scope.syncWorkloadDay();
                $scope.safeApply();
                $scope.fixEditor();
            }

            $scope.syncWorkloadDay = async () => {
                if ($scope.session.audience) {
                    let date = null;
                    if (!$scope.form.homework.attachedToSession) {
                        date = $scope.form.homework.dueDate;
                    } else if ($scope.form.homework.session) {
                        date = $scope.form.homework.session.date;
                    } /*else {
                        $scope.homework.workloadDay = new WorkloadDay($scope.homework.structure, $scope.homework.audience, $scope.homework.dueDate, $scope.homework.isPublished);
                        $scope.safeApply();
                        return;
                    }*/
                    $scope.form.homework.workloadDay = new WorkloadDay($scope.form.homework.structure, $scope.form.homework.audience, $scope.form.homework.dueDate, $scope.form.homework.isPublished);
                    await $scope.form.homework.workloadDay.sync(date);
                    $scope.safeApply();
                }
                if (!$scope.form.homework.attachedToSession) {
                    $scope.form.homework.formatDateToDisplay();
                }
            };

            $scope.syncSessionsAndCourses = async () => {
                if (!$scope.form.homework.audience || !$scope.form.homework.subject || $scope.isReadOnly) return;
                $scope.sessionsToAttachTo = [];
                let startDate: Moment = moment($scope.session.date);
                let endDate: Moment = moment($scope.session.date).add(15, 'day');
                let classesSelectedIds: string[] = $scope.autocomplete.classesSelected.map(a => a.id);

                // We only keep courses selected that correspond to the new subject and audiences selected
                $scope.form.homework.sessions = $scope.form.homework.sessions.filter(session =>
                    session.subject && $scope.form.homework.subject_id === session.subject.id
                        && classesSelectedIds.indexOf(session.audience.id) != -1
                );
                $scope.sessionsToAttachTo = [...$scope.sessionsToAttachTo, ...$scope.form.homework.sessions];

                Promise.all([
                    await $scope.sessionGetter.syncOwnSessions($scope.structure, startDate, endDate, classesSelectedIds, $scope.form.homework.subject_id),
                    await $scope.courses.syncWithParams($scope.structure, [model.me.userId], $scope.autocomplete.classesSelected, startDate, endDate)
                ]).then(function () {
                    // We set subjects on courses and sessions (in case that subject courses are not set)
                    $scope.courses.all.forEach((course) => {
                        if (course.subject_id) course.subject = $scope.subjects.all.find(subject => subject.id === course.subject_id)
                    });
                    $scope.sessionGetter.all.forEach((session) => {
                        if (session.subject_id) session.subject = $scope.subjects.all.find(subject => subject.id === session.subject_id)
                    });

                    // We add in sessions selector sessions already selected
                    $scope.sessionsToAttachTo = $scope.sessionsToAttachTo.concat($scope.sessionGetter.all.filter(s => !$scope.sessionIsInTable(s, $scope.form.homework.sessions)));

                    // We only keep the courses that correspond to the new subject selected and that have not sessions corresponding,

                    let filteredCourses = $scope.courses.all.filter(c => c.subject && c.subject.id === $scope.form.homework.subject_id);
                    let courses = filteredCourses.filter(c => !($scope.sessionGetter.all.find(s => {
                        return c.date ? $scope.isSameSession(c, s) : false;
                    })));

                    // Then we transform courses as sessions (to manipulate them the same way).
                    let sessionFromCourses: Session[] = courses.map(c => new Session($scope.structure, c));
                    $scope.sessionsToAttachTo = $scope.sessionsToAttachTo.concat(sessionFromCourses);
                    $scope.sessionsToAttachTo = $scope.sessionsToAttachTo.filter(s => !$scope.isSameSession(s, $scope.session));
                    $scope.sessionsToAttachTo.push($scope.session);

                    // We remove double sessions
                    let distinctSessions = [];
                    $scope.sessionsToAttachTo.forEach((session) => {
                        if (
                            session.subject && distinctSessions.filter((distinctSession) => $scope.isSameSession(distinctSession, session)).length === 0
                            && !session.getStartMoment().isBefore($scope.session.getStartMoment())
                        ) {
                            distinctSessions.push(session);
                        }
                    });
                    $scope.sessionsToAttachTo = distinctSessions;

                    // We sort sessions in selector by audience id and then by startDate
                    $scope.sessionsToAttachTo.sort(function (a, b) {
                        return a.audience.id === b.audience.id && a.getStartMoment().unix() - b.getStartMoment().unix();
                    });

                    if (!$scope.isUpdateHomework() && (!$scope.form.homework.sessions || !$scope.form.homework.sessions.length)) {
                        // We default select next session of each audiences corresponding to the new subject selected
                        let sessionsByAudienceId: Map<String, Session[]> = new Map<String, Session[]>();
                        $scope.sessionsToAttachTo.forEach(session =>
                            sessionsByAudienceId.has(session.audience.id) ?
                                sessionsByAudienceId.get(session.audience.id).push(session)
                                : sessionsByAudienceId.set(session.audience.id, [session])
                        );

                        sessionsByAudienceId.forEach((sessions, audienceId) => {
                            if (audienceId != $scope.session.audience.id) $scope.form.homework.sessions.push(sessions[0]);
                            else if(sessions[1]) $scope.form.homework.sessions.push(sessions[1]);
                        });
                    }

                    // we set parameters / methods that display the session in the selector.
                    $scope.sessionsToAttachTo.forEach(session => {
                        if (!$scope.isSameSession(session, $scope.session)) {
                            session.toString = () => $scope.sessionString(session);
                            session.string = session.toString();
                        } else {
                            $scope.session.toString = () => {
                                return $scope.session.firstText ? $scope.session.firstText : lang.translate("todo.for.this.session")
                            };
                            $scope.session.string = $scope.session.toString();
                            $scope.session.firstText = lang.translate("session.manage.linkhomework");
                        }
                    });
                    $scope.safeApply();
                });
            };

            $scope.filterClassOptions = async (value: string): Promise<void> => {
                await $scope.autocomplete.filterClassOptions(value);
                $scope.safeApply();
            };

            $scope.selectAudience = async (model, item) => {
                $scope.autocomplete.selectClass(model, item);
                $scope.form.homework.audiences = $scope.autocomplete.getClassesSelected();
                await $scope.syncSessionsAndCourses();
                $scope.autocomplete.resetSearchFields();
                $scope.safeApply();
            };

            $scope.removeAudience = async (audience) => {
                $scope.autocomplete.removeClassSelected(audience);
                await $scope.syncSessionsAndCourses();
            };

            $scope.sessionString = (session) => {
                return session.audience.name + ' - ' + moment.weekdays(true)[moment(session.startDisplayDate, "DD/MM/YYYY").weekday()] + ' '
                    + session.startDisplayDate + ' ' + session.startDisplayTime
                    + ' - ' + session.endDisplayTime;
            };

            $scope.localRemoveHomework = (i) => {
                $scope.homeworks.splice(i, 1);
                $scope.safeApply();
            };


            $scope.updatePublishAllHomeworks = (): void => {
                for (let homework of $scope.homeworks) {
                    homework.isPublished = $scope.session.isPublished;
                    if ($scope.form.homework) {
                        $scope.form.homework.isPublished = $scope.session.isPublished;
                    }
                }
            };

            async function initData() {
                await Promise.all([
                    $scope.sessionTypes.sync(),
                    $scope.homeworkTypes.sync()
                    /*$scope.subjects.sync($scope.structure.id, model.me.userId)*/]);

                if (!$scope.session.id) {

                    if ($routeParams.id) {
                        $scope.session.id = $routeParams.id;
                        await $scope.session.sync();
                        $scope.session.opened = true;

                    } else if ($routeParams.courseId && $routeParams.date) {
                        let course = new Course($scope.structure, $routeParams.courseId);
                        await course.sync($routeParams.date, $routeParams.date);
                        await $scope.session.setFromCourse(course);
                        if ($scope.session.subject && $scope.session.audience)
                            $scope.session.opened = true;
                    }

                } else {
                    $scope.session.opened = true;
                }
                $scope.homeworks = $scope.homeworks.concat($scope.session.homeworks);

                // if new session, we set the default sessionType
                if (!$scope.session.id && !$scope.session.type) {
                    $scope.session.type = $scope.sessionTypes.all.find(ht => ht.rank > 0);
                }

                $scope.audiences = $scope.structure.audiences.all.filter(audience => model.me.classes.includes(audience.id));
                // useful for this session as an option is session selector (homework form).
                $scope.session.toString = () => {
                    return $scope.session.firstText ? $scope.session.firstText : lang.translate("todo.for.this.session")
                };
                $scope.session.string = $scope.session.toString();
                $scope.session.firstText = lang.translate("session.manage.linkhomework");


                $scope.placeholder = "Séance du " + moment($scope.session.date).format("DD/MM/YYYY");
                await initSubjects();
                $scope.safeApply();
                $scope.fixEditor();
            }

            async function initSubjects() {
                await SubjectService.getTeacherSubjects($scope.structure.id, model.me.userId).then((subjectsList) => {
                    subjectsList.filter(subjects => subjects).forEach((subject) => {
                        if (Object.keys($scope.subjects.mapping).indexOf(subject.id) === -1) {
                            $scope.subjects.all.push(subject);
                            $scope.subjects.mapping[subject.id] = subject.label;
                        } else if (subject.teacherId !== undefined) {
                            const subjectIndex = $scope.subjects.all.findIndex(s => s.id === subject.id);
                            $scope.subjects.all[subjectIndex].teacherId = subject.teacherId;
                        }
                    });
                    $scope.groupBy = (x) => x.teacherId !== undefined ? lang.translate("subjects.teacher") : lang.translate("subjects.structure");
                    if ($scope.subjects.all.length === 1 && !$scope.session.subject) {
                        $scope.session.subject = $scope.subjects.all[0];
                        if ($scope.session.audience) {
                            $scope.session.opened = true;
                        }
                    }
                });

                // if $scope.session has subject filled
                if ($scope.session.subject) {
                    const sessionSubject = $scope.subjects.all.filter(x => x.id === $scope.session.subject.id);
                    if (sessionSubject.length === 1) $scope.session.subject = sessionSubject[0];
                }
            }

            $scope.back = () => {
                $scope.autocomplete.init($scope.structure);
                window.history.back();
            };

            $scope.$on('$destroy', () => $scope.autocomplete.init($scope.structure));

            await initData();
        }]
);