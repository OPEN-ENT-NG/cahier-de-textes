import http from 'axios';
import {Structure, Teacher, Utils} from './index';
import {model, moment,idiom as lang} from 'entcore';

export class Visa {

    id: number;
    comment: string = null;
    sessionIds: any =  [];
    sessions: any = [];
    structure: Structure;
    teacher: Teacher;
    nb_sessions: number = 0;

    created: string;
    modified: string;

    constructor(structure: Structure) {
        this.structure = structure;
    }

    init(structure?: Structure) {
        if (structure) {
            this.structure = structure;
        }
    }


    toSendFormat() {
        this.created = moment().format("YYYY/MM/DD")



        return {
            comment: this.comment,
            sessionIds: this.sessionIds,
            user : model.me.username,
            audience: this.sessions[0].audience.name,// n.audience.name,
            subject:  this.sessions[0].subject.label,
            teacher: this.sessions[0].teacher.toString(),
            sessions: this.sessions.map((n) => {
                return {
                    audience: n.audience.name,// n.audience.name,
                    subject:  n.subject.label,
                    teacher: n.teacher.toString(),
                    title: n.title,
                    type: n.type.label,
                    startDisplayDate: n.startDisplayDate,
                    startDisplayTime: n.startDisplayTime,
                    endDisplayTime: n.endDisplayTime,
                    hasDescription: ($.parseHTML( n.description ) && $.parseHTML( n.description ).length !== 0)?  true : false,
                    description: Utils.htmlToXhtml(n.description),
                    annotation: n.annotation,

                    homeworks: n.homeworks.map(h =>{
                        return{
                            estimatedTime: (h.estimatedTime && h.estimatedTime !== 0 ) ? h.estimatedTime : lang.translate( "homework.no.workload"),
                            hasEstimatedTime : (h.estimatedTime && h.estimatedTime !== 0 ) ? true : false,
                            due_date: Utils.getFormattedDate(h.dueDate),
                            description: Utils.htmlToXhtml(h.description),
                            type: h.type.label,
                            color: h.color,
                            is_published: h.isPublished,
                            workload: h.workload
                        }
                    }),
                    hasHomeworks: n.homeworks.length > 0
                }
            }),
            structure_id: this.structure.id,
            teacher_id: this.teacher.id,
            nb_sessions: this.nb_sessions,
            created: moment(this.created).format("DD/MM/YYYY à hh:mm"),
            modified: this.modified
        };
    }

    mapFormData(FormData , comment) {
        this.comment = comment;
        this.sessions = FormData;
        this.teacher = FormData[0].teacher
        FormData.forEach(vs => {
            this.sessionIds.push(vs.id);
        })
        this.nb_sessions = FormData.length

    }

    async downloadPdf(): Promise<void> {
        window.location.href = `/diary/visa/${this.id}/pdf`;
    }
}


export class Visas {
    all: Visa[];
    structure: Structure;

    constructor(structure: Structure) {
        this.structure = structure;
        this.all = [];
    }

    toSendFormat() {
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
        return Utils.setToastMessage(response, 'visas.created', 'visas.created.error');
    }

}
