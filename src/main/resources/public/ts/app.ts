import {ng, routes} from 'entcore';
import * as directives from './directives';
import * as controllers from './controllers';
import * as filters from './filters';

for (let directive in directives) {
    ng.directives.push(directives[directive]);
}

for (let filter in filters) {
    ng.filters.push(filters[filter]);
}
for (let controller in controllers) {
    ng.controllers.push(controllers[controller]);
}


routes.define(($routeProvider) => {
    $routeProvider
        .when('/', {
            action: 'main'
        })
        .when('/session/create/:courseId/:date/', {
            action: 'manageSession'
        })
        .when('/session/create', {
            action: 'manageSession'
        })
        .when('/session/update/:id', {
            action: 'manageSession'
        })
        .when('/session/view/:id', {
            action: 'manageSession'
        })
        .when('/homework/create', {
            action: 'manageHomework'
        })
        .when('/homework/update/:id', {
            action: 'manageHomework'
        })
        .when('/homework/view/:id', {
            action: 'manageHomework'
        })
        .when('/visas', {
            action: 'manageVisas'
        })
        .when('/list',{
            action : 'manageList'
        })
        .when('/progression/create',{
            action  : 'manageProgression'
        })
        .when('/progression/:progressionId',{
            action  : 'manageProgression'
        })
        .when('/progression/to/session/:idProgression/:idSession',{
            action  : 'manageProgression'
        })
        .when('/progressions/view',{
            action  : 'viewProgession'
        })
        .otherwise({
            redirectTo: '/'
        });
});