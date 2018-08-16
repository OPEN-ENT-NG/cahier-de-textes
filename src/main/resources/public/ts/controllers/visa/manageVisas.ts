import {_, Behaviours, model, moment, ng, notify} from 'entcore';
import {Sessions, Visa, Visas} from '../../model/';

export let manageVisasCtrl = ng.controller('manageVisasCtrl',
    ['$scope', '$routeParams', '$location', function ($scope, $routeParams, $location) {
        console.log('manageVisasCtrl');
        $scope.sessions = new Sessions($scope.structure);
        $scope.openDetails = null;
        $scope.visas_pdfChoice = [];
        $scope.filters = {
            startDate: moment().subtract(1, "years"),
            endDate: moment()
        }

        $scope.visaForm = {
            comment: null
        };

        $scope.syncSessionsVisas = async () => {
            await $scope.sessions.syncSessionsWithVisa($scope.filters.startDate, $scope.filters.endDate, $scope.teacher.id);
            $scope.mixVisaSessions = Sessions.visaListingShuffle($scope.sessions.all);
            $scope.checkbox_selectAll = false;
            $scope.safeApply();

        };

        $scope.selectAll = function(array){
            if(!array || !array.length){
                return;
            }
            else {
                let select = $scope.checkbox_selectAll;
                array.forEach((item) => { item.selected = select; });
                $scope.safeApply();
            }
        };

        $scope.wantDownloadPdf = (visas) => {
            $scope.visas_pdfChoice = _.uniq(visas, function (visa) {
                return visa.id;
            });
            $scope.visaPdfBox = true;
        };

        $scope.closeVisaPdfBox = () => {
            $scope.visas_pdfChoice = [];
            $scope.visaPdfBox = null;
        }

        let updateNbSessions = () => {
            $scope.visaForm.nbSessions =
                _.chain($scope.mixVisaSessions)
                .filter(item => item.selected == true)
                .pluck('nbSessions')
                .reduce((count, num) => count + num)
                .value();
        };

        let mixVisaSessions_hasASelectedItem = () => {
            return _.chain($scope.mixVisaSessions)
                .map(item => item.selected)
                .contains(true)
                .value();
        }

        $scope.showVisaForm = () => {
            return mixVisaSessions_hasASelectedItem();
        }

        $scope.visaFormIsvalid = () => {
            return $scope.showVisaForm() &&
                $scope.visaForm.comment &&
                $scope.visaForm.comment.length;

        }

        $scope.submitVisaForm = async () => {
            updateNbSessions();
            let visas = new Visas($scope.structure);
            if($scope.visaFormIsvalid){
                $scope.mixVisaSessions.forEach((visaSession)=>{
                    if (visaSession && visaSession.selected) {
                        let visa = new Visa($scope.structure);
                        visaSession.comment = $scope.visaForm.comment;
                        visa.mapFormData(visaSession);
                        visas.all.push(visa);
                    }
                })
                let {succeed} = await visas.save();
                if (succeed) {
                    notify.success('visa.created');
                    $scope.syncSessionsVisas();
                }
            }

        }

        $scope.safeApply();
    }]);