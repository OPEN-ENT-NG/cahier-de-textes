import {idiom as lang, model, moment, ng} from 'entcore';
import {Courses, Session, Sessions, SessionTypes, Subjects, Toast} from '../../model';
import {Homework, HomeworkTypes, WorkloadDay} from '../../model/homework';
import {DateUtils} from '../../utils/dateUtils';
import indexOf = require('core-js/fn/array/index-of');

export let manageHomeworkCtrl = ng.controller('manageHomeworkCtrl',
    ['$scope', '$rootScope', '$routeParams', '$location', '$attrs',
        async function ($scope, $rootScope, $routeParams, $location, $attrs) {
        $scope.isReadOnly = $scope.isReadOnly || modeIsReadOnly();
        $scope.isInsideDiary = $attrs.insideDiary;
        $scope.display = {
            sessionSelect : false
        };

        function modeIsReadOnly() {
            let currentPath = $location.path();
            return currentPath.includes('view');
        }
        $scope.homework = $rootScope.homework ? $rootScope.homework : new Homework($scope.structure);
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

        $scope.getDisplayDate = (date: any) => {
            return DateUtils.getDisplayDate(date);
        };

        $scope.openHomework = (homework: Homework) => {
            if($scope.isInsideSessionForm){
                $scope.$parent.openHomework(homework);
            } else {
                homework.opened = !homework.opened;
            }
            $scope.safeApply();
        };

        $scope.syncWorkloadDay = async () => {
            if($scope.homework.audience) {
                let date = undefined;
                if($scope.homework.attachedToDate){
                    date = $scope.homework.dueDate;
                } else if($scope.homework.session) {
                    date = $scope.homework.session.date;
                } else {
                    $scope.homework.workloadDay = new WorkloadDay($scope.homework.structure, $scope.homework.audience, $scope.homework.dueDate, $scope.homework.isPublished);
                    $scope.safeApply();
                    return;
                }
                $scope.homework.workloadDay = new WorkloadDay($scope.homework.structure, $scope.homework.audience, $scope.homework.dueDate, $scope.homework.isPublished);
                await $scope.homework.workloadDay.sync(date);
                $scope.safeApply();
            }
            if($scope.homework.attachedToDate){
                $scope.homework.formatDateToDisplay();
            }
            $scope.safeApply();
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
                    [$scope.homework.audience.id],$scope.homework.subject.id),

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

                let courses = filteredCourses.filter(c => !($scope.sessions.all.find(s =>
                    s.courseId == c._id && DateUtils.getFormattedDate(s.startMoment) ===
                    DateUtils.getFormattedDate(c.startMoment))) && (moment(c.endCourse).isAfter(moment(c.endDate)) || moment(c.endCourse).isSame(c.endDate))
                );
                let sessionFromCourses = courses.map(c => new Session($scope.structure, c));
                $scope.sessionsToAttachTo = $scope.sessionsToAttachTo.concat(sessionFromCourses);
                $scope.sessionsToAttachTo.sort(function (a, b) {
                    return new Date(a.startMoment).getTime() - new Date(b.startMoment).getTime();
                });
                linkSession();
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


        function checkIsAfter(isAcourse: boolean,s: Session ,sessionTime) {
            if($scope.session) {
                let sessionIsACourse = s.date === s.startTime;
                let isAfter = false;


                if (moment(s.date).format("YYYY/MM/DD") === moment($scope.session.date).format("YYYY/MM/DD")
                    && moment(s.startTime).hours() * 60 + moment(s.startTime).minutes() < moment($scope.session.startTime).hours() * 60 + moment($scope.session.startTime).minutes())
                    isAfter = true;


                return isAfter;
            }else{
                return false;
            }
        }


        /*
        Clear previous session and linkToHomework current session
         */
        function linkSession() {
            let isIndependant = true;
            let isAcourse = $scope.session &&  $scope.session.date === $scope.session.startTime
            let i = 0;
            while(i < $scope.sessionsToAttachTo.length){
                let s = $scope.sessionsToAttachTo[i];
                i++
                if ($scope.session && (s.isSameSession($scope.session))
                    ||( $scope.session &&  s.id && $scope.session.id && $scope.session.id === s.id )){
                    s.firstText = lang.translate("session.manage.linkhomework")
                    isIndependant = false;
                }
                let sessionTime = moment(s.date).add(moment(s.startTime).hour(),'hours').add(moment(s.startTime).minutes(),'minutes');


                if (checkIsAfter(isAcourse, s, sessionTime)){
                    $scope.sessionsToAttachTo.splice($scope.sessionsToAttachTo.indexOf(s),1);
                    i--
                }


                if ($scope.homework.session && moment(s.date).isSame(moment($scope.homework.session.date))
                    && $scope.homework.session && moment(s.startTime).isSame(moment($scope.homework.session.startTime)))
                    $scope.homework.session = s

            }
            if(isIndependant && $scope.session && !$scope.session.id){
                $scope.session.firstText = lang.translate("session.manage.linkhomework")
                $scope.sessionsToAttachTo.unshift($scope.session)

            }

            return $scope.sessionsToAttachTo;
        }

        $scope.attachToSession = () => {

            $scope.homework.attachedToDate = false;
            $scope.homework.attachedToSession = true;
            if($scope.session){
                $scope.homework.dueDate = moment($scope.session.startDate);
            }

            if($scope.homework.session){
                $scope.homework.dueDate = moment($scope.homework.session.startDate);
            }

            // If no session in homework then push the current one
            if($scope.sessionsToAttachTo) {
                if ($scope.sessionsToAttachTo.length == 1 && ($scope.homework.opened || !$scope.homework.session)) {
                    $scope.homework.session = $scope.sessionsToAttachTo[0];
                }
                else if ($scope.sessionsToAttachTo.length > 1 && ($scope.homework.opened || !$scope.homework.session
                    || $scope.homework.session&& $scope.homework.session.id && $scope.homework.session.id !== $scope.session.id && $scope.homework.opened  )) {
                    $scope.homework.session = $scope.sessionsToAttachTo[1];
                }
                else if ($scope.homework.opened && !$scope.sessionsToAttachTo.length) {
                    $scope.homework.session = undefined;

                    $scope.attachToDate();

                }
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
                };
            }
        };

        $scope.saveHomework = async (publish = false) => {
            if (!$scope.isValidForm) {
                $scope.notifications.push(new Toast(lang.translate('utils.unvalidForm'), 'error'));
            }
            else {
                // Creating session from course before saving the homework
                // first condition checks if homework is not attachedToDate (will obviously be attached to session)
                // we set our dueDate with the session we attached to
                if(!$scope.homework.attachedToDate && !$scope.homework.session.id && $scope.homework.session.courseId){
                    $scope.homework.dueDate = $scope.homework.session.date;
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
                if($scope.homework.id) {
                    if (!$scope.homework.description) {
                        await $scope.homework.sync();
                    }
                    if ($scope.homework.session) {
                        $scope.attachToSession();
                    } else {
                        $scope.attachToDate();
                    }
                } else {
                    if($scope.sessionsToAttachTo) {
                        // if homework session has one session we try to match with sessionsToAttachTo
                        let session = $scope.sessionsToAttachTo.find(
                            session => session.startDisplayDate === $scope.homework.session.startDisplayDate
                        );
                        if (session) {
                            $scope.homework.session = session;
                        } else {
                            $scope.homework.session = $scope.sessionsToAttachTo[0];
                        }
                    } else {
                        $scope.attachToDate();
                    }
                }
            }

            // if new homework, we set the default homeworkType
            if(!$scope.homework.id && !$scope.homework.type) {
                $scope.homework.type = $scope.homeworkTypes.all.find(ht => ht.rank > 0);
            }
            await $scope.syncWorkloadDay();
            $scope.safeApply();
            $scope.fixEditor();
        }

        $scope.back = ()=>{
            window.history.back();
        };

        if(!$scope.homework.isInit)
            await initData();
    }]
);