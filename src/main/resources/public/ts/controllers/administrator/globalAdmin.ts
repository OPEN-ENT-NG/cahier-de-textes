import {_, idiom as lang, model, moment, ng, angular} from 'entcore';
import {Sessions, Subjects, Audiences} from '../../model/index';
import * as jsPDF from 'jspdf';
import * as html2canvas from 'html2canvas';
import {Utils} from "../../utils/utils";
import {Teacher, Visa, Visas} from "../../model";

export let globalAdminCtrl = ng.controller('globalAdminCtrl',
    ['$scope', '$routeParams', '$location', function ($scope, $routeParams, $location) {
        (window as any).jsPDF = jsPDF;
        (window as any).html2canvas = html2canvas;

        $scope.allSessionsSelect = false;
        $scope.showOptionToaster = false;
        $scope.subjects = new Subjects();
        $scope.audiences = new Audiences();
        $scope.displayVisa = false;
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

        $scope.structureSwitchEvent = () =>{
            $scope.teacher = null;
            $scope.sessions_GroupBy_AudienceSubject = [];
            $scope.safeApply();

        }
        /**
         * Init de la vue ***
         */
        $scope.syncSessionsWithVisa = async () => {
            // let teacherId;

                $scope.teacherId = $scope.teacher.id;

            await Promise.all([
                await $scope.subjects.sync($scope.structure.id, $scope.teacherId),
                await $scope.audiences.sync($scope.structure.id)
            ]);

            $scope.sessions.structure = $scope.structure;
            if($scope.subjects.all.length && $scope.subjects.all.length === 1  ){
                $scope.params.subjects.push($scope.subjects.all[0]);
                $scope.course.groups.push($scope.subjects.all[0]);
                await $scope.sessions.syncSessionsWithVisa($scope.filters.startDate, $scope.filters.endDate, $scope.teacherId,$scope.subjects.all[0].id);

            }else{
                await $scope.sessions.syncSessionsWithVisa($scope.filters.startDate, $scope.filters.endDate, $scope.teacherId);

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

        $scope.updateDatas = async (event) => {
            // Checking if event is triggered when selecting an element inside multiCombo
            if (event.target.tagName !== 'BUTTON') {
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

                await $scope.sessions.syncSessionsWithVisa(
                    $scope.filters.startDate,
                    $scope.filters.endDate,
                    $scope.teacherId,
                    // filter empty args in array
                    $scope.params.subjects.map(array => array.id).filter(function () { return true }).toString(),
                    $scope.params.audiences.map(array => array.id).filter(function () { return true }).toString(),
                    $scope.displayVisa.toString()
                );
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

        if (model.me.type == "ENSEIGNANT") {
            $scope.teacher = new Teacher();

            $scope.teacher.id = model.me.userId ;
            $scope.teacher.id = model.me.id ;
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
            renderDiariesToPDF();
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
                        visa: $scope.visaForm
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
                        visa.teacher = dataVisa.sessions[0].teacher;
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
                $scope.selectOrUnselectAllSessions();
                $scope.updateOptionToaster();
                $scope.syncSessionsWithVisa();
            });
        };

        $scope.visaFormIsvalid = () => {
            return $scope.visaForm.comment &&
                $scope.visaForm.comment.length;
        };


        let renderDiariesToPDF = async () => {

            $scope.printPdf.loading = true;
            $scope.safeApply();

            let sessionsGroups = getSelectedSessions();
            let allDataPdf = [];

            sessionsGroups.forEach((item) => {
                let dataPdf = {
                    sessions: item,
                    sessionIds: $scope.getSessionsIds(item),
                    teacher: null
                };
                allDataPdf.push(dataPdf);
            });

            let canvasData = await createCanvas(allDataPdf);
            let canvasPdf = createPDF(canvasData);
            Utils.startBlobDownload(canvasPdf.pdfBlob, lang.translate("visa.manage.pdfName") + " - " + Utils.getDisplayDateTime(moment()));
            $scope.printPdf.loading = false;
            $scope.selectOrUnselectAllSessions();
            $scope.updateOptionToaster();
            $scope.syncSessionsWithVisa();
        };

        /**
         *  utils to create PDF
         **/

        (window as any).jsPDF = jsPDF;
        (window as any).html2canvas = html2canvas;

        async function createCanvas(data) {

            //htmlContent:
            let htmlTitle1 = (titleDiary, sessions) => {
                titleDiary = `<div style="padding:10px" class="text-center">` +
                    `<h1>${lang.translate("diary.title")}</h1>` +
                    `<h2>${sessions[0].teacher.firstName }&nbsp;${sessions[0].teacher.lastName}&nbsp;-&nbsp;${sessions[0].subject.label}&nbsp;-&nbsp;${sessions[0].audience.name}</h2>`;
                return titleDiary;
            };

            let htmlTitle2 = (titleDiary, username, comment) => {
                titleDiary += `<h4>${lang.translate("visa.approve.date")}&nbsp;` +
                    `${lang.translate("by")}&nbsp;${username}</h4>` +
                    `<p><b>${lang.translate("sessions.admin.comment")}:&nbsp;</b> ${comment} </p>`;
                return titleDiary;
            };

            let htmlTitle3 = (titleDiary) => {
                titleDiary += `</div><h4 style="padding:10px" >${lang.translate("the")}&nbsp;${Utils.getDisplayDate(moment())}&nbsp;${lang.translate("to2")}&nbsp;${Utils.getDisplayTime(moment())}&nbsp;</h4>`;
                return titleDiary;
            };

            let createTitle = (sessions, target, visa?) => {
                // Convert the divs into canvas
                let titleDiary = htmlTitle1("", sessions);
                if (visa && visa.comment) {
                    titleDiary = htmlTitle2(titleDiary, model.me.username, visa.comment);
                }
                titleDiary = htmlTitle3(titleDiary);

                return titleDiary;
            };

            let sessions, target, targetName, htmlContent, title;

            if (Array.isArray(data)) {
                target = "#all";
                let finalContent = "";
                data.forEach((item) => {
                    sessions = item.sessions;
                    targetName = item.sessionIds.join('-');
                    $(`#list-diary-to-pdf > .diary${targetName}`).remove();
                    $(`.diary${targetName}`).clone().appendTo("#list-diary-to-pdf");
                    htmlContent = $(`#list-diary-to-pdf > .diary${targetName}`);
                    title = createTitle(sessions, targetName);
                    htmlContent.prepend(title);
                    target = $(`#list-diary-to-pdf > .diary${targetName}`);
                    finalContent += htmlContent.html();
                });
                htmlContent.html(finalContent);
            } else {
                sessions = data.sessions;
                targetName = data.sessionIds.join('-');
                $(`#list-diary-to-pdf > .diary${targetName}`).remove();
                $(`.diary${targetName}`).clone().appendTo("#list-diary-to-pdf");
                htmlContent = $(`#list-diary-to-pdf > .diary${targetName}`);
                title = createTitle(sessions, targetName, data.visa);
                htmlContent.prepend(title);
                target = $(`#list-diary-to-pdf > .diary${targetName}`);
            }

            $(htmlContent).width(778);

            let result = {original: null, canvas: null, data: {targetName: targetName}};
            let canvas = await html2canvas(htmlContent[0], {
                letterRendering: true,
                scale: 1,
                windowWidth: 778,
                width: 778
            });

            result.original = target[0];
            result.canvas = canvas;
            return result;

        }

        function createPDF(canvasData) {
            let targetName = canvasData.data.targetName;
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

                let onePageCanvasName = "onePageCanvas_diary-canvas" + targetName;

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