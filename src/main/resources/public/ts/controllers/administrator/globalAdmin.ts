import {_, idiom as lang, model, moment, ng} from 'entcore';
import {Sessions} from '../../model/index';
import * as jsPDF from 'jspdf';
import * as html2canvas from 'html2canvas';
import {Utils} from "../../utils/utils";
import {Visa, Visas} from "../../model";

export let globalAdminCtrl = ng.controller('globalAdminCtrl',
    ['$scope', '$routeParams', '$location', function ($scope, $routeParams, $location) {
        (window as any).jsPDF = jsPDF;
        (window as any).html2canvas = html2canvas;

        $scope.allSessionsSelect = false;
        $scope.showOptionToaster = false;
        $scope.openDetails = null;
        $scope.selectedSessions = {};
        $scope.visas_pdfChoice = [];
        $scope.sessions = new Sessions($scope.structure);
        $scope.filters = {
            startDate: moment().subtract(1, "years"),
            endDate: moment()
        }

        /**
         * Init de la vue ***
         */
        $scope.syncSessionsWithVisa = async () => {
            await $scope.sessions.syncSessionsWithVisa($scope.filters.startDate, $scope.filters.endDate, $scope.teacher.id);
            $scope.sessions.all.forEach(s => {
                s.isInsideDiary = true;
                s.homeworks.forEach(h => h.isInsideDiary = true);

            });
            $scope.sessions_GroupBy_AudienceSubject = Sessions.groupByLevelANdSubject($scope.sessions.all);
            _.each($scope.sessions_GroupBy_AudienceSubject, (item, key) => {
                $scope.selectedSessions[key] = false;
            });
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

        $scope.printPdf = () => {
            let sessionsToPdf = getSelectedSessions();
            console.log(sessionsToPdf);
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
                return moment(date).format("DD/MM/YYYY HH:mm");
            else
                return '-';
        };

        $scope.getSessionsIds = (sessionsGroup) => {
            return _.chain(sessionsGroup)
                .pluck("id")
                .value();
        };

        $scope.selectOrUnselectAllSessions = function (targetValue: boolean) {
            _.each($scope.selectedSessions, function (value, key, obj) {
                obj[key] = targetValue;
            });
            $scope.safeApply();
        };
        $scope.unselectAllSessions = function () {
            _.each($scope.selectedSessions, function (value, key, obj) {
                obj[key] = false;
            });
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

        $scope.submitVisaForm = async () => {
            if (!$scope.visaFormIsvalid) {
                return;
            }

            $scope.visaForm.loading = true;
            $scope.safeApply();

            let sessionsGroups = getSelectedSessions();
            let promises_array: Array<any> = [];
            sessionsGroups.forEach((item) => {

                promises_array.push(new Promise(function (resolve, reject) {

                    let dataVisa = {
                        sessions: item,
                        sessionIds: $scope.getSessionsIds(item),
                        teacher: null,
                        visaForm: $scope.visaForm
                    };

                    createCanvas(dataVisa).then(async (canvasData) => {
                        canvasData = createPDF(canvasData)
                        let visas = new Visas($scope.structure);

                        let visa = new Visa($scope.structure);
                        visa.comment = $scope.visaForm.comment;
                        visa.fileId = await
                            Visa.uploadVisaPdf(canvasData, $scope);
                        visa.nb_sessions = dataVisa.sessions.length;
                        visa.sessionIds = dataVisa.sessionIds;
                        visa.teacher = dataVisa.teacher;
                        visas.all.push(visa);
                        let {succeed} = await
                            visas.save();
                        if (succeed) {
                            resolve(true);
                        } else {
                            reject(false);
                        }
                    });

                }));
            });
            Promise.all(promises_array).then(result => {
                let response = {
                    succeed: true,
                    toastMessage: lang.translate("visa.manage.create.success")
                };
                if (_.contains(result, false)) {
                    response.succeed = false;
                    response.toastMessage = lang.translate("visa.manage.create.error")
                }
                $scope.visaForm.loading = false;
                $scope.safeApply();
                $scope.closeVisaCreateBox();
                $scope.safeApply();
                $scope.toastHttpCall(response);
                $scope.selectOrUnselectAllSessions(false);
                $scope.updateOptionToaster();
                $scope.syncSessionsWithVisa();
            });
        };
        $scope.visaFormIsvalid = () => {
            return $scope.visaForm.comment &&
                $scope.visaForm.comment.length;
        };

        /**
         *  utils to create PDF
         **/

        (window as any).jsPDF = jsPDF;
        (window as any).html2canvas = html2canvas;

        async function createCanvas(dataVisa) {
            let sessions = dataVisa.sessions;
            let sessionIds = dataVisa.sessionIds;
            //useFUll var
            let joinSessionsIds = sessionIds.join('-');
            dataVisa.teacher = sessions[0].teacher;
            let teacherLabel = sessions[0].teacher.displayName;
            let subjectLabel = sessions[0].subject.label;
            let audienceLabel = sessions[0].audience.name;
            let username = model.me.username;
            let comment = dataVisa.visaForm.comment;
            let result = {original: null, canvas: null, data: {joinSessionsIds: joinSessionsIds}};

            // Get the divs

            $(`.diary${joinSessionsIds}`).clone().appendTo("#list-diary-to-pdf");

            // Convert the divs into canvas

            let diaryDiv = $(`#list-diary-to-pdf > .diary${joinSessionsIds}`);
            let titleDiary =
                `<div class="text-center">` +
                `<h1>${lang.translate("diary.title")}</h1>` +
                `<h2>${teacherLabel}&nbsp;-&nbsp;${subjectLabel}&nbsp;-&nbsp;${audienceLabel}</h2>` +
                `<h4>${lang.translate("visa.approve.date")}&nbsp;${Utils.getDisplayDate(moment())}&nbsp;${lang.translate("to2")}&nbsp;${Utils.getDisplayTime(moment())}&nbsp;` +
                `${lang.translate("by")}&nbsp;${sessions[0].teacher.firstName }&nbsp;${sessions[0].teacher.lastName }</h4>` +
                `<p><b>${lang.translate("sessions.admin.comment")}:&nbsp;</b> ${comment} </p>` +
                `</div>`;
            diaryDiv.prepend(titleDiary);

            diaryDiv.css('padding', '30px');
            let canvas = await html2canvas(diaryDiv[0], {letterRendering: true});

            result.original = $(`#list-diary-to-pdf > .diary${joinSessionsIds}`)[0];
            result.canvas = $(canvas)[0];
            $(canvas).appendTo($('#canvas-diary-to-pdf'));


            return result;
        }

        function createPDF(canvasData) {
            let joinSessionsIds = canvasData.data.joinSessionsIds;

            // Create the canvas into PDF
            let pdf = new jsPDF('p', 'pt', 'a4', true);

            for (let i = 0; i <= canvasData.original.clientHeight / 980; i++) {
                //! This is all just html2canvas stuff
                let srcImg = canvasData.canvas;
                let sX = 0;
                let sY = 1120 * i; // start 980 pixels down for every new page
                let sWidth = 778;
                let sHeight = 1120;
                let dX = 0;
                let dY = 0;
                let dWidth = 778;
                let dHeight = 1120;

                let onePageCanvasName = "onePageCanvas_diary-canvas" + joinSessionsIds;

                (window as any)[onePageCanvasName] = document.createElement("canvas");
                let onePageCanvas = (window as any)[onePageCanvasName];
                onePageCanvas.setAttribute('width', 778);
                onePageCanvas.setAttribute('height', 1120);
                let ctx = onePageCanvas.getContext('2d');
                // details on this usage of this function:
                // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images#Slicing
                ctx.drawImage(srcImg, sX, sY, sWidth, sHeight, dX, dY, dWidth, dHeight);

                // document.body.appendChild(canvas);
                let canvasDataURL = onePageCanvas.toDataURL("image/png", 1.0);

                let width = onePageCanvas.width;
                let height = onePageCanvas.clientHeight;

                //! If we're on anything other than the first page,
                // add another page
                if (i > 0) {
                    pdf.addPage(595, 842); //8.5" x 11" in pts (in*72)
                }
                //! now we declare that we're working on that page
                pdf.setPage(i + 1);
                //! now we add content to that page!
                pdf.addImage(canvasDataURL, 'PNG', 0, 0, (width * .72), (height * .71), '', 'FAST');
            }
            canvasData.pdfBlob = pdf.output('blob');

            canvasData.original.remove();
            canvasData.canvas.remove();

            return canvasData;
        }

        /**
         *  Fin Generation du pdf pour les visas
         **/
        /**
         *  End Visas actions ************
         **/



    }]);