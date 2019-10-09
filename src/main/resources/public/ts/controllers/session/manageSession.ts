import {Behaviours, idiom as lang, model, moment, ng, template} from 'entcore';
import {Course, Homework, Session, SessionTypes, Subject, Subjects, Toast} from '../../model';

export let manageSessionCtrl = ng.controller('manageSessionCtrl',
    ['$scope', '$routeParams', '$location', '$attrs', '$filter', async function ($scope, $routeParams, $location, $attrs, $filter) {
        const WORKFLOW_RIGHTS = Behaviours.applicationsBehaviours.diary.rights.workflow;
        $scope.isReadOnly = modeIsReadOnly();
        $scope.isInsideDiary = $attrs.insideDiary;
        $scope.session = $scope.session ? $scope.session : new Session($scope.structure);
        //$scope.session.opened = false;
        $scope.subjects = new Subjects();
        $scope.sessionTypes = new SessionTypes($scope.structure.id);

        $scope.session.teacher = {id: model.me.userId};
        $scope.isSelectSubjectAndAudienceSession = true;

        if($scope.structure.audiences.all.length === 1){
            $scope.session.audience = $scope.structure.audiences.all[0];
        }
        $scope.validate = false;
        $scope.hidePencil = false;
        $scope.oldHomework = new Homework($scope.structure);
        $scope.formIsOpened = false;
        $scope.disableFieldSetSubjectAndAudienceSession = (audience: any, subject: any) => {
            if (!audience || !subject) {
                $scope.isSelectSubjectAndAudienceSession = true;
            } else {
                $scope.isSelectSubjectAndAudienceSession = false;
                $scope.session.opened = true;
            }
        };

        function modeIsReadOnly() {
            let currentPath = $location.path();
            return currentPath.includes('view') || $attrs.readOnly;
        }

        $scope.cancelCreation = () => {
            $scope.goTo("/main");
        };

        $scope.$watch(() => $scope.session.audience, () => {
            if ($scope.session.audience)
                $scope.session.homeworks.forEach(h => h.audience = $scope.session.audience);
            $scope.safeApply();
        });

        $scope.$watch(() => $scope.session.subject, () => {
            if ($scope.session.subject)
                $scope.session.homeworks.forEach(h => h.subject = $scope.session.subject);
            $scope.safeApply();
        });

        $scope.validDate = () =>{
            return moment($scope.session.endTime).isAfter(moment($scope.session.startTime).add(14,"minutes"));
        };

        $scope.isValidForm = () => {


            let sessionFormIsValid = $scope.session
                && $scope.session.subject
                && $scope.session.type
                && $scope.session.audience
                && $scope.session.date
                && $scope.session.startTime
                && $scope.session.endTime
                && $scope.validDate();

            // let homeworkFormsAreValids = true;
            // for (let h of $scope.session.homeworks) {
            //     homeworkFormsAreValids = h.isValidForm();
            //     if (!homeworkFormsAreValids)
            //         break;
            // }

            return sessionFormIsValid ;
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
            if (!$scope.isValidForm) {
                $scope.notifications.push(new Toast('utils.unvalidForm', 'error'));
                return;
            }

            // Sauvegarde de la session
            $scope.session.is_empty = false;
            let sessionSaveResponse = $scope.toastHttpCall(await $scope.session.save($scope.placeholder));
            if (sessionSaveResponse.succeed) {
                if (!$scope.session.id && sessionSaveResponse.data.id) {
                    $scope.session.id = sessionSaveResponse.data.id;
                } else if (!$scope.session.id && !sessionSaveResponse.data.id) {
                    $scope.notifications.push(new Toast('Error no id for session', 'error'));
                    return;
                }
                await saveSessionHomeworks();
            }
            await $scope.syncPedagogicItems();
            $scope.safeApply();
            window.history.back();
        };


        function setSessionIdHomeworks(session) {
            $scope.session.homeworks.map(async h => {
                if(h.session.isSameSession(session) ){
                    h.session.id = session.id
                }
                if(!h.isDeleted && h.isValidForm()&& h.session.id && !h.isSaved ){
                    let {succeed} = await h.save();

                }
            })
        }

        async function saveSessionHomeworks() {
            let hasSucceed = true;
            await $scope.session.homeworks.map(async h => {
                $scope.session.homeworks.map(hh =>{
                    if(h.session && hh.session && h.session.isSameSession(hh.session) && hh != h) {
                        hh.session.cc = "test";
                    }
                });
                if (!h.attachedToDate && h.session.courseId) {
                    if ($scope.session && !h.session.id) {
                        if (!h.session.type.id) {
                            h.session.type = $scope.sessionTypes.all.find(ht => ht.rank > 0);
                        }
                        if(h.session.firstText !== lang.translate("session.manage.linkhomework")) {
                            if(!h.session.cc){
                                h.isSaved = true
                                let sessionSaveResponse = await h.session.save();
                                if (sessionSaveResponse.succeed) {
                                    h.session.id = sessionSaveResponse.data.id;
                                    setSessionIdHomeworks( h.session)
                                }
                            }
                        }
                        else {
                            h.session.id = $scope.session.id;
                        }
                    }
                }
                if(!h.attachedToDate){
                    h.dueDate = h.session.startMoment;
                }
                if(!h.isDeleted && h.isValidForm()&& (h.attachedToDate || h.session.id)){
                    let {succeed} = await h.save();
                    if (!succeed) {
                        hasSucceed = false;
                    }
                }
                $scope.safeApply();
            });



            return hasSucceed;
        }

        $scope.hasOneHomeworkInList = () =>{
            let hasOneHomework = false;
            $scope.session.homeworks.map(h =>{
                if(!h.isDeleted && !h.opened )
                    hasOneHomework = true;
            });
            return hasOneHomework;
        }

        // region Gestion des homework
        $scope.areValidHomeworks = () => {
            var back = true;
            if (!$scope.session.homeworks || $scope.session.homeworks.length == 0)
                return back;
            $scope.session.homeworks.forEach((item) => {
                if(!item.isDeleted)
                    back = back && item.isValidForm();
            });
            return back;
        };
        $scope.openHomework = (homework: Homework) => {
            $scope.oldHomework.copyHomework(homework);

            $scope.validate = true;
            $scope.hidePencil = true;
            $scope.formIsOpened = true;
            $scope.session.homeworks.map(h => {
                if (h.opened) {
                    h.opened = false;
                }
            });
            homework.opened = true;
            $scope.safeApply();
        };

        $scope.deleteHomework = async (homework: any, i ) => {

            if (!homework.id) {
                if (homework.opened) {
                    $scope.validate = false;
                    $scope.safeApply();
                }
                $scope.localRemoveHomework(i);

            } else {
                if (true) {
                    $scope.localRemoveHomework($scope.session.homeworks.findIndex(x => x.id == homework.id));
                }
            }
        };

        $scope.cancelHomework = () =>{
            $scope.validate = false;
            $scope.hidePencil = false;
            $scope.formIsOpened = false;

            $scope.session.homeworks.map((h, index) => {
                if (h.opened) {
                    h.opened = false;
                    h.copyHomework($scope.oldHomework);
                }
                if(!h.isValidForm())
                    h.isDeleted = true;
            });

        };
        $scope.cancelValidateOnDelete = async (homework, index) =>{
            if(homework.opened){
                $scope.validate = false;
                $scope.formIsOpened = false;
            }

        };

        $scope.closeHomework = () => {
            $scope.validate = false;
            $scope.hidePencil = false;
            $scope.formIsOpened = false;
            $scope.session.homeworks.map(h => {
                if (h.opened) {
                    h.opened = false;
                    h.alreadyValidate = true;
                    h.formatDateToDisplay();

                }
            });
            $scope.safeApply();
        };

        $scope.addHomework = () => {
            let newHomework = new Homework($scope.structure);
            newHomework.audience = $scope.session.audience;
            newHomework.subject = $scope.session.subject;
            newHomework.session = $scope.session;
            newHomework.isNewField = true;
            $scope.session.homeworks.push(newHomework);
            $scope.openHomework(newHomework);
            $scope.hidePencil = true;
            template.open('formHomework', '/homework/homework-formPrinter');
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
            $scope.safeApply();
        };

        async function initData() {
            await $scope.sessionTypes.sync();
            await $scope.subjects.sync($scope.structure.id, model.me.userId);
            if($scope.subjects.all.length === 1 && !$scope.session.subject) {
                $scope.session.subject = $scope.subjects.all[0];
                if($scope.session.audience){
                    $scope.session.opened = true;
                }
            }
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
                    if($scope.session.subject && $scope.session.audience)
                        $scope.session.opened = true;


                }

            }else{

                $scope.session.opened = true;
            }
            // if new session, we set the default sessionType
            if (!$scope.session.id && !$scope.session.type) {
                $scope.session.type = $scope.sessionTypes.all.find(ht => ht.rank > 0);
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