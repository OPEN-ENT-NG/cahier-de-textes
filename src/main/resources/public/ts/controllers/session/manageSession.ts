import {_, Behaviours, idiom as lang, model, moment, ng, notify} from 'entcore';
import {Course, Notification, Session, Subjects} from '../../model';
import {Homework} from '../../model/homework';

export let manageSessionCtrl = ng.controller('manageSessionCtrl',
    ['$scope', '$routeParams', '$location','$attrs', async function ($scope, $routeParams, $location, $attrs) {
        const WORKFLOW_RIGHTS = Behaviours.applicationsBehaviours.diary.rights.workflow;
        console.log('manageSessionCtrl');

        $scope.isReadOnly = modeIsReadOnly();
        $scope.isInsideDiary = $attrs.insideDiary;

        function modeIsReadOnly() {
            let currentPath = $location.path();
            return currentPath.includes('view') || $attrs.readOnly;
        }

        $scope.session = $scope.session ? $scope.session : new Session($scope.structure);
        $scope.subjects = new Subjects();
        $scope.session.teacher = {id: model.me.userId};


        $scope.cancelCreation = () => {
            $scope.goTo('/');
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
                && $scope.session.title
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
            $scope.goTo('/');
        };

        $scope.unpublishSession = async () => {
            $scope.toastHttpCall(await $scope.session.unpublish());
            $scope.goTo('/');
        };

        $scope.saveSession = async (publish = false) => {
            if(!$scope.isValidForm){
                $scope.notifications.push(new Notification(lang.translate('utils.unvalidForm')), 'error');
                return;
            }

            // Sauvegarde de la session
            let sessionSaveResponse = await $scope.session.save();

            if (sessionSaveResponse.succeed) {
                if(!$scope.session.id && sessionSaveResponse.data.id) {
                    $scope.session.id = sessionSaveResponse.data.id;
                } else if (!$scope.session.id && !sessionSaveResponse.data.id){
                    $scope.notifications.push(new Notification('Error no id for session'), 'error');
                    return;
                }

                if(publish){
                    let sessionPublishResponse = await $scope.session.publish();
                    if(sessionPublishResponse.succeed){
                        $scope.session.isPublished = true;
                        await saveSessionHomeworks();
                    }
                    $scope.toastHttpCall(sessionPublishResponse);
                } else {
                    await saveSessionHomeworks();
                    $scope.toastHttpCall(sessionSaveResponse);
                }
            }

            $scope.safeApply();
            $scope.goTo('/');
        };

        async function saveSessionHomeworks() {
            let hasSucceed = true;
            $scope.session.homeworks.forEach(async h => {
                // Creating session from course before saving the homework
                if(!h.attachedToDate && !h.session.id && h.session.courseId){
                    let sessionSaveResponse = await h.session.save();
                    if(sessionSaveResponse.succeed) {
                        h.session.id = sessionSaveResponse.data.id;
                    }
                }
                h.isPublished = $scope.session.isPublished;
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
        $scope.localRemoveHomeworkInTable = (index: number) => {
            $scope.session.homeworks.splice(index,1);
        };
        $scope.localRemoveHomework = (deletedHomework: Homework) => {
            $scope.session.homeworks = $scope.session.homeworks.filter(item =>  item.id !== deletedHomework.id);
        };


        async function initData() {
            await Promise.all([
                $scope.subjects.sync($scope.structure.id, model.me.userId)]);

            if ($routeParams.id) {
                $scope.session.id = $routeParams.id;
                await $scope.session.sync();
            }
            else if($routeParams.courseId && $routeParams.date){
                let course = new Course($scope.structure, $routeParams.courseId);
                await course.sync($routeParams.date, $routeParams.date);
                $scope.session.setFromCourse(course);
            }
            $scope.session.opened = true;
            $scope.safeApply();
            $scope.fixEditor();
        }

        await initData();
    }]
);