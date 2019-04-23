import {SessionType, SessionTypes, Toast} from "../model";
import {homeworkType} from "./homeworkType";

export const sessionType = {
    title: 'Session type',
    description: 'Permet de paramétrer les différents types de séance',
    that: undefined,
    controller: {
        init: async function () {
            sessionType.that = this;
            this.structure_id = this.source.idStructure;
            this.session_type = new SessionType(this.structure_id);
            this.sessionTypes = new SessionTypes(this.structure_id);
            this.sessionTypeInput = this.session_type;

            this.data = {
                input: "",
                updateMode: false,
                updateId: null,
                notifications: [],
            };

            await this.sessionTypes.sync();
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
            if(this.sessionTypes.all.length <= 1) {
                sessionType.that.data.hideTrash = true;
            }
            else {
                sessionType.that.data.hideTrash = false;
            }
        },

        toastHttpCall: (response) => {
            if (response.succeed) {
                sessionType.that.data.notifications.push(new Toast(response.toastMessage, 'confirm'));
            } else {
                sessionType.that.data.notifications.push(new Toast(response.toastMessage, 'error'));
            }
            return response;
        },

        onClick: async function(sessionTypeInput: SessionType) {
            if (sessionType.that.data.input.length > 1) {
                if (sessionType.that.data.updateMode) {
                    sessionType.that.updateSessionType();
                } else {
                    sessionType.that.createSessionType(sessionTypeInput);
                }
            }
        },

        createSessionType: async function(event: SessionType) {
            event.label = sessionType.that.data.input;
            this.toastHttpCall(await event.create());
            sessionType.that.data.input = "";
            await this.sessionTypes.sync();
            this.safeApply();
            this.isLast();
        },

        updateSessionType: async function () {
            this.sessionTypeInput.label = sessionType.that.data.input;
            this.sessionTypeInput.id = sessionType.that.data.updateId;
            this.toastHttpCall(await this.sessionTypeInput.update());
            sessionType.that.data.updateMode = false;
            sessionType.that.data.input = "";
            await this.sessionTypes.sync();
            this.safeApply();
        },

        editSessionTypeInput: async function (event: SessionType) {
            this.sessionTypeInput = event;
            sessionType.that.data.updateId = event.id;
            sessionType.that.data.updateMode = true;
            sessionType.that.data.input = event.label;
        },

        cancelUpdateSessionTypeInput: async function () {
            this.sessionTypeInput = this.sessionType;
            sessionType.that.data.updateMode = false;
            sessionType.that.data.input = "";
        },

        deleteSessionType: async function (event: SessionType) {
            this.toastHttpCall(await event.delete());
            await this.sessionTypes.sync();
            this.safeApply(sessionType.that);
            this.isLast();
        },
    }
};