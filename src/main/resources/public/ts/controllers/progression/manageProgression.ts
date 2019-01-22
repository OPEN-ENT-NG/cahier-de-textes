import {Behaviours, idiom as lang, model, ng} from 'entcore';
import {ProgressionHomework,ProgressionSession} from "../../model/Progression";
import {Session, Subjects} from "../../model";

export let manageProgressionCtrl  = ng.controller("manageProgessionCtrl",
    ['$scope', '$routeParams', '$location','$attrs', async function ($scope, $routeParams, $location, $attrs) {
        const WORKFLOW_RIGHTS = Behaviours.applicationsBehaviours.diary.rights.workflow;
        console.log('manageProgressionCtrl');

        $scope.subjects = new Subjects();

        $scope.progression_session = $scope.progression_session ? $scope.progression_session : new ProgressionSession();

        $scope.progression_session.owner = {id: model.me.userId};
        $scope.subjects.sync($scope.structure.id, model.me.userId);


        $scope.validProgressionsSessionForm = () =>{
            $scope.progression_session.create();

        }
    }]
);