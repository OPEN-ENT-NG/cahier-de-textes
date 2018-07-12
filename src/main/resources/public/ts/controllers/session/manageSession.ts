import { ng, _, model, moment, Behaviours, notify, idiom as lang } from 'entcore';
import { Subjects, Notification } from '../../model';
import {Session} from "../../model";
import {Visa} from '../../model/visa';
import {Homework} from '../../model/homework';

export let manageSessionCtrl = ng.controller('manageSessionCtrl',
    ['$scope', '$routeParams', '$location', function ($scope, $routeParams, $location) {
        const WORKFLOW_RIGHTS = Behaviours.applicationsBehaviours.diary.rights.workflow;

        $scope.isReadOnly = modeIsReadOnly();

        function modeIsReadOnly() {
            let currentPath = $location.path();
            return currentPath.includes('view');
        }

        $scope.session = new Session($scope.structure);
        $scope.subjects = new Subjects();
        $scope.session.teacher = {id: model.me.userId};

        async function initData() {
            await Promise.all([
                $scope.subjects.sync($scope.structure.id, model.me.userId)]);

            if ($routeParams.id) {
                $scope.session.id = $routeParams.id;
                await $scope.session.sync();
            }
            $scope.safeApply();
        }

        initData();

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
                homeworkFormsAreValids = h.title && h.type;
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
                        $scope.session.state = 'published';
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
            $scope.session.homeworks.forEach(async h => {
                h.state = $scope.session.state;
                h.session = $scope.session;
                await h.save();
            });
        }


        // region Gestion des homework
        $scope.addHomework = () => {
            let newHomework = new Homework($scope.structure);
            newHomework.opened = true;
            newHomework.audience = $scope.session.audience;
            newHomework.subject = $scope.session.subject;
            newHomework.session = $scope.session;

            $scope.session.homeworks.push(newHomework);
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

        $scope.localRemoveHomework = (deletedHomework: Homework) => {
            $scope.session.homeworks = $scope.session.homeworks.filter(item =>  item.id !== deletedHomework.id);
        };

        // endregion


        // region Gestion des visas
        $scope.hasManageVisaRight = () => {
            return model.me.hasWorkflow(WORKFLOW_RIGHTS.manageVisa);
        };

        $scope.visaForm = {};

        $scope.startCreatingVisa = () => {
            $scope.visaForm.visa = new Visa($scope.structure);
            $scope.visaForm.visa.session_id = $scope.session.id;

            $scope.visaForm.visa.comment = '';
            $scope.safeApply();
        };

        $scope.startUpdatingVisa = async (visa: Visa) => {
            visa.isBeingUpdated = true;
            $scope.visaForm.visa = _.clone(visa);
            $scope.safeApply();
        };

        $scope.saveVisa = async () => {
            let { succeed } = $scope.toastHttpCall(await $scope.visaForm.visa.save());
            if (succeed) {
                $scope.visaForm.visa = undefined;
                await $scope.session.sync();
                $scope.safeApply();
            }
        };

        $scope.cancelVisaCreateOrUpdate = async () => {
            $scope.session.visas.forEach(v => v.isBeingUpdated = false);
            $scope.visaForm.visa = undefined;
        };

        $scope.deleteVisa = async (visa: Visa) => {
            let { succeed } = $scope.toastHttpCall(await visa.delete());
            if (succeed){
                await $scope.session.sync();
                $scope.safeApply();
            }
        };

        //endregion
    }]
);