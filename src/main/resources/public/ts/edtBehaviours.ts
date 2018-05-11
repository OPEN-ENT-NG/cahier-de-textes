import { _ } from 'entcore';
import http from 'axios';
import { SETTINGS_SNIPPLET } from './snipplets';
import { Exclusion, Exclusions } from './model';

export const edtBehaviours = {
    rights: {
        workflow: {
            view: 'fr.cgi.edt.controllers.EdtController|view',
                create: 'fr.cgi.edt.controllers.EdtController|create',
                manage: 'fr.cgi.edt.controllers.EdtController|createExclusion'
        },
        resource: {
            read: {
                right: "fr-cgi-edt-controllers-EdtController|getEdt"
            },
            contrib: {
                right: "fr-cgi-edt-controllers-EdtController|updateEdt"
            },
            manager: {
                right: "fr-cgi-edt-controllers-EdtController|addRights"
            }
        }
    },
    loadResources: function(callback){
        http.get('/edt/list').then(function(edt){
            this.resources = _.map(_.where(edt, { trashed: 0 }), function(edt){
                edt.icon = edt.icon || '/img/illustrations/edt-default.png';
                return {
                    title: edt.title,
                    owner: edt.owner,
                    icon: edt.icon,
                    path: '/edt#/view-edt/' + edt._id,
                    _id: edt._id
                };
            });
            callback(this.resources);
        }.bind(this));
    },
    model: {
        Exclusion: Exclusion,
        Exclusions: Exclusions
    },
    sniplets: {
        settings: SETTINGS_SNIPPLET
    }
};