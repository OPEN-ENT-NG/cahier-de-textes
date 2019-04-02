import {idiom as lang, model, moment, ng} from 'entcore';
import {Courses, Session, Sessions, Subjects, Toast} from '../../model';
import {Homework, HomeworkTypes, WorkloadWeek} from '../../model/homework';
import {Utils} from '../../utils/utils';

export let manageHomeworkCtrl = ng.controller('manageHomeworkCtrl',
    ['$scope', '$routeParams', '$location', '$attrs', async function ($scope, $routeParams, $location, $attrs) {
        $scope.isReadOnly = $scope.isReadOnly || modeIsReadOnly();
        $scope.isInsideDiary = $attrs.insideDiary;
        function modeIsReadOnly() {
            let currentPath = $location.path();
            return currentPath.includes('view');
        }

        $scope.homework = new Homework($scope.structure);
        $scope.sessions = new Sessions($scope.structure);
        $scope.courses = new Courses($scope.structure);
        $scope.subjects = new Subjects();
        $scope.homeworkTypes = new HomeworkTypes($scope.structure.id);
        $scope.isInsideSessionForm = false;
        $scope.isSelectSubjectAndAudienceHomework = true;
        $scope.validate = false;
        $scope.homework.opened = false;

        $scope.disableFieldSetSubjectAndAudienceHomework = (audience:any,subject:any)=> {
            if(!audience || !subject){
                $scope.isSelectSubjectAndAudienceHomework=true;
            }else{
                $scope.isSelectSubjectAndAudienceHomework=false;
            }
        };

        $scope.openHomework = (homework: Homework) => {
            if($scope.isInsideSessionForm){
                $scope.$parent.openHomework(homework);
            } else {
                homework.opened = !homework.opened;
            }
            $scope.safeApply();
        };

        $scope.syncWorkloadWeek = async () => {
            if($scope.homework.audience) {
                let dateInWeek = undefined;
                if($scope.homework.attachedToDate){
                    dateInWeek = $scope.homework.dueDate;
                } else if($scope.homework.session) {
                    dateInWeek = $scope.homework.session.startMoment;
                } else {
                    $scope.homework.workloadWeek = new WorkloadWeek($scope.homework.audience);
                    $scope.safeApply();
                    return;
                }
                $scope.homework.workloadWeek = new WorkloadWeek($scope.homework.audience);
                await $scope.homework.workloadWeek.sync(dateInWeek);
                $scope.safeApply();
            }
            if($scope.homework.attachedToDate){
                $scope.homework.formatDateToDisplay();

            }


        };

        $scope.updateHomeworkData = () =>{
            $scope.homework.session_id= $scope.homework.session.id;
            $scope.homework.dueDate = $scope.homework.session.date;

        };

        $scope.syncSessionsAndCourses = async () => {
            if(!$scope.homework.audience || !$scope.homework.subject || $scope.isReadOnly) {
                return;
            }
            if (!$scope.homework.opened && !$scope.isInsideSessionForm) {
                $scope.homework.opened = true;
            }

            Promise.all([
                await $scope.sessions.syncOwnSessions($scope.structure, moment(), moment().add(15, 'day'), $scope.homework.audience.id, $scope.homework.subject.id),
                await $scope.courses.sync($scope.structure, $scope.params.user, $scope.params.group, moment(), moment().add(15, 'day'))
            ]).then(function () {
                $scope.sessionsToAttachTo = [];

                $scope.sessionsToAttachTo = $scope.sessionsToAttachTo.concat($scope.sessions.all);
                let filteredCourses = $scope.courses.all.filter(c => c.audiences.all.find(a => a.id === $scope.homework.audience.id) &&
                (c.subject) ? c.subject.id === $scope.homework.subject.id
                    : false );

                // We only keep the courses without a session attached to.
                let courses = filteredCourses.filter(c => !($scope.sessions.all.find(s => s.courseId == c._id
                    && Utils.getFormattedDate(s.startMoment) === Utils.getFormattedDate(c.startMoment))));

                let sessionFromCourses = courses.map(c => new Session($scope.structure, c));
                $scope.sessionsToAttachTo = $scope.sessionsToAttachTo.concat(sessionFromCourses);
                $scope.sessionsToAttachTo.sort(function (a, b) {
                    return new Date(a.startMoment).getTime() - new Date(b.startMoment).getTime();
                });
                // if ($scope.isInsideSessionForm) {
                //     $scope.sessionsToAttachTo.unshift($scope.$parent.session);
                //     if ($scope.$parent.session.id) {
                //         $scope.sessionsToAttachTo = $scope.sessionsToAttachTo.filter(s => s.id !== $scope.$parent.session.id);
                //     }
                // }
                if ($scope.isInsideSessionForm) {
                    $scope.attachToSession();
                }

                $scope.safeApply();
            });


        };

        function clearDublicateSessions(sessionsToAttachTo){
            sessionsToAttachTo.map(s => {
                if (!(s instanceof Session)) {
                    sessionsToAttachTo.splice(sessionsToAttachTo.indexOf(s), 1);
                    $scope.homework.session = $scope.sessionsToAttachTo[0];

                }
                if ($scope.session.id && s && s.id === $scope.session.id) {
                    s.firstText = lang.translate("session.manage.linkhomework");
                }
                if (s) {
                       sessionsToAttachTo.map(ss => {
                           if (!(s instanceof Session)) {
                               if (s.id === ss.id && sessionsToAttachTo.indexOf(ss) !== sessionsToAttachTo.indexOf(s) && sessionsToAttachTo.indexOf(ss) !== 0) {
                                   console.log("plop");
                                   sessionsToAttachTo.splice(sessionsToAttachTo.indexOf(ss), 1);
                               }
                           }
                    });
                    if(!s.id && !$scope.session.id && s.date  == $scope.session.date){
                        s.firstText = lang.translate("session.manage.linkhomework");
                    }
                }

            });

        }

        $scope.attachToSession = () => {
            $scope.homework.attachedToSession = true;
            $scope.homework.dueDate = moment($scope.session.startDate);
            $scope.homework.attachedToDate = false;
            if($scope.homework.dueDate) {
                $scope.sessionsToAttachTo.unshift($scope.homework.session);

            }

             clearDublicateSessions($scope.sessionsToAttachTo);

            //If only one session or no session then push the current one
            if ($scope.sessionsToAttachTo && $scope.sessionsToAttachTo.length < 1 && $scope.isInsideSessionForm) {

                $scope.homework.session = $scope.session;
                $scope.homework.session.firstText = lang.translate("session.manage.linkhomework");

                $scope.sessionsToAttachTo.push($scope.homework.session);
            }
            else if ($scope.sessionsToAttachTo.length == 1 ) {
                $scope.homework.session = $scope.sessionsToAttachTo[0];
            }
            else if ($scope.sessionsToAttachTo.length > 1 && $scope.homework.opened) {
                $scope.homework.session = $scope.sessionsToAttachTo[1];

            }
            else if($scope.homework.opened){
                $scope.homework.session = undefined;
                $scope.attachToDate();
            }


            $scope.safeApply();

        };

        $scope.attachToDate = () => {
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
                if(!$scope.homework.id){
                    $scope.$parent.localRemoveHomework($scope.$parent.homework.indexof($scope.homework));
                } else {
                    // Si c'est insideSessionForm et update, on resync le homework
                    await $scope.homework.sync();
                    $scope.attachToSession();
                    $scope.safeApply();
                }
            }
        };

        $scope.isValidForm = () => {
            return $scope.homework.isValidForm();
        };

        $scope.publishHomework = async () => {
            $scope.saveHomework(true);
        };

        $scope.unpublishHomework = async () => {
            let { succeed } = $scope.toastHttpCall(await $scope.homework.unpublish());
            if (succeed && !$scope.isInsideSessionForm) {
                window.history.back();
            }
        };

        $scope.deleteHomework = async (index: any) => {
            if($scope.isInsideSessionForm && !$scope.homework.id){
                $scope.homework.isDeleted=true;

            } else {
                let { succeed } = $scope.toastHttpCall(await $scope.homework.delete());
                if(true) {
                    if($scope.isInsideSessionForm){
                        $scope.homework.isDeleted=true;
                    } else {
                        window.history.back();
                    }
                }
            }
        };

        $scope.saveHomework = async (publish = false) => {
            if (!$scope.isValidForm) {
                $scope.notifications.push(new Toast(lang.translate('utils.unvalidForm'), 'error'));
            }
            else {
                // Creating session from course before saving the homework
                if(!$scope.homework.attachedToDate && !$scope.homework.session.id && $scope.homework.session.courseId){
                    let sessionSaveResponse = await $scope.homework.session.save();
                    if(sessionSaveResponse.succeed) {
                        $scope.homework.session.id = sessionSaveResponse.data.id;
                    }
                }

                let homeworkSaveResponse = await $scope.homework.save();

                if (homeworkSaveResponse.succeed) {
                    if(!$scope.homework.id && homeworkSaveResponse.data.id) {
                        $scope.homework.id = homeworkSaveResponse.data.id;
                    } else if (!$scope.homework.id && !homeworkSaveResponse.data.id){
                        $scope.notifications.push(new Toast(lang.translate("homework.manage.error.noId"), 'error'));
                        return;
                    }

                    if(publish){
                        let {succeed} = $scope.toastHttpCall(await $scope.homework.publish());
                        if(succeed){
                            $scope.homework.isPublished = true;
                        }
                    } else {
                        $scope.toastHttpCall(homeworkSaveResponse);
                    }
                }

                $scope.safeApply();
                if(!$scope.isInsideSessionForm) window.history.back();

            }
        };

        async function initData() {
            await Promise.all([
                $scope.homeworkTypes.sync(),
                $scope.subjects.sync($scope.structure.id, model.me.userId)]);
            if( $scope.subjects.all.length === 1){
                $scope.homework.subject = $scope.subjects.all[0];
            }
            if ($attrs.insideSessionForm) {
                $scope.homework = $scope.$parent.homework;
                $scope.isInsideSessionForm = true;
                if($scope.homework.id){
                    await $scope.homework.sync();
                }
                await $scope.syncSessionsAndCourses();
            } else {
                $scope.homework.id = $routeParams.id ? $routeParams.id : undefined;
                if($scope.homework.id){
                    await $scope.homework.sync();
                    await $scope.syncSessionsAndCourses();
                    if ($scope.homework.session) {
                        $scope.attachToSession();
                    } else {
                        $scope.attachToDate();
                    }
                } else {
                    $scope.attachToDate();
                }
            }

            // if new homework, we set the default homeworkType
            if(!$scope.homework.id) {
                $scope.homework.type = $scope.homeworkTypes.all.find(ht => ht.rank > 0);
            }

            await $scope.syncWorkloadWeek();

            $scope.safeApply();
            $scope.fixEditor();
        };

        $scope.back = ()=>{
            $scope.homework.isDone = !$scope.homework.isDone;
            // $scope.setProgress($scope.homework);
            window.history.back();
        };
        await initData();
    }]
);