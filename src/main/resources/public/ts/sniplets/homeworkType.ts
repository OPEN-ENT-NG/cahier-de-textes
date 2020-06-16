import {HomeworkType, Toast} from "../model";
import {HomeworkTypes} from "../model";
import {structureService} from "../services";

declare let window: any;

export const homeworkType = {
    title: 'Homework type',
    description: 'Permet de paramétrer les différents types de devoir à faire',
    that: undefined,
    controller: {
        init: async function () {
            homeworkType.that = this;
            this.setHandler();
            this.structure_id = this.source.idStructure;
            this.homework_type = new HomeworkType(this.structure_id);
            this.homeworkTypeInput = this.homework_type;

            this.data = {
                input: "",
                updateMode: false,
                updateId: null,
                notifications: [],
                hideTrash: false
            };

            this.safeApply();
        },

        load: async function(): Promise<void> {
            this.isStructureInitialized = await structureService.fetchInitializationStatus(window.model.vieScolaire.structure.id);
            this.structure_id = window.model.vieScolaire.structure.id;
            this.homeworkTypes = new HomeworkTypes(this.structure_id);
            await this.homeworkTypes.sync();
            this.isLast();
            this.safeApply();
        },

        setHandler: function () {
            this.$watch(() => window.model.vieScolaire.structure, async () => this.load());
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
            homeworkType.that.data.hideTrash = this.homeworkTypes.all.length <= 1;
        },

        toastHttpCall: (response) => {
            if (response.succeed) {
                homeworkType.that.data.notifications.push(new Toast(response.toastMessage, 'confirm'));
            } else {
                homeworkType.that.data.notifications.push(new Toast(response.toastMessage, 'error'));
            }
            return response;
        },

        onClick: async function(homeworkTypeInput: HomeworkType) {
            if (homeworkType.that.data.input.length > 1) {
                if (homeworkType.that.data.updateMode) {
                    homeworkType.that.updateHomeworkType();
                } else {
                    homeworkType.that.createHomeworkType(homeworkTypeInput);
                }
            }
        },

        createHomeworkType: async function (event: HomeworkType) {
            event.label = homeworkType.that.data.input;
            this.toastHttpCall(await event.create());
            homeworkType.that.data.input = "";
            await this.homeworkTypes.sync();
            this.safeApply(homeworkType.that);
            this.isLast();
        },

        updateHomeworkType: async function () {
            this.homeworkTypeInput.label = homeworkType.that.data.input;
            this.homeworkTypeInput.id = homeworkType.that.data.updateId;
            this.toastHttpCall(await this.homeworkTypeInput.update());
            homeworkType.that.data.updateMode = false;
            homeworkType.that.data.input = "";
            await this.homeworkTypes.sync();
            this.safeApply(homeworkType.that);
        },

        prepareUpdate: async function (homework_type: HomeworkType) {
            this.homeworkTypeInput = homework_type;
            homeworkType.that.data.updateId = homework_type.id;
            homeworkType.that.data.updateMode = true;
            homeworkType.that.data.input = homework_type.label;
        },

        cancelUpdateHomeworkTypeInput: async function () {
            this.homeworkTypeInput = this.sessionType;
            homeworkType.that.data.updateMode = false;
            homeworkType.that.data.input = "";
        },

        deleteHomeworkType: async function (homework_type: HomeworkType) {
            this.toastHttpCall(await homework_type.delete());
            await this.homeworkTypes.sync();
            this.safeApply(homeworkType.that);
            this.isLast();
        },
    }
};
