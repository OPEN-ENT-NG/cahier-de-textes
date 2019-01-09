import {_, Behaviours, model, moment, ng, notify} from 'entcore';
import {Sessions, Visa, Visas} from '../../model/';
import * as jsPDF from 'jspdf';
import * as html2canvas from 'html2canvas';
import http from 'axios';
import {Utils} from '../../utils/utils';

export let manageVisasCtrl = ng.controller('manageVisasCtrl',
    ['$scope', '$routeParams', '$location', function ($scope, $routeParams, $location) {
        (window as any).jsPDF = jsPDF;
        (window as any).html2canvas = html2canvas;

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

        $scope.submitVisaForm = async () => {
            if(!$scope.visaFormIsvalid){
                return;
            }

            $scope.visaForm.loading = true;
            $scope.safeApply();

            await createCanvas();
            await createPDF();
            updateNbSessions();
            let visas = new Visas($scope.structure);

            $scope.mixVisaSessions.forEach((visaSession)=>{
                if (visaSession && visaSession.selected) {
                    let visa = new Visa($scope.structure);
                    visaSession.comment = $scope.visaForm.comment;
                    visa.comment = $scope.visaForm.comment;
                    visa.fileId = visaSession.fileId;
                    visa.nb_sessions = visaSession.nb_sessions;
                    visa.sessionIds = visaSession.sessionIds;
                    visa.teacher = visaSession.teacher;
                    visas.all.push(visa);
                }
            });
            let { succeed } = $scope.toastHttpCall(await visas.save());

            if (succeed) {
                $scope.syncSessionsVisas();
            }

            $scope.visaForm.loading = false;
            $scope.safeApply();
        };

        async function createCanvas(){
            // Get the divs
            $scope.mixVisaSessions.forEach(visaSession => {

               $(`.diary${visaSession.sessionIds.join('-')}`).clone().appendTo( "#list-diary-to-pdf");
            });

            // Convert the divs into canvas
            for(let visaSession of $scope.mixVisaSessions){

                let diaryDiv = $(`#list-diary-to-pdf > .diary${visaSession.sessionIds.join('-')}`);
                let titleDiary = `<div class="text-center"><h1>Cahier de textes</h1><h2>${visaSession.teacher.displayName} - ${visaSession.subject.label} - ${visaSession.audience.name}</h2><h4>Visa apposé le ${Utils.getDisplayDateTime(moment())} par ${model.me.username}</h4><p><b>Commentaire:</b> ${$scope.visaForm.comment}</p></div>`;
                diaryDiv.prepend(titleDiary);

                diaryDiv.css('padding','30px');
                let canvas = await html2canvas(diaryDiv[0], {letterRendering:true});

                visaSession.original = $(`#list-diary-to-pdf > .diary${visaSession.sessionIds.join('-')}`)[0];
                visaSession.canvas = $(canvas)[0];
                $(canvas).appendTo($('#canvas-diary-to-pdf'));
            }
        }

        async function createPDF(){
            // Create the canvas into PDF
            $scope.mixVisaSessions.forEach(visaSession => {
                let pdf = new jsPDF('p', 'pt', 'a4', true);

                for (let i = 0; i <= visaSession.original.clientHeight/980; i++) {
                    //! This is all just html2canvas stuff
                    let srcImg  = visaSession.canvas;
                    let sX      = 0;
                    let sY      = 1120*i; // start 980 pixels down for every new page
                    let sWidth  = 778;
                    let sHeight = 1120;
                    let dX      = 0;
                    let dY      = 0;
                    let dWidth  = 778;
                    let dHeight = 1120;

                    (window as any).onePageCanvas = document.createElement("canvas");
                    let onePageCanvas = (window as any).onePageCanvas;
                    onePageCanvas.setAttribute('width', 778);
                    onePageCanvas.setAttribute('height', 1120);
                    let ctx = onePageCanvas.getContext('2d');
                    // details on this usage of this function:
                    // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images#Slicing
                    ctx.drawImage(srcImg,sX,sY,sWidth,sHeight,dX,dY,dWidth,dHeight);

                    // document.body.appendChild(canvas);
                    let canvasDataURL = onePageCanvas.toDataURL("image/png", 1.0);

                    let width         = onePageCanvas.width;
                    let height        = onePageCanvas.clientHeight;

                    //! If we're on anything other than the first page,
                    // add another page
                    if (i > 0) {
                        pdf.addPage(595, 842); //8.5" x 11" in pts (in*72)
                    }
                    //! now we declare that we're working on that page
                    pdf.setPage(i+1);
                    //! now we add content to that page!
                    pdf.addImage(canvasDataURL, 'PNG', 0, 0, (width*.72), (height*.71), '', 'FAST');
                }

                visaSession.pdfBlob = pdf.output('blob');
            });

            $('#list-diary-to-pdf').empty();
            $('#canvas-diary-to-pdf').empty();

            // Uploading files and receiving their id
            for(let visaSession of $scope.mixVisaSessions){
                const formData = new FormData();
                formData.append('file', visaSession.pdfBlob);

                const response = await http.post('/diary/visa/pdf', formData, {
                    onUploadProgress: (e: ProgressEvent) => {
                        if (e.lengthComputable) {
                            let percentage = Math.round((e.loaded * 100) / e.total);
                            $scope.safeApply();
                        }
                    }
                });

                visaSession.fileId = response.data._id;
            }

            $scope.safeApply();
        }

        $scope.syncSessionsVisas = async () => {
            await $scope.sessions.syncSessionsWithVisa($scope.filters.startDate, $scope.filters.endDate, $scope.teacher.id);
            $scope.sessions.all.forEach(s => {
                s.isInsideDiary = true;
                s.homeworks.forEach(h => h.isInsideDiary = true);
            });
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
        };

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
        };

        $scope.showVisaForm = () => {
            return mixVisaSessions_hasASelectedItem();
        };

        $scope.visaFormIsvalid = () => {
            return $scope.showVisaForm() &&
                $scope.visaForm.comment &&
                $scope.visaForm.comment.length;

        };
        $scope.back = () =>{
            window.history.back();
        }

        $scope.safeApply();
    }]);