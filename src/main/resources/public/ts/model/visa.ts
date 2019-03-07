import {idiom as lang, moment} from 'entcore';
import http from 'axios';
import {Structure, Teacher, Utils} from './index';

export class Visa {

    id: number;
    comment: string = null;
    sessionIds: object = [];
    sessions: any = [];
    structure: Structure;
    teacher: Teacher;
    nb_sessions: number = 0;

    fileId: string;
    moment: any;
    created: string;
    modified: string;

    displayDate: string;

    constructor (structure: Structure) {
        this.structure = structure;
    }

    init(structure?: Structure) {
        if(structure){
            this.structure = structure;
        }
        this.displayDate = Utils.getDisplayDateTime(this.created);
        this.moment = moment(this.created);
    }

    toSendFormat() {
        return {
            comment: this.comment,
            sessionIds: this.sessionIds,
            structure_id: this.structure.id,
            teacher_id: this.teacher.id,
            fileId: this.fileId,
            nb_sessions: this.nb_sessions,
            created: this.created,
            modified: this.modified
        };
    }

    async downloadPdf(): Promise<void> {
        let response = await http({
            url: `/diary/visa/${this.id}/pdf`,
            method: "GET",
            responseType: "blob"
        });
        Utils.startBlobDownload(response.data, lang.translate("visa.manage.choosePdf") + " " + this.displayDate + ".pdf");
    }

    static async uploadVisaPdf(canvasData, $scope) {
        // Uploading files and receiving their id
        const formData = new FormData();
        formData.append('file', canvasData.pdfBlob);

        const response = await
            http.post('/diary/visa/pdf', formData, {
                onUploadProgress: (e: ProgressEvent) => {
                    if (e.lengthComputable) {
                        let percentage = Math.round((e.loaded * 100) / e.total);
                        $scope.safeApply();
                    }
                }
            });
        $scope.safeApply();
        return response.data._id;
    };
}


export class Visas {
    all: Visa[];
    structure: Structure;

    constructor (structure: Structure) {
        this.structure = structure;
        this.all = [];
    }

    toSendFormat () {
        return {
            structure_id: this.structure.id,
            visas: this.all.map((n) => n.toSendFormat())
        };
    }

    async save() {
        return await this.create();
    }

    async create() {
        let response = await http.post('/diary/visas', this.toSendFormat());
        return Utils.setToastMessage(response, 'visas.created','visas.created.error');
    }
}
