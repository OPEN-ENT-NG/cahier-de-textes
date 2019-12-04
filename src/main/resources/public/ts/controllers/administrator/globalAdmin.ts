import {_, angular, idiom as lang, model, moment, ng} from 'entcore';
import * as jsPDF from 'jspdf';
import {AutocompleteUtils} from '../../utils/autocompleteUtils';
import * as html2canvas from 'html2canvas';
import {Sessions, Teacher, DateUtils, Visa, Visas} from "../../model";


export let globalAdminCtrl = ng.controller('globalAdminCtrl',
    ['$scope', '$routeParams', '$location', function ($scope, $routeParams, $location) {
        (window as any).jsPDF = jsPDF;
        (window as any).html2canvas = html2canvas;
        $scope.vised = true;
        $scope.notVised = false;
        $scope.archived = false;
        $scope.sharedWithMe = false;
        $scope.published = true;
        $scope.notPublished = true;
        $scope.autocomplete = AutocompleteUtils;


        $scope.userType = model.me.type;

        $scope.allSessionsSelect = true;
        $scope.showOptionToaster = false;
        $scope.displayVisa = false;
        $scope.openDetails = null;
        $scope.selectedSessions = {};
        $scope.visas_pdfChoice = [];
        $scope.sessions = new Sessions($scope.structure);
        $scope.homeworks = [];
        $scope.filters = {
            startDate: moment(),
            endDate: moment()
        };
        //Set default date 09-01 to 07-15 of current school year
        if (parseInt($scope.filters.startDate.format('MM')) < 9) {
            $scope.filters.startDate = $scope.filters.startDate.date(1).month(8).subtract(1, "years");
            $scope.filters.endDate = $scope.filters.endDate.date(15).month(6);
        } else {
            $scope.filters.startDate = $scope.filters.startDate.date(1).month(8);
            $scope.filters.endDate = $scope.filters.endDate.date(15).month(6).add(1, "years");
        }

        $scope.structureSwitchEvent = async () => {
            $scope.teacher = null;
            $scope.teacherId = null;
            $scope.sessions_GroupBy_AudienceSubject = [];
            $scope.init();
            $scope.safeApply();
        };

        let getIds = (collection) => {
            return collection
                .filter(x => x)
                .map(array => array.id)
                .toString()
        };
        /**
         * Init de la vue ***
         */
        /*let syncSessionsWithVisa = async () => {
            // let teacherId;
            let teachers = $scope.params.teachers.length ? getIds($scope.params.teachers) : null;
            let audiences = $scope.params.audiences.length ? getIds($scope.params.audiences) : null;
            await $scope.sessions.syncSessionsWithVisa($scope.filters.startDate, $scope.filters.endDate, $scope.structure.id, teachers, audiences, $scope.vised, $scope.notVised);


        };*/


        $scope.filterList = async () => {
            $scope.selectOrUnselectAllSessions(false);
            $scope.homeworks = [];
            const teachersSelected = AutocompleteUtils.getTeachersSelected();
            const classesSelected = AutocompleteUtils.getClassesSelected();
            let teachers = teachersSelected.length ? getIds(teachersSelected) : null;
            let audiences = classesSelected.length ? getIds(classesSelected) : null;
            await $scope.sessions.syncSessionsWithVisa($scope.filters.startDate,
                $scope.filters.endDate,
                $scope.structure.id,
                teachers,
                audiences,
                $scope.vised,
                $scope.notVised,
                $scope.archived,
                $scope.sharedWithMe,
                $scope.published,
                $scope.notPublished);
            $scope.sessions.all.forEach(s => {
                s.isInsideDiary = true;
                s.homeworks.forEach(h => {
                    h.isInsideDiary = true;
                    if ($scope.homeworks.map(sh => sh.id).indexOf(h.id) === -1) $scope.homeworks.push(h);
                });
            });
            const sessions = [...$scope.homeworks, ...$scope.sessions.all];
            $scope.sessions_GroupBy_AudienceSubject = Sessions.groupByLevelANdSubject(sessions);

            _.each($scope.sessions_GroupBy_AudienceSubject, (item, key) => {
                $scope.selectedSessions[key] = false;
                $scope.sessions_GroupBy_AudienceSubject[key] = item.sort((a, b) => {
                    const dateA = a.dueDate ? a.dueDate : a.startMoment;
                    const dateB = b.dueDate ? b.dueDate : b.startMoment;
                    return moment(dateA).diff(moment(dateB));
                });
            });
            $scope.allSessionsSelect = false;
            $scope.safeApply();
        };


        /*$scope.canUpdateSessionsWithVisa = async () => {
            if ($scope.structure.id && $scope.filters.startDate && $scope.filters.endDate &&
                ($scope.params.teachers.length || $scope.params.audiences.length)) {
                await syncSessionsWithVisa();
            } else {
                $scope.sessions_GroupBy_AudienceSubject = [];
            }
            $scope.safeApply();
        };*/

        $scope.updateDatas = async (event) => {
            // Checking if event is triggered when selecting an element inside multiCombo
            $scope.sessions.structure = $scope.structure;
            if (event.target.tagName == 'BUTTON') {
                if (event.target.innerHTML == lang.translate("utils.teachers")) {
                    $scope.params.teachers = [];
                }
                if (event.target.innerHTML == lang.translate("utils.groups")) {
                    $scope.params.audiences = [];
                }
            }
            angular.forEach($scope.dataToUpdate, function (value, key) {
                if (Object.getPrototypeOf(value).constructor.name === "Audience") {
                    $scope.params.audiences[key] = value;
                }
                if (Object.getPrototypeOf(value).constructor.name === "Teacher") {
                    $scope.params.teachers[key] = value;
                }
            });

            await $scope.canUpdateSessionsWithVisa();
            $scope.safeApply();
        };

        $scope.toggleVisa = async (event) => {
            $scope.displayVisa = !$scope.displayVisa;
            $scope.updateDatas(event);
        };

        $scope.toggleVised = () => {
            $scope.vised = !$scope.vised;
            if (!$scope.vised && !$scope.notVised) $scope.toggleNotVised();
        };

        $scope.toggleNotVised = () => {
            $scope.notVised = !$scope.notVised;
            if (!$scope.vised && !$scope.notVised) $scope.toggleVised();
        };

        $scope.togglePublished = () => {
            $scope.published = !$scope.published;
            if (!$scope.published && !$scope.notPublished) $scope.toggleNotPublished();
        };

        $scope.toggleNotPublished = () => {
            $scope.notPublished = !$scope.notPublished;
            if (!$scope.published && !$scope.notPublished) $scope.togglePublished();
        };

        $scope.clearSubjects = () => {
            $scope.course.groups = [];
            $scope.params.subjects = [];
        };

        $scope.init = async () => {
            AutocompleteUtils.init($scope.structure);
            if ($scope.userType == "ENSEIGNANT") {
                AutocompleteUtils.setTeachersSelected([_.find($scope.structure.teachers.all, {id: model.me.userId})]);
            }
            await $scope.filterList();
        };


        /**
         *   Actions de la vue *****
         */
        $scope.back = () => {
            window.history.back();
        };

        $scope.updateOptionToaster = () => {
            if($scope.sessionsUnselected().length > 0) $scope.allSessionsSelect = false;
            $scope.showOptionToaster = _.chain($scope.selectedSessions)
                .map(item => item)
                .contains(true)
                .value();
        };


        $scope.wantDownloadPdf = (sessionsGroups) => {
            $scope.visas_pdfChoice = $scope.getVisas(sessionsGroups);
            let audiences = (_.chain(sessionsGroups).pluck("audience").pluck("name").uniq().value()).toString();
            let teachers = (_.chain(sessionsGroups).pluck("teacher").pluck("displayName").uniq().value()).toString();
            $scope.visas_pdfChoice.map(visa => {
                visa.displayDwlName = moment(visa.created).format("DD/MM/YYYY") + " - " + audiences + " - " + teachers;
            });
            $scope.visas_pdfChoice = _.sortBy($scope.visas_pdfChoice, function (o) {
                return moment(o.created).format("YYYYMMDD");
            });
            $scope.visaPdfDownloadBox = true;
        };

        $scope.closeVisaPdfDownloadBox = () => {
            $scope.visas_pdfChoice = [];
            $scope.visaPdfDownloadBox = null;
        };

        $scope.wantCreateVisa = () => {
            $scope.visaCreateBox = true;
        };

        $scope.closeVisaCreateBox = () => {
            $scope.visas_pdfChoice = [];
            $scope.visaCreateBox = null;
        };

        /**
         * Sort utils, and objects sorting to display *********
         */
        $scope.getVisas = (sessionsGroup) => {
            return _.chain(sessionsGroup)
                    .pluck('visas')
                    .filter(x => x)
                    .flatten()
                    .uniq(function (visa) {
                        return visa.id;
                    }).value()
                || [];
        };

        $scope.getLastEditSession = (sessionsGroup) => {
            var date = _.chain(sessionsGroup)
                .pluck("modified")
                .sort()
                .last()
                .value();
            if (date)
                return moment(date).format("DD/MM/YYYY");
            else
                return '-';
        };

        $scope.getLastCreatedVisa = (sessionsGroup) => {

            var date = _.chain($scope.getVisas(sessionsGroup))
                .pluck("created")
                .sort()
                .last()
                .value();
            if (date)
                return lang.translate("sessions.admin.Visa.sateOk");
            else
                return lang.translate("sessions.admin.Visa.sateKo");
        };

        $scope.getSessionTitle = (timeSlot) => {
            if (timeSlot.title) return timeSlot.title;
            if (timeSlot.attachedToSession) return lang.translate("homework.for.date") + ' ' + DateUtils.formatDate(timeSlot.dueDate, 'DD/MM/YYYY');
            return DateUtils.getFormattedTimeSlotDate(timeSlot);
        };

        $scope.getFormattedTimeSlotDate = (timeSlot) => {
            return DateUtils.getFormattedTimeSlotDate(timeSlot);
        };

        $scope.getSessionsIds = (sessionsGroup) => {
            return _.chain(sessionsGroup)
                .pluck("id")
                .value();
        };

        $scope.selectOrUnselectAllSessions = function (isSelected = null) {
            if(isSelected) $scope.allSessionsSelect = isSelected;
            let targetValue = $scope.allSessionsSelect;
            _.each($scope.selectedSessions, function (value, key, obj) {
                obj[key] = targetValue;
            });
            $scope.updateOptionToaster();
            $scope.safeApply();
        };

        $scope.sessionsSelected = () => {
            return Object.keys($scope.selectedSessions).filter(x => $scope.selectedSessions[x] === true);
        };
        $scope.sessionsUnselected = () => {
            return Object.keys($scope.selectedSessions).filter(x => $scope.selectedSessions[x] === false);
        };

        $scope.filterTeacherOptions = async (value) => {
            await AutocompleteUtils.filterTeacherOptions(value);
        };

        $scope.filterClassOptions = async (value) => {
            await AutocompleteUtils.filterClassOptions(value);
        };

        $scope.selectTeacher = async (model, item) =>  {
            AutocompleteUtils.selectTeacher(model, item);
            await $scope.filterList();
            AutocompleteUtils.resetSearchFields();
        };

        $scope.selectClass = async (model, item) =>  {
            AutocompleteUtils.selectClass(model, item);
            await $scope.filterList();
            AutocompleteUtils.resetSearchFields();
        };

        $scope.removeTeacher = async (value) =>  {
            AutocompleteUtils.removeTeacherSelected(value);
            await $scope.filterList();
        };

        $scope.removeClass = async (value) =>  {
            AutocompleteUtils.removeClassSelected(value);
            await $scope.filterList();
        };

        /**
         * DateUtils  *********
         */

        let getSelectedSessions = () => {
            let idsSelected =
                _.chain($scope.selectedSessions)
                    .map(function (val, key) {
                        if (val == true)
                            return key;
                    })
                    .reject(_.isUndefined)
                    .value();

            return _.filter($scope.sessions_GroupBy_AudienceSubject, (item, key) => {
                return _.contains(idsSelected, key)
            });
        };


        $scope.safeApply();


        /**
         *  Starting Visas actions ************
         **/

        $scope.visaForm = {
            comment: null
        };

        let updateNbSessions = (sessionsGroups) => {
            $scope.visaForm.nbSessions =
                _.chain($scope.sessionsGroups)
                    .filter(item => item.selected == true)
                    .pluck('nbSessions')
                    .reduce((count, num) => count + num)
                    .value();
        };

        let createVisasData = (sessionsGroups) => {
            let visas = new Visas($scope.structure);
            sessionsGroups.forEach((visaSession) => {
                if (visaSession) {
                    let visa = new Visa($scope.structure);
                    visa.mapFormData(visaSession, $scope.visaForm.comment);
                    visas.all.push(visa);
                }
            });
            return visas;
        };


        $scope.printPdf = async () => {
            $scope.printPdf.loading = true;
            let sessionsGroups = getSelectedSessions();
            let visas = createVisasData(sessionsGroups);
            visas.getPDF(() => {
                $scope.printPdf.loading = false;
                $scope.selectOrUnselectAllSessions(false);
            });
        };


        $scope.submitVisaForm = async () => {
            $scope.visaForm.loading = true;
            $scope.safeApply();

            let sessionsGroups = getSelectedSessions();
            updateNbSessions(sessionsGroups);
            let visas = createVisasData(sessionsGroups);
            let {succeed} = await visas.save();

            if (succeed) {
                await $scope.filterList();
                $scope.selectOrUnselectAllSessions(false);
                $scope.closeVisaCreateBox();
                $scope.safeApply();
            }
        };

        $scope.init();

        $scope.$watch(() => $scope.structure, async () => {
            AutocompleteUtils.init($scope.structure);
            if ($scope.userType != "ENSEIGNANT") {
                $scope.sessions.structure = $scope.structure;
                await $scope.filterList();
            }
        });
    }]);