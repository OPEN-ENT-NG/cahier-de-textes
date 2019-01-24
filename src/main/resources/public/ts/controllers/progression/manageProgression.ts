import {Behaviours, idiom as lang, model, ng} from 'entcore';
import {ProgressionHomework, ProgressionSession, ProgressionSessions} from "../../model/Progression";
import {Session, Subjects} from "../../model";
import {Homework, HomeworkTypes} from "../../model/homework";

export let manageProgressionCtrl  = ng.controller("manageProgessionCtrl",
    ['$scope', '$routeParams', '$location','$attrs', async function ($scope, $routeParams, $location, $attrs) {
        const WORKFLOW_RIGHTS = Behaviours.applicationsBehaviours.diary.rights.workflow;
        console.log('manageProgressionCtrl');



        async function initData(){
            $scope.subjects = new Subjects();
            $scope.homeworkTypes = new HomeworkTypes();
            $scope.progression_sessions = new ProgressionSessions(model.me.userId);
            await   $scope.progression_sessions.sync();
            await $scope.subjects.sync($scope.structure.id, model.me.userId);
            $scope.progression_sessions.all.map(psession => {
                $scope.subjects.all.forEach( subject =>{
                    if(psession.subject_id == subject.id){
                        psession.setSubject(subject);
                    }
                })
            })
            $scope.homeworkTypes.sync();
            $scope.safeApply();

        }

        $scope.progression_session = $scope.progression_session ? $scope.progression_session : new ProgressionSession();

        $scope.progression_session.owner = {id: model.me.userId};


        $scope.validProgressionsSessionForm = () =>{
            $scope.progression_session.create();
            $scope.goTo('/progressions');
        }

        $scope.areValidHomeworks = () =>{
            var back = true;
            if (!$scope.progression_session.progression_homeworks || $scope.progression_session.progression_homeworks.length == 0)
                return back;
            $scope.progression_session.progression_homeworks.forEach((item) => {
                back = back && item.isValidForm();
            });
            return back;
        }

        $scope.$watch(() => $scope.progression_session.subject,  () => {
            $scope.progression_session.progression_homeworks.forEach(h => h.subject = $scope.progression_session.subject);
            $scope.safeApply();
        });


        $scope.openProgressionHomework = (progressionHomework: ProgressionHomework) => {
            $scope.progression_session.progression_homeworks.map(p => {
                if(p.opened){
                    p.opened = false ;
                }
            })
            progressionHomework.opened = !progressionHomework.opened;

            $scope.safeApply();


        };

        $scope.deleteProgressionHomework = (progressionHomework: ProgressionHomework,i) => {

            console.log(i);
            $scope.progression_session.progression_homeworks.splice(i,1);

        }

        $scope.addProgressionHomework = () =>{

            let newProgressionHomework = new ProgressionHomework();

            newProgressionHomework.subject = $scope.progression_session.subject;

            newProgressionHomework.isNewField = true;
            $scope.progression_session.progression_homeworks.push(newProgressionHomework);
            $scope.openProgressionHomework(newProgressionHomework);
            $scope.safeApply();
        }
        await initData();
    }]
);