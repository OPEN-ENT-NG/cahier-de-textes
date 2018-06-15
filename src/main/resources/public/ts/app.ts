import { ng, routes } from 'entcore';
import * as controllers from './controllers';

for (let controller in controllers) {
    ng.controllers.push(controllers[controller]);
}

routes.define(($routeProvider) => {
    $routeProvider
        .when('/', {
            action: 'main'
        })
        .when('/session/create', {
            action: 'createSession'
        })
        .when('/homework/update/:id', {
            action: 'manageHomework'
        })
        .when('/homework/create/', {
            action: 'manageHomework'
        })
        .otherwise({
            redirectTo: '/'
        });
});