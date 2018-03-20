import {model} from 'entcore';
import http from 'axios';


export function Teacher () {};

Teacher.prototype.create = function (cb, cbe) {

    model.me.structures.forEach(function (structureId) {
        http.post('/diary/teacher/' + structureId).then(function (e) {

            if (typeof cb === 'function') {
                cb();
            }
        }).catch(function (e) {
            if (typeof cbe === 'function') {
                cbe(model.parseError(e));
            }
        });
    });
};