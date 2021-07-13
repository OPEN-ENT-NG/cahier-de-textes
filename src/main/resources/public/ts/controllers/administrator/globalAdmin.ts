import {idiom as lang, model, moment, ng} from 'entcore';
import * as html2canvas from 'html2canvas';
import {DateUtils, Homeworks, IVisa, Sessions, Visa, Visas} from "../../model";
import {UPDATE_STRUCTURE_EVENTS} from "../../core/enum/events";
import {GroupsSearch} from "../../utils/autocomplete/groupsSearch";
import {INotebookService, SearchService} from "../../services";
import {UsersSearch} from "../../utils/autocomplete/usersSearch";
import {INotebook, INotebookRequest, Notebook} from "../../model/Notebook";
import {FORMAT} from "../../core/const/dateFormat";
import {NOTEBOOK_TYPE} from "../../core/const/notebook-type";
import {IVisaService} from "../../services";
import {IViescolaireService} from "../../services";

export let globalAdminCtrl = ng.controller('globalAdminCtrl',
    ['$scope', '$timeout', '$routeParams', '$location', 'SearchService', 'NotebookService', 'VisaService', 'ViescolaireService',
        function ($scope, $timeout, $routeParams, $location, searchService: SearchService,
                  notebookService: INotebookService, visaService: IVisaService, viescolaireService: IViescolaireService) {
        (window as any).html2canvas = html2canvas;

        /* Init search bar */
        $scope.usersSearch = undefined;
        $scope.groupsSearch = undefined;

        $scope.isLoading = false;
        $scope.notebooks = new Notebook($scope.structure.id);

        $scope.notebookRequest = {} as INotebookRequest;

        $scope.vised = true;
        $scope.notVised = true;
        $scope.archived = false;
        $scope.sharedWithMe = false;
        $scope.published = true;
        $scope.notPublished = true;
        $scope.filters = {
            teacherIds: [],
            audienceIds: [],
            startDate: moment(),
            endDate: moment().endOf('day'),
            orderVisa: false,
            page: 0
        };

        $scope.userType = model.me.type;
        $scope.showSession = false;

        $scope.allSessionsSelect = false;
        $scope.showOptionToaster = false;
        $scope.displayVisa = false;
        $scope.openDetails = null;
        $scope.selectedSessions = {};
        $scope.visas_pdfChoice = [];
        $scope.sessions = new Sessions($scope.structure);
        $scope.openedNotebook = {
            current: null,
            contents: null,
            mainNotebookToVisa: null
        };
        $scope.homeworks = new Homeworks($scope.structure);
        $scope.timeSlotsByDate = [];
        $scope.visaForm = {
            comment: null
        };

        $scope.init = async (): Promise<void> => {
            $scope.notebooks.setStructure($scope.structure.id);

            /* Init search bar */
            $scope.usersSearch = new UsersSearch($scope.structure.id, searchService);
            $scope.groupsSearch = new GroupsSearch($scope.structure.id, searchService);

            const schoolYears = await viescolaireService.getSchoolYearDates($scope.structure.id);
            $scope.filters.startDate = moment(schoolYears.start_date);

            // AutocompleteUtils.init($scope.structure);
            $scope.sessions.structure = $scope.structure;
            // await $scope.filterList();
            await getNotebooks();
        };

        const getNotebooks = async (): Promise<void> => {
            $scope.isLoading = true;
            prepareNotebookRequest();
            await $scope.notebooks.build(await notebookService.getNotebooks($scope.notebookRequest));
            $scope.isLoading = false;
            $scope.safeApply();
        };

        const prepareNotebookRequest = (): void => {
            $scope.notebookRequest.structure_id = $scope.notebooks.structure_id;
            $scope.notebookRequest.start_at = DateUtils.formatDate($scope.filters.startDate, FORMAT.formattedDateTime);
            $scope.notebookRequest.end_at = DateUtils.formatDate($scope.filters.endDate, FORMAT.formattedDateTime);
            $scope.notebookRequest.visa =  $scope.fetchVisaParameter();
            $scope.notebookRequest.orderVisa = $scope.filters.orderVisa;
            $scope.notebookRequest.published = fetchPublishParameter();
            $scope.notebookRequest.teacher_ids = ($scope.isTeacher && $scope.filters.teacherIds.length === 0)
                ? [model.me.userId] : $scope.filters.teacherIds;
            $scope.notebookRequest.audience_ids = $scope.filters.audienceIds;
            $scope.notebookRequest.page = $scope.filters.page;
        };

        $scope.fetchVisaParameter = (): Boolean => {
            if ($scope.vised && $scope.notVised) {
                return null;
            }
            return $scope.vised && !$scope.notVised;
        };

        const fetchPublishParameter = (): Boolean => {
            if ($scope.published && $scope.notPublished) {
                return null;
            }
            return $scope.published && !$scope.notPublished;
        };

        $scope.updateFilter = async (): Promise<void> => {
            $scope.filters.page = 0;
            $scope.showOptionToaster = false;

            /* get our search bar info */
            $scope.filters.teacherIds = $scope.usersSearch.getSelectedUsers().map(user => user["id"]);
            $scope.filters.audienceIds = $scope.groupsSearch.getSelectedGroups().map(group => group["id"]);

            await getNotebooks();
        };

        $scope.openMainNotebook = async (notebook: INotebook): Promise<void> => {
            notebook.isClicked = !notebook.isClicked;
            if (notebook.isClicked) {
                if (notebook.notebookSessionsContents.length === 0) {
                    notebook.notebookSessionsContents = await notebookService
                        .getNotebooksSessionsContent(getNotebookRequest(notebook));
                    $scope.safeApply();
                }
            }
        };

        const getNotebookRequest = (notebook: INotebook): INotebookRequest => {
            return {
                teacher_id: notebook.teacher.id,
                subject_id: notebook.subject.id,
                audience_id: notebook.audience.id,
                structure_id: $scope.notebooks.structure_id,
                start_at: $scope.notebookRequest.start_at,
                end_at: $scope.notebookRequest.end_at,
                visa:  $scope.fetchVisaParameter(),
                published: fetchPublishParameter()
            };
        }

        $scope.changePagination = async (): Promise<void> => {
            $scope.filters.page = $scope.notebooks.notebookResponse.page;
            await getNotebooks();
        };

        // filter visa
        $scope.toggleVised = (): void => {
            $scope.vised = !$scope.vised;
            if (!$scope.vised && !$scope.notVised) {
                $scope.toggleNotVised();
            } else {
                $scope.updateFilter();
            }
        };

        // filter not visa
        $scope.toggleNotVised = (): void => {
            $scope.notVised = !$scope.notVised;
            if (!$scope.vised && !$scope.notVised) {
                $scope.toggleVised();
            } else {
                $scope.updateFilter();
            }
        };

        // filter published
        $scope.togglePublished = (): void => {
            $scope.published = !$scope.published;
            if (!$scope.published && !$scope.notPublished) {
                $scope.toggleNotPublished();
            } else {
                $scope.updateFilter();
            }
        };

        // filter not published
        $scope.toggleNotPublished = (): void => {
            $scope.notPublished = !$scope.notPublished;
            if (!$scope.published && !$scope.notPublished) {
                $scope.togglePublished();
            } else {
                $scope.updateFilter();
            }
        };

        // filter sort visa (date arrow)
        $scope.toggleSortVisa = (): void => {
            // can only trigger if visa is null (default) or is visa
            if ($scope.fetchVisaParameter() === null || $scope.fetchVisaParameter() === true) {
                $scope.filters.orderVisa = !$scope.filters.orderVisa;
                $scope.updateFilter();
            }
        };

        $scope.formatDayDate = (date: string): string => DateUtils.formatDate(date, FORMAT.displayDate);

        $scope.updateOptionToaster = (): void => {
            $scope.showOptionToaster = $scope.notebooks.notebookResponse.all.some((notebook: INotebook) => notebook.isSelected);
            $scope.notebooks.notebookResponse.all
                .filter((notebook: INotebook) => notebook.isSelected)
                .forEach(async (notebook: INotebook) => {
                    if (notebook.notebookSessionsContents.length === 0) {
                        notebook.notebookSessionsContents = await notebookService.getNotebooksSessionsContent(getNotebookRequest(notebook));
                        $scope.safeApply();
                    }
            })
        };

        $scope.getSessionTitle = (notebook: INotebook): string => {
            if (notebook.type === NOTEBOOK_TYPE.SESSION) {
                return notebook.title;
            } else {
                return lang.translate("homework.for.date") + ' ' + DateUtils.formatDate(notebook.date, FORMAT.displayDate);
            }
        };

        $scope.getFormattedTimeNotebook = (notebookSession: INotebook): string => {
            if (notebookSession) {
                if (notebookSession.type === NOTEBOOK_TYPE.HOMEWORK) {
                    return lang.translate('homework.for.date') + ' ' + DateUtils.formatDate(notebookSession.date, FORMAT.displayDate);
                } else {
                    return DateUtils.formatDate(notebookSession.date, FORMAT.displayDate) + ' '
                        + lang.translate('from2') + ' '
                        + DateUtils.getTimeFormat(notebookSession.start_time) + ' '
                        + lang.translate('to2') + ' '
                        + DateUtils.getTimeFormat(notebookSession.end_time);
                }
            } else {
                return "";
            }
        };

        $scope.isHomeworkType = (notebookSession: INotebook): boolean => {
            return notebookSession.type === NOTEBOOK_TYPE.HOMEWORK;
        };

        $scope.selectOrUnselectAllSessions = (): void => {
            if ($scope.allSessionsSelect) {
                $scope.notebooks.notebookResponse.all.forEach((notebook: INotebook) => notebook.isSelected = true);
            } else {
                $scope.notebooks.notebookResponse.all.forEach((notebook: INotebook) => notebook.isSelected = false);
            }
            $scope.updateOptionToaster();
            $scope.safeApply();
        };

        $scope.getSelectedNotebooks = (): Array<INotebook> => {
            if (Object.keys($scope.notebooks.notebookResponse).length === 0) {
                return [];
            }
            return $scope.notebooks.notebookResponse.all.filter((notebook: INotebook) => notebook.isSelected);
        };

        let getSelectedMainNotebooks = (): Array<INotebook> => {
            let notebooks: Array<INotebook> = [];
            if ($scope.notebooks && $scope.notebooks.notebookResponse && $scope.notebooks.notebookResponse.all) {
                return $scope.notebooks.notebookResponse.all.filter((notebook: INotebook) => notebook.isSelected);
            }
            return notebooks;
        };

        /* ----------------------------
         modal/navigation
        ---------------------------- */

        $scope.openContentNotebook = async (notebook: INotebook, mainNotebook: INotebook): Promise<void> => {
            $scope.openedNotebook = {
                current: notebook,
                contents: mainNotebook.notebookSessionsContents,
                mainNotebookToVisa: mainNotebook
            };
            $scope.showSession = true;
        };

        $scope.closeShowSession = (): void => {
            $scope.openedNotebook = {
                current: null,
                contents: null,
                mainNotebookToVisa: null
            };
            $scope.showSession = false;
        };

        $scope.canNavigate = (goingRight: Boolean): boolean => {
            return $scope.openedNotebook.current
                && $scope.openedNotebook.contents[$scope.openedNotebook.contents.indexOf($scope.openedNotebook.current)
                + (goingRight ? 1 : -1)];
        };

        $scope.notebookModalNavigate = (goingRight: Boolean): void => {
            if ($scope.canNavigate(goingRight)) {
                const index = $scope.openedNotebook.contents.indexOf($scope.openedNotebook.current) + (goingRight ? 1 : -1);
                $scope.openedNotebook.current = $scope.openedNotebook.contents[index];
            }
        };

        $scope.isLastNotebookContent = (): boolean => {
            if ($scope.openedNotebook.current && $scope.openedNotebook.contents) {
                const index: number = $scope.openedNotebook.contents.indexOf($scope.openedNotebook.current);
                return ($scope.openedNotebook.contents.length - 1) === index;
            }
        };

        $scope.isOwnNotebook = (notebook: INotebook): boolean => {
            if (notebook) {
                return notebook.teacher.id === model.me.userId;
            }
        };

        $scope.redirectNotebookSessionHomework = (notebook: INotebook): void => {
            $scope.goTo((notebook.type === NOTEBOOK_TYPE.HOMEWORK ? '/homework' : '/session') + '/update/' + notebook.id);
        };

        /* ----------------------------
             Visa part
        ---------------------------- */

        $scope.consultVisasFromNotebook = async (): Promise<void> => {
            let mainSelectedNotebooks: Array<INotebook> = $scope.getSelectedNotebooks();
            let sessionIds: Array<number> = [];
            let homeworkIds: Array<number> = [];

            mainSelectedNotebooks.forEach((mainNotebook: INotebook) => {
                mainNotebook.notebookSessionsContents.forEach((content: INotebook) => {
                    if (content.type === NOTEBOOK_TYPE.SESSION) {
                        sessionIds.push(content.id);
                    }
                    if (content.type === NOTEBOOK_TYPE.HOMEWORK) {
                        homeworkIds.push(content.id);
                    }
                })
            });

            let fetchedVisas: Array<IVisa> = await visaService.getVisas($scope.structure.id, sessionIds, homeworkIds);

            let visas: Array<Visa> = [];
            fetchedVisas.forEach((fetchedVisa: IVisa) => {
                let visa: Visa = new Visa($scope.structure);
                visa.buildVisaData(fetchedVisa, getTeacherInfoForVisa(fetchedVisa.created, mainSelectedNotebooks[0]));
                visas.push(visa);
            });

            $scope.visas_pdfChoice = visas;
            $scope.visaPdfDownloadBox = true;
            $scope.safeApply();
        };

        const getTeacherInfoForVisa = (created_at: string, notebookContent: INotebook): string => {
            return DateUtils.formatDate(created_at, FORMAT.displayDate) +
                " - " + notebookContent.audience.name + " - " + notebookContent.teacher.displayName;
        };

        $scope.getVisasFromSelectedNotebooks = (): Array<Visa> => {
            let visas: Array<Visa> = [];
            $scope.getSelectedNotebooks().forEach((mainNotebook: INotebook) => {
                mainNotebook.notebookSessionsContents.forEach((notebookContent: INotebook) => {
                    // check if has visa + prevent duplicate data
                    if (notebookContent.visas.id !== null && (!visas.some((visa: Visa) => visa.id === notebookContent.visas.id))) {
                        let visa: Visa = new Visa($scope.structure);
                        visas.push(visa);
                    }
                });
            });
            return visas;
        };

        $scope.closeVisaPdfDownloadBox = (): void => {
            $scope.visas_pdfChoice = [];
            $scope.visaPdfDownloadBox = null;
        };

        $scope.wantCreateVisa = (): void => {
            $scope.visaCreateBox = true;
        };

        $scope.closeVisaCreateBox = (): void => {
            $scope.visas_pdfChoice = [];
            $scope.visaCreateBox = null;
        };

        $scope.getVisasInfo = (visaDate: string): string => {
            if (visaDate) {
                return lang.translate("sessions.admin.visa.sate.on") + DateUtils.formatDate(visaDate, FORMAT.displayDate);
            } else {
                return lang.translate("sessions.admin.Visa.sateKo");
            }
        };

        $scope.printPdf = async (): Promise<void> => {
            $scope.printPdf.loading = true;
            let mainNotebooks: Array<INotebook> = getSelectedMainNotebooks();
            let visas: Visas = createVisasData(mainNotebooks);
            visas.getPDF(() => {
                $scope.printPdf.loading = false;
                $scope.allSessionsSelect = false;
                $scope.selectOrUnselectAllSessions();
            });
        };

        const createVisasData = (mainNotebooks: Array<INotebook>): Visas => {
            let visas: Visas = new Visas($scope.structure);
            mainNotebooks.forEach((mainNotebook: INotebook) => {
                if (mainNotebook) {
                    let visa: Visa = new Visa($scope.structure);
                    visa.mapFormData(mainNotebook.notebookSessionsContents, $scope.visaForm.comment);
                    visas.all.push(visa);
                }
            });
            return visas;
        };

        $scope.submitVisaForm = async (): Promise<void> => {
            $scope.visaForm.loading = true;
            let mainNotebooks: Array<INotebook> = $scope.openedNotebook.mainNotebookToVisa != null
                ? [$scope.openedNotebook.mainNotebookToVisa] : getSelectedMainNotebooks();
            $scope.visaForm.nbSessions = 0;

            mainNotebooks.forEach((notebooks: INotebook) => {
                $scope.visaForm.nbSessions += notebooks.sessions;
            });

            let visas: Visas = createVisasData(mainNotebooks);
            let {succeed} = await visas.save();

            if (succeed) {
                $scope.updateFilter();
                $scope.selectOrUnselectAllSessions(false);
                $scope.visaForm.comment = "";
                $scope.closeVisaCreateBox();
                // method to remove potential lightbox-opened
                $scope.clearLightbox();
                // related to method clearLightbox()
                // using $timeout in order to remove potential multiple lightbox css + their z-index
                $timeout((): void => $scope.closeShowSession());
                $scope.safeApply();
            }
        };

        /* ----------------------------
            Autocomplete search
        ---------------------------- */

        /* Search bar users section */
        $scope.searchUser = async (userForm: string): Promise<void> => {
            await $scope.usersSearch.searchUsers(userForm);
            $scope.safeApply();
        };

        $scope.selectUser = (valueInput, userItem): void => {
            $scope.usersSearch.selectUsers(valueInput, userItem);
            $scope.usersSearch.user = "";
            $scope.updateFilter();
        };

        $scope.removeSelectedUsers = (userItem): void => {
            $scope.usersSearch.removeSelectedUsers(userItem);
            $scope.updateFilter();
        };

        /* Search bar groups section */
        $scope.searchGroup = async (groupForm: string): Promise<void> => {
            await $scope.groupsSearch.searchGroups(groupForm);
            $scope.safeApply();
        };

        $scope.selectGroup = (valueInput, groupForm): void => {
            $scope.groupsSearch.selectGroups(valueInput, groupForm);
            $scope.filters.audienceIds = $scope.groupsSearch.getSelectedGroups().map(group => group["id"]);
            $scope.groupsSearch.group = "";
            $scope.updateFilter();
        };

        $scope.removeSelectedGroups = (groupForm): void => {
            $scope.groupsSearch.removeSelectedGroups(groupForm);
            $scope.filters.audienceIds = $scope.groupsSearch.getSelectedGroups().map(group => group["id"]);
            $scope.updateFilter();
        };

        $scope.back = () => {
            window.history.back();
        };

        // We use this condition to prevent $scope.init to be called twice with $scope.$on to handle multiple structure
        $scope.init();

        $scope.$on(UPDATE_STRUCTURE_EVENTS.UPDATE, () => {
            $scope.init();
        });
    }]);