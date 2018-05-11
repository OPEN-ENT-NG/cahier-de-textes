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
        .when('/create', {
            action: 'create'
        })
        .otherwise({
            redirectTo: '/'
        });
});