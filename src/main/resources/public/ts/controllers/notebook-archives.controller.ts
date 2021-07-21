import {model, ng} from 'entcore';
import {INotebookArchiveService} from '../services';
import {DateUtils, NotebookArchive, NotebookArchiveParams, NotebookArchiveResponse, USER_TYPES} from '../model';
import {GroupsSearch} from '../utils/autocomplete/groupsSearch';
import {NotebookArchiveSearch} from "../utils/autocomplete/notebookArchiveSearch";

declare let window: any;

interface IFilter {
    schoolYear: string;
    users: Array<string>;
    audiences: Array<string>;
    page: number;
}

interface IViewModel {
    filter: IFilter;
    notebookArchives: Array<NotebookArchive>;
    notebookArchiveYears: Array<string>;
    pageCount: number;
    notebookArchiveSearch: NotebookArchiveSearch;
    groupsSearch: GroupsSearch;
    allArchivesSelect: boolean;

    getNotebookArchives(): Promise<void>;

    getNotebookArchiveYears(): Promise<void>;

    downloadPDF(archiveId: number): Promise<void>;

    downloadMultiplePDFs(): Promise<void>;

    getArchivedDateString(notebookArchive: NotebookArchive): string;

    getNbSelectedArchives(): number;

    updateFilter(): Promise<void>;

    changePagination(): Promise<void>;

    selectOrUnselectAllArchives(): void;

    /* search bar methods */
    searchTeacher(userForm: string): Promise<void>;

    selectTeacher(valueInput: string, teacherItem: string): void;

    removeSelectedTeacher(teacherItem: string): void;

    searchAudience(audienceForm: string): Promise<void>;

    selectAudience(valueInput: string, groupItem: string): void;

    removeSelectedAudiences(groupItem: string): void;
}

export const notebookArchivesController = ng.controller('NotebookArchivesController',
    ['$scope', 'route', '$location', 'NotebookArchiveService',
        function ($scope, route, $location, notebookArchiveService: INotebookArchiveService) {
            const vm: IViewModel = this;

            vm.filter = {
                schoolYear: null,
                users: [],
                audiences: [],
                page: 0
            };

            vm.notebookArchives = [];
            vm.notebookArchiveYears = [];
            vm.pageCount = 0;

            vm.notebookArchiveSearch = undefined;
            vm.allArchivesSelect = false;

            /**
             * Get notebook archives from filter parameters.
             */
            vm.getNotebookArchives = async (): Promise<void> => {
                let notebookArchiveParams: NotebookArchiveParams = {
                    schoolYear: vm.filter.schoolYear,
                    teacherName: ($scope.isTeacher && vm.filter.users.length === 0)
                        ? [`${model.me.firstName} ${model.me.lastName}`] : vm.filter.users,
                    audienceLabel: vm.filter.audiences,
                    page: vm.filter.page
                };

                notebookArchiveService.getNotebookArchives(window.structure.id, notebookArchiveParams)
                    .then((res: NotebookArchiveResponse) => {
                        vm.notebookArchives = res.all.map(n => {
                            return {
                                id: n.id,
                                structureId: n.structure_id,
                                structureLabel: n.structure_label,
                                teacherId: n.teacher_id,
                                teacherFirstName: n.teacher_first_name,
                                teacherLastName: n.teacher_last_name,
                                audienceLabel: n.audience_label,
                                subjectLabel: n.subject_label,
                                schoolYear: n.archive_school_year,
                                createdAt: n.created_at,
                                fileId: n.file_id
                            };
                        });
                        vm.pageCount = res.page_count;
                        $scope.safeApply();
                    });
            };

            /**
             * Get list of notebook archive school years.
             */
            vm.getNotebookArchiveYears = async (): Promise<void> => {
                vm.notebookArchiveYears = await notebookArchiveService.getArchiveYears(window.structure.id);
                $scope.safeApply();
            };

            /**
             * Download a single PDF for an archive
             * @param archiveId     archive identifier
             */
            vm.downloadPDF = async (archiveId: number): Promise<void> => {
                await notebookArchiveService.exportNotebookArchives(window.structure.id, [archiveId]);
            };

            /**
             * Download multiple PDFs for all selected archives.
             */
            vm.downloadMultiplePDFs = async (): Promise<void> => {
                let archiveIds: Array<number> = [];

                vm.notebookArchives.forEach((archive: NotebookArchive) => {
                    if (archive.isSelected) {
                        archiveIds.push(archive.id);
                    }
                });

                await notebookArchiveService.exportNotebookArchives(window.structure.id, archiveIds);
            };

            /**
             * Get the archive creation date display text
             * @param notebookArchive   the notebook archive
             */
            vm.getArchivedDateString = (notebookArchive: NotebookArchive): string => {
                return DateUtils.getDisplayDate(notebookArchive.createdAt);
            };

            /**
             * Get the number of selected notebook archives.
             */
            vm.getNbSelectedArchives = (): number => {
                let numberArchives: number = 0;
                vm.notebookArchives.forEach((archive: NotebookArchive) => {
                    if (archive.isSelected) numberArchives++;
                });
                return numberArchives;
            };

            /**
             * Update the archive list from new filter parameters.
             */
            vm.updateFilter = async (): Promise<void> => {
                if (vm.notebookArchiveSearch) {
                    vm.filter.users = vm.notebookArchiveSearch.getSelectedTeachers();
                    vm.filter.audiences = vm.notebookArchiveSearch.getSelectedAudiences();
                }

                vm.filter.page = 0;

                if ('structure' in window) {
                    await vm.getNotebookArchives();
                }

                $scope.safeApply();
            };

            /**
             * Load notebook archives when changing page.
             */
            vm.changePagination = async (): Promise<void> => {
                await vm.getNotebookArchives();
            };

            /**
             * Select of unselect all notebook archives.
             */
            vm.selectOrUnselectAllArchives = (): void => {
                vm.notebookArchives.forEach((archive: NotebookArchive) => {
                    archive.isSelected = vm.allArchivesSelect;
                });
                $scope.safeApply();
            };
            

            /**
             * Search teacher based on form input.
             * @param userForm  the user form input.
             */
            vm.searchTeacher = async (userForm: string): Promise<void> => {
                await vm.notebookArchiveSearch.searchTeachers(userForm);
                $scope.safeApply();
            };

            /**
             * Select a user from the search results.
             * @param valueInput    the user input.
             * @param teacherItem   the teacher element selected.
             */
            vm.selectTeacher = (valueInput: string, teacherItem: string): void => {
                vm.notebookArchiveSearch.selectTeachers(valueInput, teacherItem);
                vm.filter.users = vm.notebookArchiveSearch.getSelectedTeachers();
                vm.notebookArchiveSearch.teacher = '';
                vm.updateFilter();
            };

            /**
             * Remove a selected user from the search filters.
             * @param teacherItem the teacher to remove
             */
            vm.removeSelectedTeacher = (teacherItem: string): void => {
                vm.notebookArchiveSearch.removeSelectedTeachers(teacherItem);
                vm.updateFilter();
            };

            /**
             * Search audience based on form input.
             * @param audienceForm the audience form input.
             */
            vm.searchAudience = async (audienceForm: string): Promise<void> => {
                await vm.notebookArchiveSearch.searchAudiences(audienceForm);
                $scope.safeApply();
            };

            /**
             * Select an audience from the search results.
             * @param valueInput    the user input.
             * @param audienceForm  the audience element selected.
             */
            vm.selectAudience = (valueInput: string, audienceForm: string): void => {
                vm.notebookArchiveSearch.selectAudiences(valueInput, audienceForm);
                vm.filter.audiences = vm.notebookArchiveSearch.getSelectedAudiences();
                vm.notebookArchiveSearch.audience = '';
                vm.updateFilter();
            };

            /**
             * Remove a selected audience from the search filters.
             * @param audienceForm the audience to remove
             */
            vm.removeSelectedAudiences = (audienceForm: string): void => {
                vm.notebookArchiveSearch.removeSelectedAudiences(audienceForm);
                vm.filter.audiences = vm.notebookArchiveSearch.getSelectedAudiences();
                vm.updateFilter();
            };

            /**
             * Initialize data.
             */
            const initData = async (): Promise<void> => {
                vm.notebookArchiveSearch = new NotebookArchiveSearch(window.structure.id, notebookArchiveService);
                await vm.getNotebookArchiveYears();
                vm.filter.schoolYear = vm.notebookArchiveYears.length > 0 ? vm.notebookArchiveYears[0] : null;
                await vm.getNotebookArchives();
            };

            $scope.$watch(() => window.structure, async () => {
                if ('structure' in window) {
                    vm.filter.users = [];
                    vm.filter.audiences = [];
                    vm.filter.page = 0;
                    await initData();
                }
            });
        }]);