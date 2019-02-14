import {Behaviours, idiom as lang, model, moment, ng} from 'entcore';
import {Course, Toast, Session, Subjects} from '../../model';
import {Homework} from '../../model/homework';

export let manageSessionCtrl = ng.controller('manageSessionCtrl',
    ['$scope', '$routeParams', '$location','$attrs', async function ($scope, $routeParams, $location, $attrs) {
        const WORKFLOW_RIGHTS = Behaviours.applicationsBehaviours.diary.rights.workflow;

        $scope.isReadOnly = modeIsReadOnly();
        $scope.isInsideDiary = $attrs.insideDiary;
        $scope.session = $scope.session ? $scope.session : new Session($scope.structure);
        $scope.session.opened = false;
        $scope.subjects = new Subjects();
        $scope.session.teacher = {id: model.me.userId};
        $scope.isSelectSubjectAndAudienceSession=true;

        $scope.disableFieldSetSubjectAndAudienceSession= (audience:any,subject:any)=>{
            if(!audience || !subject){
                $scope.isSelectSubjectAndAudienceSession=true;
            }else{
                $scope.isSelectSubjectAndAudienceSession=false;
                $scope.session.opened = ! $scope.session.opened;
            }
        }
        function modeIsReadOnly() {
            let currentPath = $location.path();
            return currentPath.includes('view') || $attrs.readOnly;
        }

        $scope.cancelCreation = () => {
            delete($scope.session);
            window.history.back();
            delete $scope.course;
        };


        $scope.$watch(() => $scope.session.audience,  () => {
            $scope.session.homeworks.forEach(h => h.audience = $scope.session.audience);
            $scope.safeApply();
        });

        $scope.$watch(() => $scope.session.subject,  () => {
            $scope.session.homeworks.forEach(h => h.subject = $scope.session.subject);
            $scope.safeApply();
        });

        $scope.openHomework = (homework: Homework) => {
            let oldValue = homework.opened;
            $scope.session.homeworks.forEach(h => h.opened = false);
            homework.opened = true;
            $scope.safeApply();
        };

        $scope.isValidForm = () => {
            let sessionFormIsValid = $scope.session
                && $scope.session.subject
                && $scope.session.audience
                && $scope.session.date
                && $scope.session.startTime
                && $scope.session.endTime;

            let homeworkFormsAreValids = true;
            for(let h of $scope.session.homeworks) {
                homeworkFormsAreValids = h.isValidForm();
                if(!homeworkFormsAreValids)
                    break;
            }

            return sessionFormIsValid && homeworkFormsAreValids;
        };

        $scope.publishSession = async () => {
            $scope.saveSession(true);
        };

        $scope.deleteSession = async () => {
            $scope.toastHttpCall(await $scope.session.delete());
            window.history.back();
        };

        $scope.unpublishSession = async () => {
            $scope.toastHttpCall(await $scope.session.unpublish());
            window.history.back();
        };

        $scope.saveSession = async () => {
            if(!$scope.isValidForm){
                $scope.notifications.push(new Toast('utils.unvalidForm', 'error'));
                return;
            }

            // Sauvegarde de la session
            let sessionSaveResponse = await $scope.session.save(  $scope.placeholder );

            if (sessionSaveResponse.succeed) {
                if(!$scope.session.id && sessionSaveResponse.data.id) {
                    $scope.session.id = sessionSaveResponse.data.id;
                } else if (!$scope.session.id && !sessionSaveResponse.data.id){
                    $scope.notifications.push(new Toast('Error no id for session', 'error'));
                    return;
                }
                await saveSessionHomeworks();

            }

            $scope.safeApply();
            window.history.back();
        };

        async function saveSessionHomeworks() {
            let hasSucceed = true;
            $scope.session.homeworks.forEach(async h => {
                if(!h.attachedToDate && h.session.courseId){
                    if ($scope.session && $scope.session.id) {
                        h.session.id = $scope.session.id;
                    }
                }
                let { succeed } = await h.save();
                if(!succeed) {
                    hasSucceed = false;
                }
            });

            return hasSucceed;
        }


        // region Gestion des homework
        $scope.areValidHomeworks = () => {
            var back = true;
            if (!$scope.session.homeworks || $scope.session.homeworks.length == 0)
                return back;
            $scope.session.homeworks.forEach((item) => {
                back = back && item.isValidForm();
            });
            return back;
        };

        $scope.addHomework = () => {
            let newHomework = new Homework($scope.structure);
            newHomework.opened = true;
            newHomework.audience = $scope.session.audience;
            newHomework.subject = $scope.session.subject;
            newHomework.session = $scope.session;
            newHomework.isNewField = true;
            $scope.session.homeworks.push(newHomework);
            $scope.openHomework(newHomework);
            $scope.safeApply();
        };

        $scope.localSyncHomework = (homework: Homework, originalHomework: Homework) => {
            let foundIndex = $scope.session.homeworks.findIndex(x => x.id == homework.id);
            if(foundIndex === -1) {
                $scope.session.homeworks.push(homework);
                $scope.session.homeworks = $scope.session.homeworks.filter(item =>  item !== originalHomework);
            } else {
                $scope.session.homeworks[foundIndex] = homework;
            }
        };
        $scope.localRemoveHomework = (indexToDeletedeletedHomework) => {
            $scope.session.homeworks.splice(indexToDeletedeletedHomework, 1);
        };


        async function initData() {
            await Promise.all([
                $scope.subjects.sync($scope.structure.id, model.me.userId)]);
             if(!$scope.session.id) {
                if ($routeParams.id) {
                    $scope.session.id = $routeParams.id;
                    await $scope.session.sync();
                    $scope.session.opened = true;
                }
                else if ($routeParams.courseId && $routeParams.date) {
                    let course = new Course($scope.structure, $routeParams.courseId);
                    await course.sync($routeParams.date, $routeParams.date);
                    $scope.session.setFromCourse(course);
                    $scope.session.opened = true;
                }
            }else{
                $scope.session.opened = true;
            }
            $scope.placeholder = "Séance du " + moment($scope.session.date).format("DD/MM/YYYY");

            $scope.safeApply();
            $scope.fixEditor();
        }

        $scope.back = () =>{
            window.history.back();
        }

        await initData();
    }]
);