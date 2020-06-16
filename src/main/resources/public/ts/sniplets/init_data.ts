import {Toast, ToastUtils} from "../model";
import {homeworkType} from "./homeworkType";
import http from "axios";
import {structureService} from "../services";

declare let window: any;

export const initData = {
    title: 'Init data',
    description: "Permet d'initialiser les données du module cdt",
    that: undefined,
    controller: {
        init: async function () {
            this.notifications = [];
            initData.that = this;
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

        toastHttpCall: (response) => {
            if (response.succeed) {
                initData.that.notifications.push(new Toast(response.toastMessage, 'confirm'));
            } else {
                initData.that.notifications.push(new Toast(response.toastMessage, 'error'));
            }
            return response;
        },

        initData: async function () {
            let structure_id = window.model.vieScolaire.structure.id;
            let response = await structureService.initStructure(structure_id);
            this.toastHttpCall(ToastUtils.setToastMessage(response,'cdt.data.init.success', 'cdt.data.init.error'));
            this.safeApply();
        }
    }
};