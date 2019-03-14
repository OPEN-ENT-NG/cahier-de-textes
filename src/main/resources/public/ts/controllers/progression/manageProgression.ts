import {Behaviours, idiom as lang, model, ng} from 'entcore';
import {ProgressionHomework, ProgressionSession, ProgressionSessions} from "../../model/Progression";
import {Session, Subjects, Toast} from "../../model";
import {Homework, HomeworkTypes} from "../../model/homework";
import {Utils} from '../../utils/utils';

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

        $scope.progressionsToDisplay = new ProgressionSessions(model.me.userId);
        $scope.sort = {
            progression: 'title',
            reverse : false
        };
        $scope.refresh = () =>{
            if($routeParams.progressionId){
                $scope.progression_session.id = parseInt ($routeParams.progressionId);
                $scope.progression_session.get();
                $scope.safeApply();

            }
        };

        async function initData() {
            if($routeParams.progressionId){
                $scope.progression_session.id = parseInt ($routeParams.progressionId);
                await  $scope.progression_session.get();
                $scope.safeApply();
            }
            $scope.validate = false;
            $scope.display.progression = true;

            $scope.progression_session.owner = {id: model.me.userId};

            $scope.isReadOnly = modeIsReadOnly();

            $scope.subjects = new Subjects();
            $scope.homeworkTypes = new HomeworkTypes($scope.structure.id);
            await   $scope.progression_sessions.sync();
            await   $scope.progressionsToDisplay.sync();
            await $scope.subjects.sync($scope.structure.id, model.me.userId);

            $scope.progression_sessions.all.map(psession => {
                $scope.subjects.all.forEach( subject =>{
                    if(psession.subject_id == subject.id){
                        psession.setSubject(subject);
                    }
                })
                $scope.progressionsToDisplay.push(psession);
            });

            if($scope.progression_session.title) {
                $scope.subjects.all.forEach(subject => {
                    if ($scope.progression_session.subject_id == subject.id) {
                        $scope.progression_session.setSubject(subject);
                    }
                })
                ;
            }

           await $scope.homeworkTypes.sync();
            $scope.safeApply();
        };

        $scope.progression_session.eventer.on(`get:end` , ()=> {
            $scope.safeApply();

        });

        $scope.getIsReadOnly = () => {
            return modeIsReadOnly();
        };

        $scope.validProgressionsSessionForm = async () => {
            let exist = false;
            $scope.progression_sessions.all.map((item) => {
                if (item.id == $scope.progression_session.id){
                    exist=true;
                }
            });
            if(!exist){
                await  $scope.toastHttpCall (await $scope.progression_session.create());
                $scope.goTo('/progressions');}else{
                await $scope.toastHttpCall ( await $scope.progression_session.update());
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
            $scope.validate = true;
            $scope.progression_session.progression_homeworks.map(p => {
                if(p.opened){
                    p.opened = false ;
                }
            });
            progressionHomework.opened = !progressionHomework.opened;

            $scope.safeApply();
        };

        $scope.
            filterProgression = (search) =>{
            $scope.progressionsToDisplay.all =  Utils.filterProgression( search,  $scope.progression_sessions.all);

        }

        $scope.deleteProgressionHomework = async (progressionHomework: ProgressionHomework,i) => {

            if(progressionHomework.opened){
                $scope.validate = false;
                $scope.safeApply();

            }
            $scope.progression_session.progression_homeworks.splice(i,1);
            if(progressionHomework.id)
                $scope.toastHttpCall (await progressionHomework.delete());


        };

        $scope.newProgressionHomework = () => {
            $scope.validate = false;
           $scope.progression_session.progression_homeworks.map(p => {
                if(p.opened){
                    p.opened = false ;
                }
            });

            $scope.safeApply();
        };

        $scope.addProgressionHomework = () => {
            let newProgressionHomework = new ProgressionHomework();
            newProgressionHomework.type = $scope.homeworkTypes.all.find(ht => ht.rank > 0);

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
        };

        $scope.back = () => {
            window.history.back();
        };

        $scope.deleteProgressionSessionToastLess  =  async  (progressionSession : ProgressionSession) => {
          let  response = await progressionSession.delete();
           await initData();
           $scope.isReadOnly = !$scope.isReadOnly;

           $scope.safeApply();

        }
        $scope.deleteProgressions = (progressionsSessions) => {
            progressionsSessions.map(async p =>  {
            await $scope.deleteProgressionSessionToastLess(p);
            })

            $scope.notifications.push(new Toast('delete.progressions', 'confirm'));
            $scope.safeApply();


        };

        //change the sorting of the progressions
        $scope.changeSortType = (type) =>{
            if($scope.sort.progression === type){
                $scope.sort.reverse = !$scope.sort.reverse;
            }else{
                $scope.sort.progression = type;
                $scope.sort.reverse = false;
            }
        };

        await initData();
    }]
);