import {_, angular, idiom as lang, model, moment, ng} from 'entcore';
import * as jsPDF from 'jspdf';
import * as html2canvas from 'html2canvas';
import {Sessions, Teacher, Visa, Visas} from "../../model";

export let globalAdminCtrl = ng.controller('globalAdminCtrl',
    ['$scope', '$routeParams', '$location', function ($scope, $routeParams, $location) {
        (window as any).jsPDF = jsPDF;
        (window as any).html2canvas = html2canvas;
        $scope.vised = true;
        $scope.notVised = false;
        $scope.allSessionsSelect = false;
        $scope.showOptionToaster = false;
        $scope.params = {
            subjects: [],
            audiences: [],
            teachers: []
        };
        $scope.displayVisa = false;
        $scope.openDetails = null;
        $scope.selectedSessions = {};
        $scope.visas_pdfChoice = [];
        $scope.sessions = new Sessions($scope.structure);
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
                .map(array => array.id)
                .filter(function () {
                    return true
                })
                .toString()
        };
        /**
         * Init de la vue ***
         */
        let syncSessionsWithVisa = async () => {
            // let teacherId;
            let teachers = $scope.params.teachers.length ? getIds($scope.params.teachers) : null;
            let subjects = $scope.params.subjects.length ? getIds($scope.params.subjects) : null;
            let audiences = $scope.params.audiences.length ? getIds($scope.params.audiences) : null;

            await $scope.sessions.syncSessionsWithVisa($scope.filters.startDate, $scope.filters.endDate, $scope.structure.id, teachers, subjects, audiences, $scope.vised, $scope.notVised);

            $scope.sessions.all.forEach(s => {
                s.isInsideDiary = true;
                s.homeworks.forEach(h => h.isInsideDiary = true);

            });
            $scope.sessions_GroupBy_AudienceSubject = Sessions.groupByLevelANdSubject($scope.sessions.all);
            _.each($scope.sessions_GroupBy_AudienceSubject, (item, key) => {
                $scope.selectedSessions[key] = false;
            });
            $scope.allSessionsSelect = false;
            $scope.safeApply();
        };

        $scope.canUpdateSessionsWithVisa = async () => {
            if ($scope.structure.id && $scope.filters.startDate && $scope.filters.endDate &&
                ($scope.params.teachers.length || $scope.params.subjects.length || $scope.params.audiences.length)) {
                await syncSessionsWithVisa();
            } else {
                $scope.sessions_GroupBy_AudienceSubject = [];
            }
            $scope.safeApply();
        };

        $scope.updateDatas = async (event) => {
            // Checking if event is triggered when selecting an element inside multiCombo
            if ((event && event.target && event.target.tagName !== 'BUTTON')) {
                // $scope.params.subjects = [];
                // $scope.params.audiences = [];
                // $scope.params.teachers = [];
                $scope.sessions.structure = $scope.structure;
                angular.forEach($scope.dataToUpdate, function (value, key) {
                    if (Object.getPrototypeOf(value).constructor.name === "Subject") {
                        $scope.params.subjects[key] = value;
                    }
                    if (Object.getPrototypeOf(value).constructor.name === "Audience") {
                        $scope.params.audiences[key] = value;
                    }
                    if (Object.getPrototypeOf(value).constructor.name === "Teacher") {
                        $scope.params.teachers[key] = value;
                    }
                });

                await $scope.canUpdateSessionsWithVisa();
                $scope.safeApply();
            }
        };

        $scope.toggleVisa = async (event) => {
            $scope.displayVisa = !$scope.displayVisa;
            $scope.updateDatas(event);
        };

        $scope.clearSubjects = () => {
            $scope.course.groups = [];
            $scope.params.subjects = [];
        };

        $scope.dropItem = (item, event) => {
            $scope.dataToUpdate = _.without($scope.dataToUpdate, item);
            if ((event && event.target && event.target.tagName !== 'BUTTON')) {
                $scope.params.subjects = [];
                $scope.params.audiences = [];
                $scope.params.teachers = [];
            }
            $scope.updateDatas(event);
        };

        let dropAllItems = (collection) => {
            collection.map((item) => {
                $scope.dataToUpdate = _.without($scope.dataToUpdate, item);
            });
        };

        $scope.init = () => {
            dropAllItems($scope.params.audiences);
            dropAllItems($scope.params.subjects);
            dropAllItems($scope.params.teachers);
            $scope.params = {
                subjects: [],
                audiences: [],
                teachers: []
            };
            if (model.me.type == "ENSEIGNANT") {
                $scope.params.teachers = [_.find($scope.structure.teachers.all, {id: model.me.userId})];
            }
            $scope.canUpdateSessionsWithVisa();
            $scope.safeApply();
        };


        /**
         *   Actions de la vue *****
         */
        $scope.back = () => {
            window.history.back();
        };

        $scope.updateOptionToaster = () => {
            $scope.showOptionToaster = _.chain($scope.selectedSessions)
                .map(item => item)
                .contains(true)
                .value();
            $scope.safeApply();
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
                return moment(date).format("DD/MM/YYYY HH:mm");
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

        $scope.getSessionsIds = (sessionsGroup) => {
            return _.chain(sessionsGroup)
                .pluck("id")
                .value();
        };

        $scope.selectOrUnselectAllSessions = function () {
            let targetValue = $scope.allSessionsSelect;
            _.each($scope.selectedSessions, function (value, key, obj) {
                obj[key] = targetValue;
            });
            $scope.updateOptionToaster();
            $scope.safeApply();
        };
        $scope.unselectAllSessions = function () {
            $scope.allSessionsSelect = false;
            _.each($scope.selectedSessions, function (value, key, obj) {
                obj[key] = false;
            });
            $scope.updateOptionToaster();
            $scope.safeApply();
        };

        /**
         * Utils  *********
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
                    visa.mapFormData(visaSession, $scope.visaForm.comment)
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
                $scope.unselectAllSessions();
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
                await $scope.canUpdateSessionsWithVisa();
                $scope.unselectAllSessions();
                $scope.closeVisaCreateBox();
                $scope.safeApply();
            }
        };

        $scope.init();
    }]);