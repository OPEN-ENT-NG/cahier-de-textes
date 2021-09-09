import {ng, model, idiom as lang, toasts} from 'entcore';
import {ProgressionFolder, ProgressionFolders, ProgressionSession} from "../../model/Progression";
import {Homework, Session} from "../../model";
import {AxiosResponse} from "axios";
import {ROOTS} from "../../core/const/roots";

export const sessionToProgressionForm = ng.directive('sessionToProgressionForm', function () {
    interface IViewModel {
        $onInit(): any;

        $onDestroy(): any;

        openProgressionForm(): void;

        closeProgressionForm(): void;

        saveProgression(): Promise<void>;

        progressionLightboxOpened: boolean;

        progressionFolders: ProgressionFolders;

        progressionSessionForm: ProgressionSession;

        session: Session;

        homeworks: Homework[];
    }

    return {
        scope: {
            session: '=',
            homeworks: '='
        },
        restrict: 'E',
        templateUrl: `${ROOTS.directive}session-to-progression-form/session-to-progression-form.html`,
        controllerAs: 'vm',
        bindToController: true,
        replace: false,
        controller: function () {
            const vm: IViewModel = <IViewModel>this;

            vm.$onInit = async () => {
                vm.progressionFolders = new ProgressionFolders(model.me.userId);
                vm.progressionSessionForm = new ProgressionSession(vm.session, vm.homeworks);
                await vm.progressionFolders.sync();
                let rootFolder: ProgressionFolder = vm.progressionFolders.all
                    .find((folder: ProgressionFolder) => folder.id === null && folder.parent_id === null);
                if (rootFolder) rootFolder.title = lang.translate("progression.my.folders");
            };
        },

        link: function ($scope) {
            const vm: IViewModel = $scope.vm;

            vm.openProgressionForm = (): void => {
                vm.progressionLightboxOpened = true;
            };

            vm.closeProgressionForm = (): void => {
                vm.progressionSessionForm.folder_id = null;
                vm.progressionLightboxOpened = false;
            };

            vm.saveProgression = async (): Promise<void> => {
                vm.progressionSessionForm.setFromSession(vm.session);
                vm.progressionSessionForm.setFromHomeworks(vm.homeworks);
                try {
                    await vm.progressionSessionForm.save();
                    vm.closeProgressionForm();
                    toasts.confirm(lang.translate("progression.session.create"));
                } catch (e) {
                    toasts.warning(`${lang.translate("progression.session.delete.error")} ${e}`);
                }
                $scope.$apply();
            };

            vm.$onDestroy = async () => {
            };
        }
    };
});