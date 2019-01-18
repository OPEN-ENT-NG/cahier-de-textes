import {Behaviours, idiom as lang, model, ng} from 'entcore';
import {ProgressionHomework,ProgressionSession} from "../../model/Progression";

export let manageProgressionCtrl  = ng.controller("manageProgessionCtrl",
    ['$scope', '$routeParams', '$location','$attrs', async function ($scope, $routeParams, $location, $attrs) {
        const WORKFLOW_RIGHTS = Behaviours.applicationsBehaviours.diary.rights.workflow;
        console.log('manageProgressionCtrl');
    }]
);