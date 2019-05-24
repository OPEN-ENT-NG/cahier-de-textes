import {idiom as lang, model, moment, ng} from 'entcore';
import {Courses, Session, Sessions, SessionTypes, Subjects, Toast} from '../../model';
import {Homework, HomeworkTypes, WorkloadWeek} from '../../model/homework';
import {Utils} from '../../utils/utils';
import {ProgressionHomework} from "../../model/Progression";

export let manageHomeworkCtrl = ng.controller('manageHomeworkCtrl',
    ['$scope', '$routeParams', '$location', '$attrs', async function ($scope, $routeParams, $location, $attrs) {
        $scope.isReadOnly = $scope.isReadOnly || modeIsReadOnly();
        $scope.isInsideDiary = $attrs.insideDiary;
        $scope.display = {
            sessionSelect : false
        }

        function modeIsReadOnly() {
            let currentPath = $location.path();
            return currentPath.includes('view');
        }
        $scope.homework ?  $scope.homework = $scope.homework : $scope.homework = new Homework($scope.structure) ;
        if($scope.structure.audiences.all.length === 1){
            $scope.homework.audience = $scope.structure.audiences.all[0];
        }
        let isInit= false;
        $scope.sessions = new Sessions($scope.structure);
        $scope.courses = new Courses($scope.structure);
        $scope.subjects = new Subjects();
        $scope.homeworkTypes = new HomeworkTypes($scope.structure.id);
        $scope.isInsideSessionForm =  $attrs.insideSessionForm;
        $scope.isSelectSubjectAndAudienceHomework = true;
        $scope.validate = false;
        $scope.sessionTypes = new SessionTypes($scope.structure.id);

        $scope.homework.opened ? $scope.homework.opened :  $scope.homework.opened=false;

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
            if($scope.isReadOnly){
                $scope.homework.opened = true;

            }
            if(!$scope.homework.audience || !$scope.homework.subject || $scope.isReadOnly) {

                return;
            }

            if (!$scope.homework.opened && !$scope.isInsideSessionForm) {
                if(!$scope.homework.id && !$scope.homework.type) {
                    $scope.homework.type = $scope.homeworkTypes.all.find(ht => ht.rank > 0);
                }
                $scope.homework.opened = true;

            }

            Promise.all([
                await $scope.sessions.syncOwnSessions($scope.structure,
                    ($scope.session)? moment($scope.session.date) : moment(),
                    ($scope.session)? moment($scope.session.date).add(15, 'day'):   moment().add(15, 'day'),
                    $scope.homework.audience.id,$scope.homework.subject.id),

                await $scope.courses.sync($scope.structure, $scope.params.user, $scope.params.group,
                    ($scope.session)? moment($scope.session.date) : moment(),
                    ($scope.session)? moment($scope.session.date).add(15, 'day'):   moment().add(15, 'day') )
            ]).then(function () {
                $scope.sessionsToAttachTo = [];
                $scope.sessionsToAttachTo = $scope.sessionsToAttachTo.concat($scope.sessions.all);
                let filteredCourses = $scope.courses.all.filter(c =>
                    c.audiences.all.find(a => (a.id === $scope.homework.audience.id) && c.subject)
                        ? c.subject.id === $scope.homework.subject.id
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
                if($scope.session || courses.length !== 0 || $scope.sessions.all.length  !== 0){
                    $scope.display.sessionSelect = true;
                }else{
                    $scope.display.sessionSelect = false;
                    $scope.attachToDate();

                }
                if ($scope.isInsideSessionForm && !$scope.homework.id) {
                    $scope.attachToSession();
                }
                $scope.safeApply();
            });
            $scope.safeApply();


        };



        function linkSession() {
            let isIndependant = true;
            $scope.sessionsToAttachTo.map(s => {
                if ($scope.session && moment(s.date).isSame(moment($scope.session.date))){
                    s.firstText = lang.translate("session.manage.linkhomework");
                    isIndependant = false;
                }

                if (moment(s.date).isSame(moment($scope.homework.session.date)))
                    $scope.homework.session = s
            })
            if(isIndependant){
                $scope.session.firstText = lang.translate("session.manage.linkhomework")
                $scope.sessionsToAttachTo.unshift($scope.session)

            }
        }

        $scope.attachToSession = () => {
            $scope.homework.attachedToDate = false;
            $scope.homework.attachedToSession = true;
            if($scope.session){
                $scope.homework.dueDate = moment($scope.session.startDate);
            }
            //
            if($scope.homework.session){
                $scope.homework.dueDate = moment($scope.homework.session.startDate);
            }

            // clearDublicateSessions($scope.sessionsToAttachTo);

            //If no session then push the current one

            //
            linkSession()
            if($scope.sessionsToAttachTo) {
                if ($scope.sessionsToAttachTo.length == 1 && $scope.homework.opened) {
                    $scope.homework.session = $scope.sessionsToAttachTo[0];

                }
                else if ($scope.sessionsToAttachTo.length > 1 && ($scope.homework.opened || $scope.homework.session.id !== $scope.session.id)) {
                    $scope.homework.session = $scope.sessionsToAttachTo[1];
                }
                else if ($scope.homework.opened && !$scope.sessionsToAttachTo.length) {
                    $scope.homework.session = undefined;

                    $scope.attachToDate();

                }
            }
            // clearDublicateSessions($scope.sessionsToAttachTo);

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
        $scope.$watch(() => $scope.homework.audience, async () => {
            if ($scope.homework.audience)
                await $scope.syncSessionsAndCourses();
            $scope.safeApply();
        });

        $scope.$watch(() => $scope.homework.subject, async () => {
            if ($scope.homework.subject)
                await $scope.syncSessionsAndCourses();
            $scope.safeApply();
        });
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
                $scope.homework.isDeleted = true;
            } else {
                let { succeed } = $scope.toastHttpCall(await $scope.homework.delete());
                if(succeed) {
                    if($scope.isInsideSessionForm){
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
            }
            else {
                // Creating session from course before saving the homework
                if(!$scope.homework.attachedToDate && !$scope.homework.session.id && $scope.homework.session.courseId){
                    if (!$scope.homework.session.type.id) {
                        $scope.homework.session.type = $scope.sessionTypes.all.find(ht => ht.rank > 0);
                    }
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
            $scope.homework.isInit = true;
            await $scope.sessionTypes.sync();

            await Promise.all([
                $scope.homeworkTypes.sync(),
                $scope.subjects.sync($scope.structure.id, model.me.userId)]);
            if( !$scope.isInsideSessionForm && $scope.subjects.all.length === 1){
                $scope.homework.subject = $scope.subjects.all[0];
                if($scope.homework.audience){
                    $scope.homework.opened = true;
                }
            }

            await $scope.syncSessionsAndCourses();

            if ($attrs.insideSessionForm) {
                $scope.homework = $scope.$parent.homework;
                $scope.isInsideSessionForm = true;
                if($scope.homework.id){
                    await $scope.homework.sync();
                }
                $scope.attachToSession();
            } else {

                $scope.homework.id = $routeParams.id ? $routeParams.id : undefined;
                if($scope.homework.id){
                    await $scope.homework.sync();
                    if ($scope.homework.session) {
                        $scope.attachToSession();
                    } else {
                        $scope.attachToDate();
                    }
                } else {
                    if($scope.sessionsToAttachTo)
                        $scope.homework.session = $scope.sessionsToAttachTo[0];
                    $scope.attachToDate();
                }
            }

            // if new homework, we set the default homeworkType
            if(!$scope.homework.id && !$scope.homework.type) {
                $scope.homework.type = $scope.homeworkTypes.all.find(ht => ht.rank > 0);
            }

            // await $scope.syncWorkloadWeek();

            $scope.safeApply();
            $scope.fixEditor();
        };

        $scope.getNbHomeworkByDay = () => {
            let nbHomework = 0;
            if($scope.sessionsToAttachTo && $scope.homework.attachedToSession) {
                $scope.sessionsToAttachTo.map(s => {
                    if ($scope.homework.session.startDisplayDate == s.startDisplayDate) {
                        s.homeworks.forEach(homework => {
                            if(!homework.opened)
                                nbHomework ++;
                        })
                    }
                });
            }
            else if ($scope.sessionsToAttachTo && $scope.homework.attachedToDate) {
                $scope.sessionsToAttachTo.map(d => {
                    if (moment($scope.homework.dueDate).format("DD/MM/YYYY") == d.startDisplayDate) {
                        nbHomework += d.homeworks.length;
                    }
                })
            }
            return nbHomework;
        };

        $scope.back = ()=>{
            $scope.homework.isDone = !$scope.homework.isDone;
            // $scope.setProgress($scope.homework);
            window.history.back();
        };
        if(!$scope.homework.isInit)
            await initData();
    }]
);