import {_, http, notify, idiom as lang} from 'entcore';
import {Inspector, InspectorHabilitation} from '../model/inspector';
import {Structure, Structures} from '../model';
import {Utils} from '../utils/utils';

export const inspector = {
    title: 'Inspector Management',
    description: 'Allow to manage inspectors habilitations',
    that: undefined,
    controller: {
        init: async function(){
            this.structures = new Structures();
            await this.structures.sync();
            this.structure = this.structures.all.find(s => s.id === this.source.structureId);
            if(!this.structure)
                return;

            await this.structure.sync();
            this.inspectors = this.structure.personnels.all.map(p => new Inspector(this.structure, p));
            this.safeApply();
        },
        initSource: function(){

        },
        translate: function(key: string){
            return lang.translate(key);
        },
        syncHabilitations: async function(){
            await this.inspector.sync();
            this.teachers = this.structure.teachers.all.filter(t => !this.inspector.habilitations.all.find(h => h.teacher.id === t.id));
            await this.safeApply();
        },
        createHabilitation: async function (teacher: any) {
            let newHabilitation = new InspectorHabilitation(this.inspector, teacher, this.structure);

            let { succeed } = await newHabilitation.create();
            if (succeed) {
                this.selectedTeacher = undefined;
                await this.syncHabilitations();
                await this.safeApply();
            }
        },
        deleteHabilitation: async function (habilitation: InspectorHabilitation) {
            let { succeed } = await habilitation.delete();
            if (succeed) {
                await this.syncHabilitations();
                await this.safeApply();
            }
        },
        safeApply: function (): Promise<any> {
            return new Promise((resolve, reject) => {
                let phase = this.$root.$$phase;
                if (phase === '$apply' || phase === '$digest') {
                    if (resolve && (typeof(resolve) === 'function')) {
                        resolve();
                    }
                } else {
                    if (resolve && (typeof(resolve) === 'function')) {
                        this.$apply(resolve);
                    } else {
                        this.$apply()();
                    }
                }
            });
        }
    }
};