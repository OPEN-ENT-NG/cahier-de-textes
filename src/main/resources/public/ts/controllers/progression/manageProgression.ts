import {Behaviours, idiom as lang, model, ng, template} from 'entcore';
import {
    ProgressionFolder,
    ProgressionFolders,
    ProgressionHomework,
    ProgressionSession,
    ProgressionSessions
} from '../../model/Progression';
import {HomeworkTypes, SessionType, SessionTypes, Subject, Subjects} from '../../model';
import {EXCEPTIONAL} from '../../core/const/exceptional-subject';

declare let window: any;

export let manageProgressionCtrl = ng.controller('manageProgessionCtrl',
    ['$scope', '$routeParams', '$location', '$timeout', async function ($scope, $routeParams, $location, $timeout) {
        const WORKFLOW_RIGHTS = Behaviours.applicationsBehaviours.diary.rights.workflow;

        $scope.currentUrlIsManage = $location.url() === '/progressions/view';

        $scope.isListView = true;
        $scope.subjects = null;
        $scope.sessionTypes = null;
        $scope.progressionSessionForm = new ProgressionSession();
        $scope.subjects = new Subjects();
        $scope.progressionFolders = null;
        $scope.progressionFoldersToDisplay = null;
        $scope.subProgressionsItems = [];
        $scope.openedFolderIds = [null];
        $scope.selectedItem = null;
        $scope.selectedSubItems = [];
        $scope.selectedFolderIds = [null];
        $scope.openedCreateFolder = false;
        $scope.openedToasterProgressions = false;
        $scope.allSessionsSelect = {
            isAllChecked: false
        };

        $scope.openedMoveProgression = {
            isOpened: false,
            checkedProgressionSessions: []
        };

        $scope.optionFolders = [];
        $scope.progressionFolderForm = new ProgressionFolder();
        $scope.searchFolders = [];
        $scope.searchSessions = [];

        $scope.sort = {
            progression: 'title',
            reverse: false
        };

        let currentFolder: number = null;

        const modeIsReadOnly = (): boolean => {
            let currentPath = $location.path();
            return currentPath.includes('view');
        };

        $scope.selectIconFolder = (folder: ProgressionFolder) => {
            if ($scope.currentUrlIsManage) {
                if (($scope.isFilterSearch() && $scope.currentUrlIsManage)
                    || (!$scope.isFilterSearch() && folder.childFolders.length === 0)
                    || ($scope.isFilterSearch() && folder.progressionSessions.length === 0)) {
                    return 'diary-folder';
                } else {
                    return $scope.selectedFolderIds.indexOf(folder.id) !== -1 ? 'arrow-down' : 'arrow-right';
                }
            } else {
                /* case we are in dashboard */
                return $scope.selectedFolderIds.indexOf(folder.id) !== -1 ? 'arrow-down' : 'arrow-right';
            }
        };

        const initData = async (): Promise<void> => {
            $scope.sessionTypes = new SessionTypes(window.structure.id);
            await Promise.all([
                $scope.sessionTypes.sync(),
                $scope.subjects.sync(window.structure.id),
                $scope.initProgressions()
            ]);
            initForms();

            $scope.progressionFolders.forEach((folder: ProgressionFolder) => {
                folder.progressionSessions.map((psession: ProgressionSession) => {
                    $scope.subjects.all.forEach((subject: Subject) => {
                        if (psession.subject_id === subject.id) {
                            psession.setSubject(subject);
                        }
                    });
                    $scope.sessionTypes.all.forEach((type: SessionType) => {
                        if (psession.type_id === type.id) {
                            psession.setType(type);
                        }
                    });
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
            $scope.homeworkTypes = new HomeworkTypes(window.structure.id);

            $scope.setSubjectSession();
            $scope.setTypeSession();

            await $scope.homeworkTypes.sync();
            $scope.safeApply();

            let elementCalendar: HTMLElement = document.getElementById('calendar-area');
            if (!elementCalendar) {
                $scope.fixEditor();
            }
        };

        $scope.initProgressions = async (): Promise<void> => {
            $scope.progressionFolders = new ProgressionFolders(model.me.userId);
            await $scope.progressionFolders.sync();
            $scope.progressionFolders.all.forEach((progression: ProgressionFolder) => {
                progression.progressionSessions.forEach((psession: ProgressionSession) => {
                    psession.folder_id = progression.id;
                });
                if (progression.id === null && progression.parent_id === null) {
                    progression.title = lang.translate("progression.my.folders");
                }
                return progression;
            });

            $scope.progressionFolders.all.forEach((progressionFolder: ProgressionFolder) =>
                progressionFolder.selected = currentFolder === progressionFolder.id);
            $scope.progressionFoldersToDisplay = Object.assign(Object.create(Object.getPrototypeOf($scope.progressionFolders)), $scope.progressionFolders);
            $scope.progressionFoldersToDisplay.all = ProgressionFolders.organizeTree($scope.progressionFoldersToDisplay.all);
            $scope.subProgressionsItems = $scope.progressionFoldersToDisplay.all;

            $scope.selectedItem = $scope.progressionFolders.all
                .find((progressionFolder: ProgressionFolder) => progressionFolder.id === currentFolder);
            $scope.selectedSubItems = [];
        };

        $scope.groupBy = (subject: Subject): string => {
           if (subject.id === EXCEPTIONAL.subjectId) {
                return lang.translate('subjects.exceptional');
           }
        };

        $scope.setSubjectSession = () => {
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
        };

        $scope.setTypeSession = () => {
            if (!$scope.progressionSessionForm.type.id) {
                $scope.progressionSessionForm.setType($scope.sessionTypes.all[0]);
            }
        };

        $scope.getRootFolder = () => {
            return $scope.progressionFolders ? $scope.progressionFolders.all.find((f) => f.id === null) : null;
        };

        $scope.addFolderSelected = (item: ProgressionFolder, removeOnClick: boolean = true) => {
            let index = $scope.selectedFolderIds.indexOf(item.id);
            if (index === -1) {
                //open folder
                $scope.selectedFolderIds.push(item.id);
            } else if (removeOnClick) {
                //close folder
                $scope.selectedFolderIds.splice(index, 1);
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

        $scope.displayedTable = (): Array<ProgressionSession> => {
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
            return $scope.getProgressionSessions().filter((s: ProgressionSession) => s.tableSelected === true);
        };

        $scope.selectOrUnselectAllSessions = (): void => {
            if ($scope.progressionFolders) {
                let progressionSessions = $scope.selectedItem.progressionSessions;
                progressionSessions.forEach((s) => s.tableSelected = $scope.allSessionsSelect.isAllChecked);
                $scope.updateOptionToaster();
                $scope.safeApply();
            }
        };

        $scope.updateOptionToaster = () => {
            let checkProgressionLength = $scope.getProgressionSessionsChecked().length;
            if (checkProgressionLength === 0) $scope.allSessionsSelect.isAllChecked = false;
        };

        $scope.showOptionToaster = (): boolean => {
            return $scope.getProgressionSessionsChecked().length > 0 || $scope.selectedSubItems.length > 0;
        };

        $scope.isSelectedFolder = (item) => (item instanceof ProgressionFolder && !$scope.isSelectedSession(item)) && ($scope.selectedItem && item.id === $scope.selectedItem.id);

        $scope.isSelectedSession = (item) => (item instanceof ProgressionSession && !$scope.isSelectedFolder(item)) && ($scope.selectedItem && item.id === $scope.selectedItem.id);

        $scope.isFolder = (item) => item instanceof ProgressionFolder;

        $scope.selectItem = (item: ProgressionFolder) => {
            let oldSelected: ProgressionFolder = $scope.selectedItem;
            $scope.progressionFolders.all.map((progressionFolder: ProgressionFolder) => progressionFolder.selected = false);
            if ($scope.selectedItem) {
                $scope.selectedItem.selected = false;
                $scope.selectedItem = (!item) ? null : item;
                if ($scope.selectedItem) $scope.selectedItem.selected = true;
            } else {
                if (item) item.selected = true;
                $scope.selectedItem = item;
            }

            if (item) $scope.addFolderSelected(item, false);

            if (!(oldSelected && item && item.id === oldSelected.id && $scope.isFolder(item) === $scope.isFolder(oldSelected))) {
                initForms();
                $scope.getProgressionSessionsChecked().forEach((s: ProgressionSession) => {
                    s.tableSelected = false;
                });

                let selectedId = $scope.isFolder($scope.selectedItem) ? $scope.selectedItem.id : null;
                $scope.progressionSessionForm.folder_id = selectedId;
                $scope.progressionFolderForm.parent_id = selectedId;
                $scope.selectedSubItems = [];
                $scope.updateOptionToaster();
            }

            // storing folder and the selected folder that will display its children folder
            currentFolder = item.id;
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

        /**
         * Returns true if the progressionSession we pass as parameter as at least 1 progressionSession checked via table
         * @param progressionSessions ProgressionSession array
         */
        $scope.hasProgressionSessionChecked = (progressionSessions: Array<ProgressionSession>): boolean => {
            return progressionSessions
                .filter((progressionSession: ProgressionSession) => progressionSession.tableSelected).length !== 0;
        };

        /* drag & drop method */
        $scope.dropped = async (dragEl: string, dropEl: string) => {
            if (dragEl == dropEl)
                return;
            let dragItem: JQuery = $('#' + dragEl);
            let dropItem: JQuery  = $('#' + dropEl);
            let dropId: any = dropItem.data().itemId;
            let dragId: any = dragItem.data().itemId;

            // We check if it is the origin folder to make sure our dropId value will be Nullable instead of being ""
            if (dropItem.hasClass("folder") && (dropId === null || dropId === "")) {
                dropId = null;
            }

            let folder: ProgressionFolder = $scope.progressionFolders.all.find((f: ProgressionFolder) => f.id === dropId);

            if ((!dropItem.hasClass("folder") && !dropItem.hasClass("sub-folder")) || !folder) return;

            /* case we dropped session item */
            if (dragItem.hasClass("session-item")) {
                let sessionsChecked = $scope.getProgressionSessionsChecked();

                if (sessionsChecked.map((s) => s.id).includes(dragId)) {
                    sessionsChecked.forEach((s) => {
                        s.folder = folder;
                        s.save();
                    });
                } else {
                    let sessions: Array<ProgressionSession> = $scope.getProgressionSessions();
                    let session: ProgressionSession = sessions.find((s: ProgressionSession) => s.id === dragId);
                    if (!session) return;
                    session.folder = folder;
                    session.folder_id = session.folder.id;
                    await session.save();
                }
            } else if (dragItem.hasClass("sub-folder")) {
                /* case we dropped sub folder */
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

        $scope.getIsReadOnly = () => {
            return modeIsReadOnly();
        };

        $scope.showProgressionSessionForm = () => {
            $scope.progressionSessionForm.folder_id = $scope.selectedItem.id;
            $scope.goTo('/progression/create');
            $scope.safeApply();
            $scope.fixEditor();
        };

        $scope.validProgressionsSessionForm = async () => {
            let result = await $scope.toastHttpCall(await $scope.progressionSessionForm.save());
            if (result.succeed) {
                $scope.goTo('/progressions/view');
                await initData();
                $scope.openedCreateFolder = false;
                let data = result.data;
                let resultId = null;
                if(data) {
                    resultId = data.id ? data.id : result.data[0]["id"];
                }
                if (resultId) {
                    $scope.closeModal();
                    let folder = $scope.progressionFolders.all.find((f) => {
                        return f.progressionSessions.find((s) => s.id === resultId);
                    });
                    $scope.initWithOldSelectedItem(folder);
                }
            }
            $scope.safeApply();
        };

        $scope.openParents = (folder) => {
            $scope.selectedFolderIds.push(folder.id);
            if (folder.parent_id)
                $scope.openParents($scope.progressionFolders.all.find((f) => f.id === folder.parent_id));
        };

        $scope.isValidForm = () => {
            return $scope.progressionSessionForm
                && $scope.progressionSessionForm.subject
                && $scope.progressionSessionForm.type.label
                && $scope.progressionSessionForm.title;
        };

        $scope.areValidHomeworks = () => {
            let back = true;
            if (!$scope.progressionSessionForm.progression_homeworks || $scope.progressionSessionForm.progression_homeworks.length == 0)
                return back;
            $scope.progressionSessionForm.progression_homeworks.forEach((item) => {
                return back && item.isValidForm();
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

        $scope.openProgressionSession = (progressionSession: ProgressionSession): void => {
            $scope.progressionSessionForm = progressionSession;
            $scope.safeApply();
            $scope.goTo('/progression/' + progressionSession.id);
        };

        $scope.back = () => {
            $scope.closeModal();
            $scope.cancelProgressionHomework();
            window.history.back();
        };

        $scope.openUpdateItem = (item): void => {
            if (item instanceof ProgressionSession) {
                $scope.progressionSessionForm = item;
                $scope.showProgressionSessionForm();
            } else if ($scope.isFolder($scope.selectedItem) && $scope.selectedItem.deepStep < 5) {
                $scope.progressionFolderForm = item;
                $scope.openedCreateFolder = true;
            }
            $scope.safeApply();
        };

        $scope.initWithOldSelectedItem = (folder: ProgressionFolder) => {
            folder.selected = true;
            $scope.progressionSessionForm.folder_id = folder.id;
            $scope.selectedItem.selected = false;
            $scope.selectedItem = folder;
            $scope.openParents(folder);
        };

        $scope.closeModal = () => {
            $scope.openedCreateFolder = false;
            $scope.openedToasterProgressions = false;

            $scope.openedMoveProgression = {
                isOpened: false,
                checkedProgressionSessions: []
            };
            initForms();
            if ($scope.selectedItem) {
                $scope.progressionSessionForm.folder_id = $scope.selectedItem.id;
                $scope.progressionFolderForm.parent_id = $scope.selectedItem.id;
            }

            $scope.selectedSubItems = [];
        };

        const initForms = (): void => {
            $scope.progressionFolderForm = new ProgressionFolder();
            $scope.progressionSessionForm = new ProgressionSession();
            $scope.progressionSessionForm.folder_id = null;
            $scope.setSubjectSession();
            $scope.setTypeSession();
            $scope.progressionSessionForm.setOwnerId($scope.progressionFolders.owner_id);
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

        /**
         * ⚠ lightboxes methods
         */

        $scope.submitProgressionFolderForm = async (): Promise<void> => {
            $scope.folder_loading = true;
            $scope.safeApply();
            let result = await $scope.progressionFolderForm.save();
            if (result.succeed) {
                $scope.closeModal();
                await initData();
                let resultId = result.data ? result.data.id : null;
                if (resultId) {
                    let folder = $scope.progressionFolders.all.find((f) => f.id === resultId);
                    $scope.initWithOldSelectedItem(folder);
                }
            }
            $scope.folder_loading = false;
            $scope.safeApply();
        };

        $scope.closeForms = (): void => {
            $scope.selectedItem.selected = false;
            $scope.selectedItem = $scope.getRootFolder();
            $scope.selectedItem.selected = true;
            $scope.selectedFolderIds = [null];
            $scope.closeModal();
            $scope.safeApply();
        };

        $scope.filterCycleFolders = () => {
            let result = $scope.progressionFolders ? $scope.progressionFolders.all.filter((i) => i.deepStep < 5) : [];
            if ($scope.progressionFolderForm && $scope.progressionFolderForm.id) {
                return result.filter((i: ProgressionFolder) => {
                    return !(ProgressionFolders.isParentFolder($scope.progressionFolderForm, i));
                });
            }
            return result;
        };

        $scope.deleteItems = async (deepRemove: boolean) => {
            let folderIds = [];
            let sessionIds = [];
            let selectedId = $scope.selectedItem.id ? $scope.selectedItem.id : null;

            $scope.getProgressionSessionsChecked().forEach((s) => sessionIds.push(s.id));
            $scope.delete_loading = true;
            $scope.selectedSubItems.forEach((x) => {
                if (x instanceof ProgressionFolder) ProgressionFolders.idsToRemove(x, deepRemove, folderIds, sessionIds);
            });

            sessionIds.length > 0 ? await ProgressionSessions.delete(sessionIds, model.me.userId) : null;
            folderIds.length > 0 ? await ProgressionFolders.delete(folderIds, model.me.userId) : null;

            await initData();
            $scope.closeModal();
            let folder = $scope.progressionFolders.all.find((f) => f.id === selectedId);
            $scope.initWithOldSelectedItem(folder);

            $scope.delete_loading = false;
            $scope.safeApply();
        };

        $scope.deleteSessions = async (): Promise<void> => {
            $scope.delete_loading = true;
            let selectedId: number = $scope.selectedItem.id ? $scope.selectedItem.id : null;
            let sessionIds: number[] = $scope.getProgressionSessionsChecked().map((s: ProgressionSession) => s.id);
            sessionIds.length > 0 ? await ProgressionSessions.delete(sessionIds, model.me.userId) : null;
            await initData();
            $scope.closeModal();

            let folder: ProgressionFolder = $scope.progressionFolders.all.find((f: ProgressionFolder) => f.id === selectedId);
            $scope.initWithOldSelectedItem(folder);

            $scope.delete_loading = false;
            $scope.safeApply();
        };

        $scope.onDeleteFormProgression = (): void => {
            $scope.openedToasterProgressions = true;
        };

        $scope.onCreateFolderFormProgression = (): void => {
            $scope.openedCreateFolder = true;
        };

        /* Move progression sessions method */
        $scope.onMoveFormProgression = (): void => {
            let progressionSessions: Array<ProgressionSession> = [];
            $scope.getProgressionSessionsChecked().forEach((progressionSession: ProgressionSession) => {
                progressionSessions.push(Object.create(progressionSession));
            });
            $scope.openedMoveProgression = {
                isOpened: true,
                checkedProgressionSessions: progressionSessions
            };
        };

        $scope.moveProgressionSessions = async (): Promise<void> => {
            let sessionProgressionPromises: Array<Promise<void>> = [];
            $scope.openedMoveProgression.checkedProgressionSessions
                .filter((progressionSession: ProgressionSession) => progressionSession.tableSelected)
                .forEach((progressionSession: ProgressionSession) => {
                    progressionSession.folder_id = $scope.progressionFolderForm.parent_id;
                    sessionProgressionPromises.push(progressionSession.save());
                });
            Promise.all(sessionProgressionPromises).then(async () => {
                $scope.closeModal();
                await initData();
                $scope.safeApply();
            });
        };

        /* event handler */
        $scope.$on('$routeChangeStart', function ($event, next, current) {
            $scope.isListView = !(next.originalPath === "/progression/create");
        });

        $scope.progressionSessionForm.eventer.on(`get:end`, () => {
            $scope.safeApply();
        });

        await initData();
    }]
);