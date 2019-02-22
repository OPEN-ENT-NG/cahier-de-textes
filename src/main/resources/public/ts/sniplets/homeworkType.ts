import {HomeworkType, Toast} from "../model";
import {HomeworkTypes} from "../model/homework";
import {Utils} from "../utils/utils";


console.log("homework_type");


export const homeworkType = {
    title: 'Homework type',
    description: 'Permet de paramétrer les différents types de devoir à faire',
    that: undefined,
    controller: {
        init: async function () {
            this.notifications = [];
            homeworkType.that = this;
            this.structure_id = this.source.idStructure;
            this.homework_type = new HomeworkType(this.structure_id);
            this.homeworkTypes = new HomeworkTypes(this.structure_id);
            this.hideTrash = false;
            await this.homeworkTypes.sync();
            this.isLast();
            this.safeApply();
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
                        this.safeApply();
                    }
                }
            });
        },

        isLast: function () {
            if(this.homeworkTypes.all.length <= 1) {
                homeworkType.that.hideTrash = true;
            }
            else {
                homeworkType.that.hideTrash = false;
            }
        },

        toastHttpCall: (response) => {
            if (response.succeed) {
                homeworkType.that.notifications.push(new Toast(response.toastMessage, 'confirm'));
            } else {
                homeworkType.that.notifications.push(new Toast(response.toastMessage, 'error'));
            }
            return response;
        },

        createHomeworkType: async function () {
            console.log('create');
            this.updateType = false;
            this.toastHttpCall(await this.homework_type.create());
            await this.homeworkTypes.sync();
            this.homework_type.label = null;
            homeworkType.that.homework_type.label = null;
            this.safeApply(homeworkType.that);
            this.isLast();
        },

        updateHomeworkType: async function (homework_type: HomeworkType) {
            console.log('update');
            this.updateType = true;
            this.toastHttpCall(await this.homework_type.update());
            await this.homeworkTypes.sync();
            homeworkType.that.updateType = false;
            this.homework_type.label = null;
            homeworkType.that.homework_type.label = null;
            this.safeApply(homeworkType.that);
        },

        deleteHomeworkType: async function (homework_type: HomeworkType) {
            console.log('delete');
            this.toastHttpCall(await homework_type.delete());
            await this.homeworkTypes.sync();
            this.safeApply(homeworkType.that);
            this.isLast();
        },

        prepareUpdate: async function (homework_type: HomeworkType) {
            homeworkType.that.updateType = true;
            homeworkType.that.homework_type = homework_type;
            this.safeApply(homeworkType.that);
        }
    }
}
