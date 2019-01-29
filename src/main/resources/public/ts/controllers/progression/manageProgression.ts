import {Behaviours, idiom as lang, model, ng} from 'entcore';
import {ProgressionHomework, ProgressionSession, ProgressionSessions} from "../../model/Progression";
import {Session, Subjects} from "../../model";
import {Homework, HomeworkTypes} from "../../model/homework";


export let manageProgressionCtrl  = ng.controller("manageProgessionCtrl",
    ['$scope', '$routeParams', '$location','$attrs', async function ($scope, $routeParams, $location, $attrs) {
        const WORKFLOW_RIGHTS = Behaviours.applicationsBehaviours.diary.rights.workflow;
        console.log('manageProgressionCtrl');


        function modeIsReadOnly() {

            let currentPath = $location.path();
            return  currentPath.includes('view');
        }
        $scope.progression_session = $scope.progression_session ? $scope.progression_session : new ProgressionSession();
        $scope.progression_sessions = new ProgressionSessions(model.me.userId);


        $scope.refresh = () =>{
            if($routeParams.progressionId){
                $scope.progression_session.id = parseInt ($routeParams.progressionId);
                $scope.progression_session.get();
                $scope.safeApply();

            }
        }
        async function initData(){

            if($routeParams.progressionId){
                $scope.progression_session.id = parseInt ($routeParams.progressionId);
                await  $scope.progression_session.get();
                $scope.safeApply();
            }

            $scope.progression_session.owner = {id: model.me.userId};

            $scope.isReadOnly = modeIsReadOnly();

            $scope.subjects = new Subjects();
            $scope.homeworkTypes = new HomeworkTypes();
            await   $scope.progression_sessions.sync();
            await $scope.subjects.sync($scope.structure.id, model.me.userId);
            $scope.progression_sessions.all.map(psession => {
                $scope.subjects.all.forEach( subject =>{
                    if(psession.subject_id == subject.id){
                        psession.setSubject(subject);
                    }


                })
            });
            if($scope.progression_session.title) {
                $scope.subjects.all.forEach(subject => {
                    if ($scope.progression_session.subject_id == subject.id) {
                        $scope.progression_session.setSubject(subject);
                    }
                })
                ;
            }

            $scope.homeworkTypes.sync();
            $scope.safeApply();

        }
        $scope.progression_session.eventer.on(`get:end` , ()=>{
            $scope.safeApply();

        });


        $scope.getIsReadOnly = () => {
            return modeIsReadOnly();
        };


        $scope.validProgressionsSessionForm = async () =>{
            let exist = false;
            $scope.progression_sessions.all.map((item) =>{
                if (item.id == $scope.progression_session.id){
                    exist=true;
                }
            });
            if(!exist){
              await  $scope.progression_session.create()
            }else{
                await $scope.progression_session.update()
            }
            $scope.goTo('/progressions/view');
            $scope.safeApply();

        };

        $scope.areValidHomeworks = () =>{
            var back = true;
            if (!$scope.progression_session.progression_homeworks || $scope.progression_session.progression_homeworks.length == 0)
                return back;
            $scope.progression_session.progression_homeworks.forEach((item) => {
                back = back && item.isValidForm();
            });
            return back;
        };
        $scope.$watch(() => $scope.progression_session.subject,  () => {
            $scope.progression_session.progression_homeworks.forEach(h => h.subject = $scope.progression_session.subject);
            $scope.safeApply();
        });


        $scope.openProgressionHomework = (progressionHomework: ProgressionHomework) => {

            $scope.progression_session.progression_homeworks.map(p => {
                if(p.opened){
                    p.opened = false ;
                }
            });
            progressionHomework.opened = !progressionHomework.opened;

            $scope.safeApply();


        };

        $scope.deleteProgressionHomework = async (progressionHomework: ProgressionHomework,i) => {

            console.log(i);
            $scope.progression_session.progression_homeworks.splice(i,1);
            if(progressionHomework.id)
                $scope.toastHttpCall (await progressionHomework.delete());

        };

        $scope.addProgressionHomework = () =>{

            let newProgressionHomework = new ProgressionHomework();

            newProgressionHomework.subject = $scope.progression_session.subject;

            newProgressionHomework.isNewField = true;
            $scope.progression_session.progression_homeworks.push(newProgressionHomework);
            $scope.openProgressionHomework(newProgressionHomework);
            $scope.safeApply();
        };

        $scope.deleteProgressionSession = async (progressionSession: ProgressionSession)=>{
            $scope.toastHttpCall (await progressionSession.delete());
            await initData();
            $scope.isReadOnly = !$scope.isReadOnly;

            $scope.safeApply();
        };

        $scope.openProgressionSession = async (progressionSession: ProgressionSession)=>{
            $scope.progression_session = progressionSession;
            $scope.safeApply();

            $scope.goTo('/progression/'+ progressionSession.id);
            //  $scope.safeApply();

        };
        $scope.back = () =>{
            window.history.back();
        }
        await initData();
    }]
);