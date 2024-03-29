import {idiom as lang, model, moment, ng} from 'entcore';
import {Audience, Courses, Session, Sessions, SessionTypes, Subject, Subjects, Toast} from '../../model';
import {Homework, HomeworkTypes, WorkloadDay, Course} from '../../model';
import {DateUtils} from '../../utils/dateUtils';
import {GroupsSearch} from "../../utils/autocomplete/groupsSearch";
import {SearchService} from "../../services";
import {Moment} from "moment/moment";
import {safeApply} from "../../utils/safeApply";
import {FORMAT} from "../../core/const/dateFormat";

export let manageHomeworkCtrl = ng.controller('manageHomeworkCtrl',
    ['$scope', '$rootScope', '$routeParams', '$location', '$attrs', 'SearchService',
        async function ($scope, $rootScope, $routeParams, $location, $attrs, searchService: SearchService) {
            $scope.isReadOnly = $scope.isReadOnly || modeIsReadOnly();
            $scope.isInsideDiary = $attrs.insideDiary;
            $scope.display = {
                sessionSelect: false
            };

            function modeIsReadOnly(): boolean {
                let currentPath = $location.path();
                return currentPath.includes('view');
            }

            $scope.homework = $rootScope.homework ? $rootScope.homework : new Homework($scope.structure);
            if ($scope.structure.audiences.all.length === 1) {
                $scope.homework.audience = $scope.structure.audiences.all[0];
            }
            $scope.sessions = new Sessions($scope.structure);
            $scope.courses = new Courses($scope.structure);
            $scope.subjects = new Subjects();
            $scope.homeworkTypes = new HomeworkTypes($scope.structure.id);
            $scope.isInsideSessionForm = $attrs.insideSessionForm;
            $scope.isSelectSubjectAndAudienceHomework = true;
            $scope.validate = false;
            $scope.sessionTypes = new SessionTypes($scope.structure.id);
            $scope.groupsSearch = new GroupsSearch($scope.structure.id, searchService);

            $scope.homework.opened ? $scope.homework.opened : $scope.homework.opened = false;
            $scope.homeworkFormIsOpened = false;

            $scope.disableFieldSetSubjectAndAudienceHomework = (audience: any, subject: any): void => {
                $scope.isSelectSubjectAndAudienceHomework = (!audience || !subject);
            };

            $scope.getDisplayDate = (date: any): string => {
                return DateUtils.getDisplayDate(date);
            };

            $scope.getDisplayTime = (date: any): string => {
                return DateUtils.getDisplayTime(date);
            };

            $scope.openHomework = (homework: Homework): void => {
                if ($scope.isInsideSessionForm) {
                    $scope.$parent.openHomework(homework);
                } else {
                    homework.opened = !homework.opened;
                }
                $scope.safeApply();
            };

            $scope.syncWorkloadDay = async (): Promise<void> => {
                if ($scope.homework.audience) {
                    let date = undefined;
                    if ($scope.homework.attachedToDate) {
                        date = $scope.homework.dueDate;
                    } else if ($scope.homework.session) {
                        date = $scope.homework.session.startDate;
                    } else {
                        $scope.homework.workloadDay = new WorkloadDay($scope.homework.structure, $scope.homework.audience, $scope.homework.dueDate, $scope.homework.isPublished);
                        $scope.safeApply();
                        return;
                    }
                    $scope.homework.workloadDay = new WorkloadDay($scope.homework.structure, $scope.homework.audience, $scope.homework.dueDate, $scope.homework.isPublished);
                    await $scope.homework.workloadDay.sync(date);
                    $scope.safeApply();
                }
                if ($scope.homework.attachedToDate) {
                    $scope.homework.formatDateToDisplay();
                }
                $scope.safeApply();
            };

            $scope.updateHomeworkData = (): void => {
                $scope.homework.session_id = $scope.homework.session.id;
                $scope.homework.dueDate = $scope.homework.session.date;

            };

            $scope.syncSessionsAndCourses = async (): Promise<void> => {
                if ($scope.isReadOnly) {
                    $scope.homework.opened = true;
                }
                if (!$scope.homework.audience || !$scope.homework.subject || $scope.isReadOnly) {
                    return;
                }

                if (!$scope.homework.opened && !$scope.isInsideSessionForm) {
                    if (!$scope.homework.id && !$scope.homework.type) {
                        $scope.homework.type = $scope.homeworkTypes.all.find(ht => ht.rank > 0);
                    }
                    $scope.homework.opened = true;
                }

                if (($scope.homework.subject === undefined) && ($scope.subjects.all.length > 0)) {
                    $scope.homework.subject = $scope.subjects.all.find(
                        (subject: Subject) => subject.id === $scope.homework.subject.id
                    );
                }

                let date: Moment = null;
                if ($scope.session) {
                    date = $scope.session.date ? $scope.session.date : ($scope.session.startDate ? $scope.session.startDate : null);
                }

                Promise.all([
                    await $scope.sessions.syncOwnSessions($scope.structure,
                        (date) ? moment(date) : moment(),
                        (date) ? moment(date).add(15, 'day') : moment().add(15, 'day'),
                        [$scope.homework.audience.id], $scope.homework.subject.id),

                    await $scope.courses.sync($scope.structure, $scope.params.user, $scope.params.group,
                        (date) ? moment(date) : moment(),
                        (date) ? moment(date).add(15, 'day') : moment().add(15, 'day'))
                ]).then(() => {
                    $scope.sessionsToAttachTo = [];
                    $scope.sessionsToAttachTo = $scope.sessionsToAttachTo.concat($scope.sessions.all);

                    let filteredCourses: Course[] = $scope.courses.all.filter((c: Course) =>
                        c.audiences.all.find((a: Audience) => (a.id === $scope.homework.audience.id) &&
                            (c.subject !== undefined || c.exceptionnal !== undefined))
                            ? (c.subject.id === $scope.homework.subject.id) || (c.exceptionnal && c.exceptionnal === $scope.homework.exceptional_label)
                            : false);

                    // We only keep the courses without a session attached to.
                    let courses: Course[] = filteredCourses.filter((c: Course) => !($scope.sessions.all.find((s: Session) =>
                        s.courseId == c._id && DateUtils.getFormattedDate(s.startMoment) ===
                        DateUtils.getFormattedDate(c.startMoment))) && (moment(c.endCourse).isAfter(moment(c.endDate)) || moment(c.endCourse).isSame(c.endDate))
                    );
                    let sessionFromCourses: Session[] = courses.map((c: Course) => new Session($scope.structure, c));
                    $scope.sessionsToAttachTo = $scope.sessionsToAttachTo.concat(sessionFromCourses);
                    $scope.sessionsToAttachTo.sort((a, b) => {
                        return new Date(a.startMoment).getTime() - new Date(b.startMoment).getTime();
                    });

                    if ($scope.isSessionFuture()) {
                        let initialSessionId: String = null;
                        if ($scope.homework.session)
                            initialSessionId = $scope.homework.session._id ? $scope.homework.session._id
                                : ($scope.homework.session.id ? $scope.homework.session.id : $scope.homework.session.courseId);
                        $scope.homework.session = $scope.sessionsToAttachTo
                            .find((session: Session) => {
                                if (initialSessionId) return session.courseId === initialSessionId || session.id === initialSessionId;
                                else if ($scope.homework.session_id) return session.id === $scope.homework.session_id;
                                return false;
                            });
                    }
                    if (!$scope.homework.session) {
                        $scope.attachToDate();
                    } else {
                        $scope.attachToSession();
                    }
                    if ($scope.session || courses.length !== 0 || $scope.sessions.all.length !== 0) {
                        $scope.display.sessionSelect = true;
                    } else {
                        $scope.display.sessionSelect = false;
                        $scope.attachToDate();
                    }
                    if ($scope.isInsideSessionForm && !$scope.homework.id) {
                        $scope.attachToSession();
                    }
                    safeApply($scope);
                });
            };

            $scope.isSessionFuture = (): boolean => {
                return ($scope.homework.session && $scope.homework.session.date) ?
                    //Compare if the date is in the future or if it is today
                    moment($scope.homework.session.date).format(FORMAT.formattedDate) >= moment().format(FORMAT.formattedDate) : true;
            }

            $scope.attachToSession = (): void => {

                $scope.homework.attachedToDate = false;
                $scope.homework.attachedToSession = true;
                if ($scope.session && $scope.session.startDate) {
                    $scope.homework.dueDate = moment($scope.session.startDate);
                }

                if ($scope.homework.session && $scope.homework.session.startDate) {
                    $scope.homework.dueDate = moment($scope.homework.session.startDate);
                } else if ($scope.homework.session && $scope.homework.dueDate) {
                    $scope.homework.session.date = $scope.homework.dueDate;
                }

                $scope.homework.formatDateToDisplay();

                // If no session in homework then push the current one
                if ($scope.sessionsToAttachTo) {
                    if ($scope.sessionsToAttachTo.length > 1 && !$scope.homework.session && ($scope.homework.opened
                        || $scope.homework.session && $scope.homework.session.id && $scope.homework.session.id !== $scope.session.id && $scope.homework.opened)) {
                        $scope.homework.session = $scope.sessionsToAttachTo[0];
                    } else if ($scope.homework.opened && !$scope.sessionsToAttachTo.length) {
                        $scope.homework.session = undefined;

                        $scope.attachToDate();

                    }
                }
                $scope.safeApply();
            };

            $scope.attachToDate = (): void => {
                $scope.homework.attachedToSession = false;
                $scope.homework.attachedToDate = true;
                $scope.homework.session = undefined;
                $scope.safeApply();
            };

            $scope.cancelCreation = async () => {
                if (!$scope.isInsideSessionForm) {
                    window.history.back();
                } else {
                    $scope.homework.opened = false;

                    // Si c'est insideSessionForm et create, on retire le homework de la session
                    if (!$scope.homework.id) {
                        $scope.$parent.localRemoveHomework($scope.$parent.homework.indexof($scope.homework));
                    } else {
                        // Si c'est insideSessionForm et update, on resync le homework
                        await $scope.homework.sync();
                        $scope.attachToSession();
                        $scope.safeApply();
                    }
                }
            };

            $scope.goToMain = (): void => {
                $scope.goTo("/main");
            }

            $scope.setHomeworkProgress = (homework: Homework): void => {
                if (homework.isDone)
                    $scope.notifications.push(new Toast('homework.done.notification', 'info'));
                else
                    $scope.notifications.push(new Toast('homework.todo.notification', 'info'));

                $scope.setProgress(homework);
                $scope.safeApply();
            };

            $scope.setProgress = (homework: Homework): void => {
                homework.setProgress(homework.isDone ? Homework.HOMEWORK_STATE_DONE : Homework.HOMEWORK_STATE_TODO);
            };

            $scope.$watch(() => $scope.homework.audience, async () => {
                if ($scope.homework.audience)
                    await $scope.syncSessionsAndCourses();
            });

            $scope.$watch(() => $scope.homework.subject, async () => {
                if ($scope.homework.subject)
                    await $scope.syncSessionsAndCourses();
            });
            $scope.isValidForm = () => {
                return $scope.homework.isValidForm();
            };


            $scope.deleteHomework = async (index: any) => {
                if ($scope.isInsideSessionForm && !$scope.homework.id) {
                    $scope.homework.isDeleted = true;
                } else {
                    let {succeed} = $scope.toastHttpCall(await $scope.homework.delete());
                    if (succeed) {
                        if ($scope.isInsideSessionForm) {
                            $scope.homework.isDeleted = true;
                        } else {
                            window.history.back();
                        }
                    }
                }
            };

            $scope.saveHomework = async (publish = false) => {
                if (!$scope.isValidForm) {
                    $scope.notifications.push(new Toast(lang.translate('utils.unvalidForm'), 'error'));
                } else {
                    // Creating session from course before saving the homework
                    // first condition checks if homework is not attachedToDate (will obviously be attached to session)
                    // we set our dueDate with the session we attached to
                    if (!$scope.homework.attachedToDate && !$scope.homework.session.id && $scope.homework.session.courseId) {
                        $scope.homework.dueDate = $scope.homework.session.date;
                        if (!$scope.homework.session.type || !$scope.homework.session.type.id) {
                            $scope.homework.session.type = $scope.sessionTypes.all.find(ht => ht.rank > 0);
                        }
                        let sessionSaveResponse = await $scope.homework.session.save();
                        if (sessionSaveResponse.succeed) {
                            $scope.homework.session.id = sessionSaveResponse.data.id;
                        }
                    }

                    let homeworkSaveResponse = await $scope.homework.save();

                    if (homeworkSaveResponse.succeed) {
                        if (!$scope.homework.id && homeworkSaveResponse.data.id) {
                            $scope.homework.id = homeworkSaveResponse.data.id;
                        } else if (!$scope.homework.id && !homeworkSaveResponse.data.id) {
                            $scope.notifications.push(new Toast(lang.translate("homework.manage.error.noId"), 'error'));
                            return;
                        }

                        if (publish) {
                            let {succeed} = $scope.toastHttpCall(await $scope.homework.publish());
                            if (succeed) {
                                $scope.homework.isPublished = true;
                            }
                        } else {
                            $scope.toastHttpCall(homeworkSaveResponse);
                        }
                    }
                    $scope.safeApply();
                    if (!$scope.isInsideSessionForm) window.history.back();
                }
            };

            $scope.isHomeworkOwner = (): boolean =>
                $scope.homework &&
                ($scope.homework.id == null ||
                    $scope.homework.teacher && $scope.homework.teacher.id === model.me.userId);

            /**
             * Initialize form data.
             */
            const initData = async (): Promise<void> => {
                if (!($scope.session instanceof Session))
                    $scope.session = new Session($scope.structure, $scope.session);
                $scope.homework.isInit = true;
                await Promise.all([
                    $scope.sessionTypes.sync(),
                    $scope.homeworkTypes.sync(),
                    $scope.subjects.sync($scope.structure.id)
                ]);
                if (!$scope.isInsideSessionForm && $scope.subjects.all.length === 1) {
                    $scope.homework.subject = $scope.subjects.all[0];
                    if ($scope.homework.audience) {
                        $scope.homework.opened = true;
                    }
                }

                await $scope.syncSessionsAndCourses();

                if ($attrs.insideSessionForm) {
                    $scope.homework = $scope.$parent.homework;
                    $scope.isInsideSessionForm = true;
                    if ($scope.homework.id) {
                        await $scope.homework.sync();
                    }
                    $scope.attachToSession();
                } else {

                    $scope.homework.id = $routeParams.id ? $routeParams.id : undefined;
                    if ($scope.homework.id) {
                        if (!$scope.homework.description) {
                            await $scope.homework.sync();
                        }
                        if ($scope.homework.session) {
                            $scope.attachToSession();
                        } else {
                            $scope.attachToDate();
                        }
                    } else {
                        if ($scope.sessionsToAttachTo) {
                            // if homework session has one session we try to match with sessionsToAttachTo
                            let session: any = $scope.homework.session ? $scope.sessionsToAttachTo.find((session: Session) =>
                                session.startDisplayDate === $scope.homework.session.startDisplayDate) : null;

                            if (($scope.homework.session && !$scope.homework.session.exceptional_label) || !$scope.homework.session) {
                                if (session) {
                                    $scope.homework.session = session;
                                } else if ($scope.sessionsToAttachTo.length > 0) {
                                    $scope.homework.session = $scope.sessionsToAttachTo[0];
                                }
                            } else if ($scope.homework.session && $scope.homework.session.exceptional_label) {
                                $scope.sessionsToAttachTo[0] = $scope.homework.session;
                            }

                        } else {
                            $scope.attachToDate();
                        }
                    }
                    if (!$scope.homework.id || ($scope.homework && $scope.homework.workloadDay &&
                        $scope.homework.workloadDay.dueDate &&
                        moment($scope.homework.workloadDay.dueDate).format(FORMAT.formattedDate) >= moment().format(FORMAT.formattedDate))) {
                        $scope.homework.editable = true;
                    }
                }

                // if new homework, we set the default homeworkType
                if (!$scope.homework.id && !$scope.homework.type) {
                    $scope.homework.type = $scope.homeworkTypes.all.find(ht => ht.rank > 0);
                }

                await Promise.all([
                    $scope.syncWorkloadDay(),
                    $scope.subjects.setLinkedTeacherById($scope.structure.id, model.me.userId)
                ]);
                $scope.subjects.sort();
                $scope.homeworkFormIsOpened = true;
                $scope.safeApply();
                await $scope.fixEditor();
            }

            /* ----------------------------
                Autocomplete search
            ---------------------------- */

            /**
             * Search a group for the session from user input.
             * @param valueInput the user input.
             */
            $scope.searchAudience = async (valueInput: string): Promise<void> => {
                await $scope.groupsSearch.searchGroups(valueInput);
                $scope.safeApply();
            };

            /**
             * Select an audience from the session audience search results.
             * @param valueInput the user input.
             * @param groupForm the selected audience.
             */
            $scope.selectSearchAudience = (valueInput: string, groupForm: Audience): void => {
                $scope.groupsSearch.selectGroups(valueInput, groupForm);
                $scope.homework.audience = $scope.groupsSearch.getSelectedGroups().length > 0 ?
                    $scope.groupsSearch.getSelectedGroups()[0] : null; // first element we fetch before reset
                $scope.groupsSearch.resetGroups();
                $scope.groupsSearch.group = '';
                $scope.syncSessionsAndCourses();
                $scope.homework.session = undefined;
                $scope.disableFieldSetSubjectAndAudienceHomework($scope.homework.audience, $scope.homework.subject);
            };

            $scope.removeSearchAudience = (): void => {
                $scope.groupsSearch.resetSelectedGroups();
                $scope.homework.audience = null;
            };

            $scope.back = () => {
                window.history.back();
            };

            if (!$scope.homework.isInit)
                await initData();
        }]
);