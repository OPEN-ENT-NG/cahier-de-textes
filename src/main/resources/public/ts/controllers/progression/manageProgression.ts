import {_, Behaviours, Folder, idiom as lang, model, ng, template} from 'entcore';
import {
    ProgressionFolder,
    ProgressionFolders, ProgressionHomework,
    ProgressionSession, ProgressionSessions
} from "../../model/Progression";
import {DateUtils, HomeworkTypes, SessionTypes, Subjects, Toast} from "../../model";

export let manageProgressionCtrl = ng.controller("manageProgessionCtrl",
    ['$scope', '$routeParams', '$location', async function ($scope, $routeParams, $location) {
        const WORKFLOW_RIGHTS = Behaviours.applicationsBehaviours.diary.rights.workflow;

        function modeIsReadOnly() {
            let currentPath = $location.path();
            return currentPath.includes('view');
        }

        $scope.currentUrlIsManage = $location.url() === "/progressions/view";
        $scope.allSessionsSelect = false;

        $scope.isListView = true;
        $scope.subjects = null;
        $scope.sessionTypes = null;
        $scope.progressionSessionForm = new ProgressionSession();
        $scope.progressionFolders = null;
        $scope.progressionFoldersToDisplay = null;
        $scope.subProgressionsItems = [];
        $scope.openedFolderIds = [null];
        $scope.selectedItem = null;
        $scope.selectedSubItems = [];
        $scope.selectedFolderIds = [];
        $scope.openedCreateFolder = false;
        $scope.openedToasterProgressions = false;
        $scope.optionFolders = [];
        $scope.progressionFolderForm = new ProgressionFolder();
        $scope.searchFolders = [];
        $scope.searchSessions = [];

        $scope.sort = {
            progression: 'title',
            reverse: false
        };

        $scope.refresh = () => {
            if ($routeParams.progressionId) {
                $scope.progressionSessionForm.id = parseInt($routeParams.progressionId);
                $scope.progressionSessionForm.get();
                $scope.safeApply();

            }
        };

        $scope.selectIconFolder = (folder: ProgressionFolder) => {
            if (($scope.isFilterSearch() && $scope.currentUrlIsManage)
                || (!$scope.isFilterSearch() && folder.childFolders.length === 0)
                || ($scope.isFilterSearch() && folder.childFolders.length === 0 && folder.progressionSessions.length === 0)) {
                return 'diary-folder';
            } else {
                return $scope.selectedFolderIds.indexOf(folder.id) !== -1 ? 'arrow-down' : 'arrow-right';
            }
        };

        async function initData() {
            $scope.progressionSessionForm = new ProgressionSession();
            $scope.sessionTypes = new SessionTypes($scope.structure.id);
            $scope.subjects = new Subjects();
            await $scope.sessionTypes.sync();
            await $scope.subjects.sync($scope.structure.id, model.me.userId);
            await $scope.initProgressions();

            $scope.progressionFolders.forEach((folder) => {
                folder.progressionSessions.map(psession => {
                    $scope.subjects.all.forEach(subject => {
                        if (psession.subject_id == subject.id) {
                            psession.setSubject(subject);
                        }
                    });
                    $scope.sessionTypes.all.forEach(type => {
                        if (psession.type_id == type.id) {
                            psession.setType(type);
                        }
                    })
                });
            });
            if ($routeParams.progressionId) {
                $scope.progressionSessionForm.id = parseInt($routeParams.progressionId);
                await $scope.progressionSessionForm.get();
                $scope.safeApply();
            }
            $scope.validate = false;
            $scope.hidePencil = false;
            $scope.display.progression = true;

            $scope.progressionSessionForm.owner = {id: model.me.userId};

            $scope.isReadOnly = modeIsReadOnly();
            $scope.homeworkTypes = new HomeworkTypes($scope.structure.id);

            if ($scope.subjects.all.length === 1) {
                $scope.progressionSessionForm.setSubject($scope.subjects.all[0]);
            }

            if ($scope.progressionSessionForm.title) {
                $scope.subjects.all.forEach(subject => {
                    if ($scope.progressionSessionForm.subject_id == subject.id) {
                        $scope.progressionSessionForm.setSubject(subject);
                    }
                });
                $scope.sessionTypes.all.forEach(type => {
                    if ($scope.progressionSessionForm.type_id == type.id) {
                        $scope.progressionSessionForm.setType(type);
                    }
                });
            }
            await $scope.homeworkTypes.sync();
            $scope.safeApply();
        }

        $scope.initProgressions = async () => {
            $scope.progressionFolders = new ProgressionFolders(model.me.userId);
            await $scope.progressionFolders.sync();
            $scope.progressionFolders.all.map((x) => {
                if (x.id === null && x.parent_id === null) x.title = lang.translate("progression.my.folders");
                return x;
            });

            $scope.progressionFoldersToDisplay = Object.assign(Object.create(Object.getPrototypeOf($scope.progressionFolders)), $scope.progressionFolders);
            $scope.progressionFolders.all.filter((x) => x.id);
            $scope.progressionFoldersToDisplay.all = ProgressionFolders.organizeTree($scope.progressionFoldersToDisplay.all);
            $scope.subProgressionsItems = $scope.progressionFoldersToDisplay.all;

            $scope.selectedItem = null;
            $scope.selectedSubItems = [];
        };


        $scope.addFolderSelected = (item) => {
            if (item instanceof ProgressionFolder) {
                if (((!$scope.isFilterSearch() || $scope.currentUrlIsManage) && item.childFolders.length === 0)
                    || ($scope.isFilterSearch() && !$scope.currentUrlIsManage && item.childFolders.length === 0 && item.progressionSessions.length === 0)) {
                    $scope.selectItem(item);
                } else {
                    let index = $scope.selectedFolderIds.indexOf(item.id);
                    if (index === -1) {
                        //open folder
                        $scope.selectedFolderIds.push(item.id);
                        $scope.selectItem(item);
                    } else {
                        //close folder
                        $scope.selectedFolderIds.splice(index, 1);
                        if ($scope.selectedItem && $scope.selectedItem.id === item.id) $scope.selectItem(null);
                    }
                }
            }
        };

        /*
        display the progressions that match the search query
         */
        $scope.filterProgression = (search) => {
            search = search.trim();
            $scope.searchSessions = [];
            $scope.searchFolders = [];
            $scope.selectedFolderIds = [];
            $scope.selectItem(null);
            if (search && search != '') {
                $scope.progressionFolders.all.filter((f) => {
                    $scope.searchSessions = [
                        ...$scope.searchSessions,
                        ...f.progressionSessions.filter((s) => s.title.toUpperCase().includes(search.toUpperCase()))
                    ];
                    if (f.title.toUpperCase().includes(search.toUpperCase())) $scope.searchFolders.push(f);
                });
            }
            $scope.safeApply();
        };

        $scope.isFilterSearch = () => {
            return $scope.searchSessions.length > 0 || $scope.searchFolders.length > 0 || ($scope.search && $scope.search != '');
        };

        $scope.displayedTable = () => {
            if ($scope.isFilterSearch()) {
                return $scope.selectedItem ? $scope.selectedItem.progressionSessions : $scope.searchSessions;
            }
            return $scope.selectedItem ? $scope.selectedItem.progressionSessions : [];
        };

        $scope.getProgressionSessions = (): ProgressionSession[] => {
            let progressionSessions = $scope.progressionFolders ? $scope.progressionFolders.all.map((f) => f.progressionSessions) : [];
            return [].concat.apply([], progressionSessions);
        };

        $scope.getProgressionSessionsChecked = (): ProgressionSession[] => {
            return $scope.getProgressionSessions().filter((s) => s.tableSelected === true);
        };

        $scope.selectOrUnselectAllSessions = function () {
            if ($scope.progressionFolders) {
                let progressionSessions = $scope.selectedItem.progressionSessions;
                progressionSessions.forEach((s) => s.tableSelected = $scope.allSessionsSelect);

                $scope.updateOptionToaster();
                $scope.safeApply();
            }
        };

        $scope.updateOptionToaster = () => {
            let checkProgressionLength = $scope.getProgressionSessionsChecked().length;
            if (checkProgressionLength === 0) $scope.allSessionsSelect = false;
        };

        $scope.showOptionToaster = () => {
            return $scope.getProgressionSessionsChecked().length > 0 || $scope.selectedSubItems.length > 0
        };

        $scope.isSelectedFolder = (item) => (item instanceof ProgressionFolder && !$scope.isSelectedSession(item)) && ($scope.selectedItem && item.id === $scope.selectedItem.id);

        $scope.isSelectedSession = (item) => (item instanceof ProgressionSession && !$scope.isSelectedFolder(item)) && ($scope.selectedItem && item.id === $scope.selectedItem.id);

        $scope.isFolder = (item) => item instanceof ProgressionFolder;

        $scope.selectItem = (item) => {
            if ($scope.selectedItem) {
                $scope.selectedItem.selected = false;
                $scope.selectedItem = (!item || (item.id === $scope.selectedItem.id && $scope.isFolder(item) === $scope.isFolder($scope.selectedItem))) ? null : item;
                if ($scope.selectedItem) $scope.selectedItem.selected = true;
            } else {
                if (item) item.selected = true;
                $scope.selectedItem = item;
            }

            $scope.getProgressionSessionsChecked().forEach((s) => {
                s.tableSelected = false;
            });
            $scope.updateOptionToaster();
            $scope.progressionFolderForm.parent = $scope.selectedItem;
            $scope.progressionSessionForm.folder = $scope.isFolder($scope.selectedItem) ? $scope.selectedItem : null;
            $scope.selectedSubItems = [];
        };

        $scope.selectSubItem = (item) => {
            let subItems = $scope.selectedSubItems.map((x) => ($scope.isFolder(x) ? 'f' : 's') + x.id);

            let index = subItems.indexOf(($scope.isFolder(item) ? 'f' : 's') + item.id);
            if (index === -1) {
                $scope.selectedSubItems.push(item);
            } else {
                $scope.selectedSubItems.splice(index, 1);
            }
        };

        $scope.isSelectedSubItem = (item) => {
            let subItems = $scope.selectedSubItems.map((x) => ($scope.isFolder(x) ? 'f' : 's') + x.id);
            return subItems.indexOf(($scope.isFolder(item) ? 'f' : 's') + item.id) !== -1;
        };

        $scope.filterCycleFolders = () => {
            let result = $scope.progressionFolders ? $scope.progressionFolders.all.filter((i) => i.deepStep < 5) : [];
            if ($scope.progressionFolderForm && $scope.progressionFolderForm.id) {
                return result.filter((i) => {
                    return !(ProgressionFolders.isParentFolder($scope.progressionFolderForm, i));
                });
            }
            return result;
        };

        $scope.submitProgressionFolderForm = async () => {
            $scope.folder_loading = true;
            $scope.safeApply();

            let result = await $scope.progressionFolderForm.save();
            if (result.succeed) {
                $scope.openedCreateFolder = false;
                await initData();
                $scope.safeApply();
            }
            $scope.folder_loading = false;
        };

        $scope.dropped = async (dragEl, dropEl) => {
            if (dragEl == dropEl)
                return;
            let dragItem = $('#' + dragEl);
            let dropItem = $('#' + dropEl);
            let dropId = dropItem.data().itemId;
            let dragId = dragItem.data().itemId;

            let folder = $scope.progressionFolders.all.find((f) => f.id === dropId);

            if ((!dropItem.hasClass("folder") && !dropItem.hasClass("sub-folder")) || !folder) return;
            if (dragItem.hasClass("session-item")) {
                let sessionsChecked= $scope.getProgressionSessionsChecked();

                if (sessionsChecked.map((s) => s.id).includes(dragId)) {
                    sessionsChecked.forEach((s) => {
                        s.folder = folder;
                        s.save();
                    });
                } else {
                    let sessions = $scope.getProgressionSessions();
                    let session = sessions.find((s) => s.id === dragId);
                    if (!session) return;
                    session.folder = folder;
                    await session.save();

                }
            } else if (dragItem.hasClass("sub-folder")) {
                if ($scope.selectedSubItems.map((f) => f.id).includes(dragId)) {
                    $scope.selectedSubItems.forEach((f) => {
                        if (ProgressionFolders.isParentFolder(f, folder)) return;
                        f.parent_id = folder.id;
                        f.save();
                    });
                } else {
                    let moveFolder = $scope.progressionFolders.all.find((f) => f.id === dragId);
                    if (!moveFolder || ProgressionFolders.isParentFolder(moveFolder, folder)) return;
                    moveFolder.parent_id = folder.id;
                    await moveFolder.save();
                }
            }
            await initData();
            $scope.safeApply();
        };

        $scope.progressionSessionForm.eventer.on(`get:end`, () => {
            $scope.safeApply();
        });

        $scope.getIsReadOnly = () => {
            return modeIsReadOnly();
        };

        $scope.showProgressionSessionForm = () => {
            $scope.goTo('/progression/create');
            $scope.safeApply();
        };

        $scope.validProgressionsSessionForm = async () => {
            let result = await $scope.toastHttpCall(await $scope.progressionSessionForm.save());
            if (result.succeed) {
                $scope.goTo('/progressions/view');
                await initData();
                $scope.openedCreateFolder = false;
            }
            $scope.safeApply();

        };

        $scope.isValidForm = () => {
            let sessionFormIsValid = $scope.progressionSessionForm
                && $scope.progressionSessionForm.subject
                && $scope.progressionSessionForm.type.label
                && $scope.progressionSessionForm.title;
            return sessionFormIsValid;
        };

        $scope.areValidHomeworks = () => {
            var back = true;
            if (!$scope.progressionSessionForm.progression_homeworks || $scope.progressionSessionForm.progression_homeworks.length == 0)
                return back;
            $scope.progressionSessionForm.progression_homeworks.forEach((item) => {
                back = back && item.isValidForm();
            });
            return back;
        };
        $scope.$watch(() => $scope.progressionSessionForm.subject, () => {
            $scope.progressionSessionForm.progression_homeworks.forEach(h => h.subject = $scope.progressionSessionForm.subject);
            $scope.safeApply();
        });

        $scope.openProgressionHomework = (progressionHomework: ProgressionHomework) => {
            $scope.oldProgressionHomework = [];

            $scope.oldProgressionHomework[0] = progressionHomework.description;
            $scope.oldProgressionHomework[1] = progressionHomework.estimatedTime;
            $scope.oldProgressionHomework[2] = progressionHomework.subject;

            $scope.validate = true;
            $scope.hidePencil = true;
            $scope.progressionSessionForm.progression_homeworks.map(p => {
                if (p.opened) {
                    p.opened = false;
                }
            });
            progressionHomework.opened = !progressionHomework.opened;

            $scope.safeApply();
        };

        $scope.deleteProgressionHomework = async (progressionHomework: ProgressionHomework, i) => {

            if (progressionHomework.opened) {
                $scope.validate = false;
                $scope.safeApply();

            }
            $scope.progressionSessionForm.progression_homeworks.splice(i, 1);
            if (progressionHomework.id)
                $scope.toastHttpCall(await progressionHomework.delete());


        };


        $scope.cancelProgressionHomework = () => {
            $scope.validate = false;
            $scope.hidePencil = false;
            $scope.progressionSessionForm.progression_homeworks.map((p, index) => {
                if (p.opened) {
                    p.opened = false;
                    if (!p.id) {
                        if (!p.alreadyValidate)
                            $scope.progressionSessionForm.progression_homeworks.splice(index, 1);
                        else {
                            p.description = $scope.oldProgressionHomework[0];
                            p.estimatedTime = $scope.oldProgressionHomework[1];
                            p.subject = $scope.oldProgressionHomework[2];
                        }
                    } else {
                        p.description = $scope.oldProgressionHomework[0];
                        p.estimatedTime = $scope.oldProgressionHomework[1];
                        p.subject = $scope.oldProgressionHomework[2];
                    }
                }
            });

            $scope.safeApply();

        };
        $scope.newProgressionHomework = () => {
            $scope.validate = false;
            $scope.hidePencil = false;
            $scope.progressionSessionForm.progression_homeworks.map(p => {
                if (p.opened) {
                    p.opened = false;
                    p.alreadyValidate = true;
                }
            });

            $scope.safeApply();
        };

        $scope.addProgressionHomework = () => {
            let newProgressionHomework = new ProgressionHomework();
            newProgressionHomework.type = $scope.homeworkTypes.all.find(ht => ht.rank > 0);

            newProgressionHomework.subject = $scope.progressionSessionForm.subject;

            newProgressionHomework.isNewField = true;
            $scope.progressionSessionForm.progression_homeworks.push(newProgressionHomework);
            $scope.openProgressionHomework(newProgressionHomework);
            $scope.hidePencil = true;

            template.open('formProgressionHomework', '/progression/progression-homework-form');
            $scope.safeApply();
        };

        $scope.openProgressionSession = async (progressionSession: ProgressionSession) => {
            $scope.progressionSessionForm = progressionSession;
            $scope.safeApply();
            $scope.goTo('/progression/' + progressionSession.id);
        };

        $scope.back = () => {
            window.history.back();
        };

        $scope.openUpdateItem = async (item) => {
            if (item instanceof ProgressionSession) {
                $scope.progressionSessionForm = item;
                $scope.showProgressionSessionForm();
            } else {
                $scope.progressionFolderForm = item;
                $scope.openedCreateFolder = true;
            }
            $scope.safeApply();
        };

        $scope.deleteItems = async (deepRemove: boolean) => {
            let folderIds = [];
            let sessionIds = [];

            $scope.getProgressionSessionsChecked().forEach((s) => sessionIds.push(s.id));
            $scope.delete_loading = true;
            $scope.selectedSubItems.forEach((x) => {
                if (x instanceof ProgressionFolder) ProgressionFolders.idsToRemove(x, deepRemove, folderIds, sessionIds);
            });

            let sessionSucceed = sessionIds.length > 0 ? await ProgressionSessions.delete(sessionIds, model.me.userId) : true;
            let folderSucceed = folderIds.length > 0 ? await ProgressionFolders.delete(folderIds, model.me.userId) : true;

            if (sessionSucceed.success || folderSucceed.success) {
                await initData();
                $scope.closeFolderForm();
                $scope.safeApply();
            }
            $scope.delete_loading = false;
            $scope.openedToasterProgressions = false;
        };

        $scope.closeFolderForm = () => {
            $scope.openedCreateFolder = false;
            $scope.progressionFolderForm = new ProgressionFolder();
            $scope.selectedItem = null;
            $scope.selectedSubItems = [];
            $scope.selectedFolderIds = [];
            $scope.safeApply();
        };

        //change the sorting of the progressions
        $scope.changeSortType = (type) => {
            if ($scope.sort.progression === type) {
                $scope.sort.reverse = !$scope.sort.reverse;
            } else {
                $scope.sort.progression = type;
                $scope.sort.reverse = false;
            }
        };

        $scope.$on('$routeChangeStart', function ($event, next, current) {
            $scope.isListView = !(next.originalPath === "/progression/create");
        });

        await initData();
    }]
);