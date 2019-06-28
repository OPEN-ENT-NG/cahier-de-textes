import {_, idiom as lang, model, moment, ng, angular, notify} from 'entcore';
import {Sessions, Subjects, Audiences} from '../../model/index';
import * as jsPDF from 'jspdf';
import * as html2canvas from 'html2canvas';
import {Utils} from "../../utils/utils";
import {Teacher, Visa, Visas} from "../../model";

export let globalAdminCtrl = ng.controller('globalAdminCtrl',
    ['$scope', '$routeParams', '$location', function ($scope, $routeParams, $location) {
        (window as any).jsPDF = jsPDF;
        (window as any).html2canvas = html2canvas;
        $scope.vised = true;
        $scope.notVised = false;
        $scope.allSessionsSelect = false;
        $scope.showOptionToaster = false;
        $scope.subjects = new Subjects();
        $scope.audiences = new Audiences();
        $scope.params = {
            subjects: [],
            audiences: []
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
        }
        else {
            $scope.filters.startDate = $scope.filters.startDate.date(1).month(8);
            $scope.filters.endDate = $scope.filters.endDate.date(15).month(6).add(1, "years");
        }

        $scope.changeStructure = async (structure) =>{
          await  $scope.$parent.switchStructure(structure);
          await  $scope.syncSessionsWithVisa();

        }

        $scope.structureSwitchEvent = async () =>{
            $scope.teacher = null;
            $scope.teacherId = null;
            $scope.sessions_GroupBy_AudienceSubject = [];
            await $scope.audiences.sync($scope.structure.id);
            await $scope.subjects.sync($scope.structure.id);
            console.log($scope.subjects)
            await $scope.updateDatas("",true);
            $scope.safeApply();
        }
        /**
         * Init de la vue ***
         */
        $scope.syncSessionsWithVisa = async () => {
            // let teacherId;
            if($scope.teacher)
                $scope.teacherId = $scope.teacher.id;

            await Promise.all([
                ($scope.teacherId)? await $scope.subjects.sync($scope.structure.id, $scope.teacherId) : await $scope.subjects.sync($scope.structure.id),
                // await $scope.audiences.sync($scope.structure.id) // TODO faire un tri par prof ?
            ]);

            $scope.sessions.structure = $scope.structure;
            if($scope.subjects.all.length && $scope.subjects.all.length === 1  ){
                $scope.params.subjects.push($scope.subjects.all[0]);
                $scope.course.groups.push($scope.subjects.all[0]);

                await $scope.sessions.syncSessionsWithVisa($scope.filters.startDate, $scope.filters.endDate,$scope.structure.id,  ($scope.teacherId)?$scope.teacherId :"",$scope.subjects.all[0].id,"", $scope.vised , $scope.notVised);
            }else{
                await $scope.sessions.syncSessionsWithVisa($scope.filters.startDate, $scope.filters.endDate,$scope.structure.id, ($scope.teacherId)?  $scope.teacherId:"", "" ,"", $scope.vised,$scope.notVised);
            }
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

        $scope.updateSessionsVisa =  async () =>{
            await $scope.sessions.syncSessionsWithVisa(
                $scope.filters.startDate,
                $scope.filters.endDate,
                $scope.structure.id,
                $scope.teacherId,
                // filter empty args in array
                $scope.params.subjects.map(array => array.id).filter(function () { return true }).toString(),
                $scope.params.audiences.map(array => array.id).filter(function () { return true }).toString(),
                $scope.vised,
                $scope.notVised
            );
        }

        $scope.updateDatas = async (event, switchStruc?) => {
            // Checking if event is triggered when selecting an element inside multiCombo
            if ((event && event.target && event.target.tagName !== 'BUTTON') || switchStruc) {
                $scope.params.subjects = [];
                $scope.params.audiences = [];
                $scope.sessions.structure = $scope.structure;

                angular.forEach($scope.course.groups, function(value, key) {
                    if (Object.getPrototypeOf(value).constructor.name === "Subject") {
                        $scope.params.subjects[key] = value;
                    }
                    if (Object.getPrototypeOf(value).constructor.name === "Audience") {
                        $scope.params.audiences[key] = value;
                    }
                });

                await $scope.updateSessionsVisa();
                $scope.sessions_GroupBy_AudienceSubject = Sessions.groupByLevelANdSubject($scope.sessions.all);
                $scope.safeApply();
            }
        };

        $scope.toggleVisa = async (event) => {
            $scope.displayVisa = !$scope.displayVisa;
            $scope.updateDatas(event);
        };

        $scope.clearSubjects = () =>{
            $scope.course.groups =[];
            $scope.params.subjects = [];
        }
        $scope.dropItem = async (item, event) => {
            $scope.course.groups = _.without($scope.course.groups, item);
            $scope.updateDatas(event);
        };
        $scope.init = async () => {
            if (model.me.type == "ENSEIGNANT") {
                $scope.teacher = new Teacher();
                $scope.teacher.id = model.me.userId;
            }
            await $scope.audiences.sync($scope.structure.id);
            await $scope.subjects.sync($scope.structure.id);
            console.log($scope.subjects.all)
            await $scope.syncSessionsWithVisa();
        }


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
            $scope.visas_pdfChoice.map(visa =>{
                visa.displayDate = moment(visa.created).format("DD/MM/YYYY");
            })
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
            $scope.visaCreateBox = false;
            $scope.showOptionToaster = false;

        };

        $scope.printPdf = () => {
            let sessionsToPdf = getSelectedSessions();
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


        $scope.submitVisaForm = async () => {
            if (!$scope.visaFormIsvalid) {
                return;
            }

            $scope.visaForm.loading = true;
            $scope.safeApply();

            let sessionsGroups = getSelectedSessions();
            console.log(sessionsGroups);
            updateNbSessions(sessionsGroups);

            let visas = new Visas($scope.structure);
            if($scope.visaFormIsvalid){
                console.log(sessionsGroups);
                sessionsGroups.forEach((visaSession)=>{
                    if (visaSession) {
                        let visa = new Visa($scope.structure);
                        visa.mapFormData(visaSession,$scope.visaForm.comment)
                        visas.all.push(visa);
                    }
                })
                let {succeed} = await visas.save();
                if (succeed) {
                    $scope.syncSessionsWithVisa();
                    $scope.closeVisaCreateBox();
                    $scope.safeApply();
                }
            }


        };

        $scope.visaFormIsvalid = () => {
            return $scope.visaForm.comment &&
                $scope.visaForm.comment.length;
        };

        $scope.init();

    }]);