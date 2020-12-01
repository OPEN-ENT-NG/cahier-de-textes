import {idiom as lang, model, moment, ng, template, toasts} from 'entcore';
import {
    Audience,
    Course, Courses,
    Homework,
    HomeworkTypes, ISessionHomeworkBody, ISessionHomeworkService,
    Session, Sessions,
    SessionTypes, Subject, Subjects,
    Toast,
    WorkloadDay
} from '../../model';
import {SearchService, SubjectService} from '../../services';
import {Moment} from 'moment';
import {FORMAT} from '../../core/const/dateFormat';
import {GroupsSearch} from '../../utils/autocomplete/groupsSearch';
import {AxiosResponse} from 'axios';
import {EXCEPTIONAL} from '../../core/const/exceptional-subject';

export let manageSessionCtrl = ng.controller('manageSessionCtrl',
    ['$scope', '$rootScope', '$routeParams', '$location', '$attrs', '$filter',
        'SubjectService', 'SessionHomeworkService', 'SearchService',
        async function ($scope, $rootScope, $routeParams, $location, $attrs, $filter,
                        SubjectService: SubjectService,
                        sessionHomeworkService: ISessionHomeworkService,
                        searchService: SearchService) {
            $scope.isReadOnly = modeIsReadOnly();
            $scope.isInsideDiary = $attrs.insideDiary;
            $scope.session = $rootScope.session ? $rootScope.session : new Session($scope.structure);
            $scope.sessionGetter = new Sessions($scope.structure);
            $scope.courses = new Courses($scope.structure);
            $scope.subjects = new Subjects();
            $scope.homeworkTypes = new HomeworkTypes($scope.structure.id);
            $scope.sessionTypes = new SessionTypes($scope.structure.id);
            $scope.form = {
                homework: null
            };
            $scope.homeworks = [];
            $scope.from_homeworks = [];

            $scope.session.teacher = {id: model.me.userId};

            if ($scope.structure.audiences.all.length === 1) {
                $scope.session.audience = $scope.structure.audiences.all[0];
            }
            $scope.validate = false;
            $scope.hidePencil = false;
            $scope.oldHomework = new Homework($scope.structure);
            $scope.formIsOpened = false; // homework form open state
            $scope.sessionFormIsOpened = false; // session form open state

            $scope.groupsSearch = new GroupsSearch($scope.structure.id, searchService);
            $scope.groupsHomeworkSearch = new GroupsSearch($scope.structure.id, searchService);

            /**
             * Open the create session form
             * @param audience Selected class or group
             * @param subject Selected subject
             */
            $scope.openSessionForm = (audience: Audience, subject: Subject): void => {
                $scope.session.opened = audience && subject;
            };

            $scope.isUpdateHomework = (): boolean => {
                return $scope.form.homework && ($scope.form.homework.id || $scope.form.progression_homework_id || $scope.form.editedId);
            };

            $scope.closeFormHomework = (): void => {
                $scope.form.homework = null;
            };

            /**
             * Returns the select session placeholder title in the homework form.
             */
            $scope.sessionTitle = (): string => {
                return $scope.form.homework.sessions
                    ? $scope.form.homework.sessions.length + ' ' + lang.translate('sessions.selected')
                    : 0 + ' ' + lang.translate('sessions.selected');
            };

            $scope.sessionIsInTable = (session, tableSession): boolean => {
                return tableSession.findIndex(s => $scope.isSameSession(s, session)) != -1;
            };

            $scope.isSameSession = (s1, s2): boolean => {
                return s1.audience.id === s2.audience.id
                    && s1.getStartMoment().isSame(s2.getStartMoment());
            };

            $scope.isHomeworkInSession = (h, s): boolean => {
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

            $scope.isValidForm = (): boolean => {
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


            /**
             * Save the session with its attached homeworks.
             * Also update future sessions linked to defined homeworks.
             */
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

                if ($scope.session.subject && $scope.session.subject.id === EXCEPTIONAL.subjectId) {
                    $scope.session.exceptional_label = $scope.session.getSubjectTitle();
                }

                let sessionSaveResponse: any = await $scope.session.save($scope.placeholder);
                if (sessionSaveResponse.succeed) {
                    if (!$scope.session.id && sessionSaveResponse.data.id) {
                        $scope.session.id = sessionSaveResponse.data.id;
                    } else if (!$scope.session.id && !sessionSaveResponse.data.id) {
                        $scope.notifications.push(new Toast('Error no id for session', 'error'));
                        return;
                    }

                    $scope.homeworks.forEach((h: Homework) => {

                        h.from_session_id = $scope.session.id;
                        h.exceptional_label = $scope.session.exceptional_label;
                        if ($scope.session.exceptional_label && !h.subject.id) {
                            h.subject.id = EXCEPTIONAL.subjectId;
                            h.subject.code = EXCEPTIONAL.subjectCode;
                        }

                        h.sessions.forEach((s: Session) => {

                            if ($scope.isSameSession(s, $scope.session)) {
                                s.id = $scope.session.id;
                            }

                            if (!s.type_id) {
                                s.type_id = $scope.session.type_id ? $scope.session.type_id : $scope.session.type.id;
                            }
                        });
                    });

                    await saveSessionHomeworks();
                }
                $scope.safeApply();
            };

            /**
             * Create defined homeworks.
             */
            const createSessionsHomework = async (): Promise<boolean> => {
                let sessionsHomework: ISessionHomeworkBody = {homeworks: $scope.homeworks.filter(h => !h.id)};
                if (sessionsHomework.homeworks.length) {
                    let response: AxiosResponse = await sessionHomeworkService.create(sessionsHomework);
                    if (response.status === 200 || response.status === 201) {
                        return true;
                    } else {
                        toasts.warning(response.data.toString());
                        return false;
                    }
                }
                return true;
            };


            /**
             * Update session homeworks.
             */
            const updateSessionsHomework = async (): Promise<boolean> => {
                let sessionsHomework: ISessionHomeworkBody = {
                    homeworks: $scope.homeworks.filter(h => h.id).concat($scope.from_homeworks.filter(h => h.id))
                };
                if (sessionsHomework.homeworks.length) {
                    let response: AxiosResponse = await sessionHomeworkService.update(sessionsHomework);
                    if (response.status === 200 || response.status === 201) {
                        return true;
                    } else {
                        toasts.warning(response.data.toString());
                        return false;
                    }
                }
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
            };

            // region Gestion des homework
            $scope.areValidHomeworks = (): boolean => {
                let back: boolean = true;
                if (!$scope.homeworks || $scope.homeworks.length === 0) {
                    return back;
                }
                $scope.session.homeworks.forEach((item) => {
                    if (!item.isDeleted) {
                        return back && item.isValidForm();
                    }
                });
                return back;
            };


            /**
             * Delete homework from view and from back.
             * @param homework homework to delete
             * @param index index of the homework in the view table.
             */
            $scope.deleteHomework = async (homework: Homework, index: number): Promise<void> => {
                if ($scope.session.id === homework.session_id) {
                    $scope.localRemoveHomework(index);
                }
                else {
                    $scope.localRemoveFromHomework(index);
                }
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


            /**
             * Save and close the homework form.
             */
            $scope.closeHomework = (): void => {
                $scope.validate = false;
                $scope.hidePencil = false;
                $scope.formIsOpened = false;
                let homework: Homework = $.extend(true, Object.create(Object.getPrototypeOf($scope.form.homework)), $scope.form.homework);
                homework.alreadyValidate = true;
                homework.formatDateToDisplay();
                if (!homework.idTemp && (!homework.id && !homework.progression_homework_id && !homework.editedId)) {
                    do {
                        homework.idTemp = Math.floor((Math.random() * (99999 - 10000 + 1)) + 10000);
                    } while ($scope.homeworks.includes((h) => h.idTemp === homework.idTemp));

                    $scope.homeworks.push(homework);
                } else {
                    let index: number = $scope.homeworks.findIndex(h => {
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

                    if ($scope.session.id === homework.session_id) {
                        $scope.homeworks.splice(index, 1, homework);
                    } else {
                        $scope.from_homeworks.splice(index, 1, homework);
                    }

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
                        $scope.form.homework.audiences = $scope.groupsHomeworkSearch.getSelectedGroups();
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

                        if ($scope.session.subject.id) {
                            $scope.form.homework.subject_id = $scope.session.subject;
                        } else {
                            $scope.form.homework.subject_id = $scope.session.subject_id ? $scope.session.subject_id : null;
                            $scope.form.subject.id = EXCEPTIONAL.subjectId;
                            $scope.form.exceptional_label = $scope.session.exceptional_label;
                        }
                    }
                    if ($scope.session.audience && !$scope.form.homework.sessions.length) $scope.groupsHomeworkSearch.selectGroup(null, $scope.session.audience);
                    if ($scope.form.homework.sessions.length) {
                        let audienceSelectedIds = $scope.form.homework.sessions.map(s => s.audience.id);
                        $scope.groupsHomeworkSearch.selectedGroups = $scope.structure.audiences.all.filter(a => audienceSelectedIds.indexOf(a.id) !== -1);
                    }
                    if ($scope.form.homework.attachedToSession) {
                        await $scope.syncSessionsAndCourses();
                    }
                    // if new homework, we set the default homeworkType
                    if (!$scope.form.homework.type) $scope.form.homework.type = $scope.homeworkTypes.all.find(ht => ht.rank > 0);
                }
                await $scope.syncWorkloadDay();
                $scope.safeApply();
                await $scope.fixEditor();
            }

            $scope.syncWorkloadDay = async () => {
                if ($scope.session.audience) {
                    let date = null;
                    if (!$scope.form.homework.attachedToSession) {
                        date = $scope.form.homework.dueDate;
                    } else if ($scope.form.homework.session) {
                        date = $scope.form.homework.session.date;
                    }
                    $scope.form.homework.workloadDay = new WorkloadDay($scope.form.homework.structure, $scope.form.homework.audience, $scope.form.homework.dueDate, $scope.form.homework.isPublished);
                    await $scope.form.homework.workloadDay.sync(date);
                    $scope.safeApply();
                }
                if (!$scope.form.homework.attachedToSession) {
                    $scope.form.homework.formatDateToDisplay();
                }
            };


            /**
             * Retrieve sessions that can be attached to based on corresponding courses and selected
             * class/group.
             */
            $scope.syncSessionsAndCourses = async (): Promise<void> => {
                $scope.sessionsToAttachTo = [];
                if (!$scope.form.homework.audience
                    || !($scope.groupsHomeworkSearch.getSelectedGroups().length > 0)
                    || $scope.isReadOnly) return;

                let startDate: Moment = moment($scope.session.date);
                let endDate: Moment = moment($scope.session.date).add(28, 'day');
                let classesSelectedIds: string[] = $scope.groupsHomeworkSearch.selectedGroups.map(a => a.id);

                // We only keep courses selected that correspond to the new subject and audiences selected
                $scope.form.homework.sessions = $scope.form.homework.sessions.filter(session =>
                    $scope.form.homework.subject_id === session.subject.id
                        && classesSelectedIds.indexOf(session.audience.id) !== -1
                );
                $scope.sessionsToAttachTo = [...$scope.sessionsToAttachTo, ...$scope.form.homework.sessions];

                Promise.all([
                    $scope.sessionGetter.syncOwnSessions($scope.structure, startDate, endDate, classesSelectedIds),
                    $scope.courses.syncWithParams($scope.structure, [model.me.userId], $scope.groupsHomeworkSearch.selectedGroups, startDate, endDate)
                ]).then(() => {

                    // We add in sessions selector sessions already selected
                    $scope.sessionsToAttachTo = $scope.sessionsToAttachTo.concat($scope.sessionGetter.all.filter(s => !$scope.sessionIsInTable(s, $scope.form.homework.sessions)));

                    // We only keep the courses that that have not sessions corresponding
                    let filteredCourses = $scope.courses.all.filter(c => c.subject);
                    let courses = filteredCourses.filter(c => !($scope.sessionGetter.all.find(s => {
                        return c.date ? $scope.isSameSession(c, s) : false;
                    })));

                    // Then we transform courses as sessions (to manipulate them the same way).
                    let sessionFromCourses: Session[] = courses.map(c => new Session($scope.structure, c));
                    $scope.sessionsToAttachTo = $scope.sessionsToAttachTo.concat(sessionFromCourses);
                    $scope.sessionsToAttachTo = $scope.sessionsToAttachTo.filter(s => !$scope.isSameSession(s, $scope.session));
                    $scope.sessionsToAttachTo.push($scope.session);

                    // We remove double sessions
                    let distinctSessions: Session[] = [];
                    $scope.sessionsToAttachTo.forEach((session: Session) => {
                        if (session.subject && distinctSessions.filter(
                            (distinctSession: Session) => $scope.isSameSession(distinctSession, session)).length === 0
                            && !session.getStartMoment().isBefore($scope.session.getStartMoment())) {

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
                            if (audienceId !== $scope.session.audience.id) $scope.form.homework.sessions.push(sessions[0]);
                            else if (sessions[1]) $scope.form.homework.sessions.push(sessions[1]);
                        });
                    }

                    // we set parameters / methods that display the session in the selector.
                    $scope.sessionsToAttachTo.forEach((session: Session) => {
                        if (!$scope.isSameSession(session, $scope.session)) {
                            session.toString = () => session.getSessionString();
                            session.string = session.toString();
                        } else {
                            $scope.session.toString = (): string => {
                                return $scope.session.firstText ? $scope.session.firstText : lang.translate('todo.for.this.session');
                            };
                            $scope.session.string = $scope.session.toString();
                            $scope.session.firstText = lang.translate('session.manage.linkhomework');
                        }
                    });
                    $scope.safeApply();
                });
            };

            /**
             * Remove the selected homework (attached to current session) from the view.
             * @param index index of the homework in the displayed table.
             */
            $scope.localRemoveHomework = (index: number): void => {
                $scope.homeworks.splice(index, 1);
                $scope.safeApply();
            };

            /**
             * Remove the selected homework (created from session) from the view.
             * @param index index of the homework in the displayed table.
             */
            $scope.localRemoveFromHomework = (index: number): void => {
                $scope.from_homeworks.splice(index, 1);
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

            /* ----------------------------
                Autocomplete search
            ---------------------------- */

            /**
             * Search a group for the session from user input.
             * @param valueInput the user input.
             */
            $scope.searchSessionAudience = async (valueInput: string): Promise<void> => {
                await $scope.groupsSearch.searchGroups(valueInput);
                $scope.safeApply();
            };

            /**
             * Search a group for the homework from user input.
             * @param valueInput the user input.
             */
            $scope.searchHomeworkAudience = async (valueInput: string): Promise<void> => {
                await $scope.groupsHomeworkSearch.searchGroups(valueInput);
                $scope.safeApply();
            };

            /**
             * Select an audience from the session audience search results.
             * @param valueInput the user input.
             * @param groupForm the selected audience.
             */
            $scope.selectSearchSessionAudience = (valueInput: string, groupForm: Audience): void => {
                $scope.groupsSearch.selectGroups(valueInput, groupForm);
                $scope.session.audience = $scope.groupsSearch.getSelectedGroups()[0]; // first element we fetch before reset
                $scope.groupsSearch.resetGroups()
                $scope.groupsSearch.group = '';
                $scope.openSessionForm($scope.session.audience, $scope.session.subject);
            };

            /**
             * Select an audience from the homework audience search results.
             * @param valueInput the user input.
             * @param groupForm the selected audience.
             */
            $scope.selectSearchHomeworkAudience = async (valueInput: string, groupForm: Audience): Promise<void> => {
                $scope.groupsHomeworkSearch.selectGroups(valueInput, groupForm);
                $scope.form.homework.audiences = $scope.groupsHomeworkSearch.getSelectedGroups();
                await $scope.syncSessionsAndCourses();
                $scope.groupsHomeworkSearch.group = '';
            };

            /**
             * Unselect the current audience for the session.
             */
            $scope.removeSearchSessionAudience = (): void => {
                $scope.session.audience = null;
                $scope.openSessionForm($scope.session.audience, $scope.session.subject);
            };

            /**
             * Remove the audience from the homework search result active filters.
             * @param audience the audience to be removed.
             */
            $scope.removeSearchHomeworkAudience = async (audience: Audience): Promise<void> => {
                $scope.groupsHomeworkSearch.removeSelectedGroups(audience);
                await $scope.syncSessionsAndCourses();
            };

            /* -------------------------- */

            /**
             * Initialize form data.
             */
            const initData = async (): Promise<void> => {
                await Promise.all([
                    $scope.sessionTypes.sync(),
                    $scope.homeworkTypes.sync(),
                    $scope.subjects.sync($scope.structure.id)
                ]);

                if (!$scope.session.id) {

                    if ($routeParams.id) {
                        $scope.session.id = $routeParams.id;
                        await $scope.session.sync();
                        $scope.session.opened = true;

                    } else if ($routeParams.courseId && $routeParams.date) {
                        let course = new Course($scope.structure, $routeParams.courseId);
                        await course.sync($routeParams.date, $routeParams.date);
                        await $scope.session.setFromCourse(course);
                        if ($scope.session.subject && $scope.session.audience) {
                            $scope.session.opened = true;
                        }
                    }

                } else {
                    $scope.session.opened = true;
                }
                $scope.sessionFormIsOpened = true;
                $scope.homeworks = $scope.homeworks.concat($scope.session.homeworks);
                $scope.from_homeworks = $scope.from_homeworks.concat($scope.session.from_homeworks);
                $scope.from_homeworks.forEach((homework: Homework) => homework.formatDateToDisplay());

                // if new session, we set the default sessionType
                if (!$scope.session.id && !$scope.session.type) {
                    $scope.session.type = $scope.sessionTypes.all.find(ht => ht.rank > 0);
                }

                $scope.audiences = $scope.structure.audiences.all.filter(audience => model.me.classes.includes(audience.id));
                // useful for this session as an option is session selector (homework form).
                $scope.session.toString = () => {
                    return $scope.session.firstText ? $scope.session.firstText : lang.translate('todo.for.this.session');
                };
                $scope.session.string = $scope.session.toString();
                $scope.session.firstText = lang.translate('session.manage.linkhomework');

                if (Object.keys($routeParams).length !== 0 && !$scope.session.audience) {
                    toasts.warning(lang.translate('session.audience.load.error'));
                }

                $scope.placeholder = lang.translate('homework.attachedToSession') + moment($scope.session.date).format(FORMAT.displayDate);

                await $scope.subjects.setLinkedTeacherById($scope.structure.id, model.me.userId);

                if ($scope.subjects.all.length === 1 && !$scope.session.subject) {
                    $scope.session.subject = $scope.subjects.all[0];
                    if ($scope.session.audience) {
                        $scope.session.opened = true;
                    }
                }

                // if $scope.session has subject filled
                if ($scope.session.subject) {
                    if (!$scope.session.subject.id && $scope.session.subject_id === EXCEPTIONAL.subjectId) {
                        $scope.session.subject.id = EXCEPTIONAL.subjectId;
                        $scope.session.subject.name = $scope.session.getSubjectTitle();
                    }
                    const sessionSubject = $scope.subjects.all.filter(x => x.id === $scope.session.subject.id);
                    if (sessionSubject.length === 1) $scope.session.subject = sessionSubject[0];
                }
                $scope.safeApply();
                await $scope.fixEditor();
            };

            $scope.back = () => {
                window.history.back();
            };

            await initData();
        }]
);