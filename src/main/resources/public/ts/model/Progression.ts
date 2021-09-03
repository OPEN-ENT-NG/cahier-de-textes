///<reference path="session.ts"/>
import http from 'axios';
import {Eventer, Mix, Selectable, Selection} from 'entcore-toolkit';
import {Homework, Homeworks, Session, ToastUtils} from './index';
import {PEDAGOGIC_TYPES} from '../core/const/pedagogicTypes';
import {HomeworkType} from './homework';
import {model} from "entcore";
import {ScheduleItem} from "./scheduleItem";


export class ProgressionSession implements Selectable {
    selected: boolean = false;
    tableSelected: boolean = false;
    id: number;
    subjectLabel: string;
    title: string;
    description: string = "";
    plainTextDescription: string = "";
    annotation: string = "";
    pedagogicType: number = PEDAGOGIC_TYPES.TYPE_SESSION;
    owner;
    class: string;
    owner_id;
    homeworks;
    eventer: Eventer;
    folder_id: number;
    folder?: ProgressionFolder;

    progression_homeworks: ProgressionHomework[] = [];

    constructor(session?: Session, homeworks?: Homework[]) {
        this.subjectLabel = "";
        this.eventer = new Eventer();
        this.title = "";
        this.class = "";
        this.folder_id = null;

        if (session) {
            if (session.exceptional_label) this.subjectLabel = session.exceptional_label;
            else if (session.subject) this.subjectLabel = session.subject.label;

            if (session.title) this.title = session.title;
            if (session.description) this.description = session.description;
            if (session.annotation) this.annotation = session.annotation;
        }

        if (homeworks)
            this.progression_homeworks = homeworks.map((homework: Homework) => {
                return new ProgressionHomework(homework);
            });
    }

    async save() {
        if (this.id) {
            return this.update();
        }
        return this.create();
    }

    async create() {
        let response = await http.post('/diary/progression/create', this.toJson());
        return ToastUtils.setToastMessage(response, 'progression.session.create', 'progression.session.create.error');

    }

    async update() {
        let response = await http.put(`/diary/progression/update/${this.id}`, this.toJson());
        return ToastUtils.setToastMessage(response, 'progression.session.updated', 'progression.session.update.error');

    }


    async get() {
        if (!this.title) {
            try {
                let {data} = await http.get('/diary/progression/' + this.id);
                Mix.extend(this, data[0]);
                this.progression_homeworks = [];

                let json = JSON.parse(this.homeworks.toString());
                json.forEach(i => this.progression_homeworks.push(Mix.castAs(ProgressionHomework, ProgressionHomework.formatSqlDataToModel(i))));
                this.progression_homeworks.forEach(i => i.initType());
                this.eventer.trigger(`get:end`);
            } catch (e) {
                //     notify.error('session.sync.err');
            }
        }

    }

    private homeworksToJson(owner_id?) {
        let json = [];
        this.progression_homeworks.map(p => {
            let jsonLine = p.toJson(this.owner ? this.owner.id : owner_id);
            if (jsonLine) {
                json.push(jsonLine);
            }
        });
        return json;
    }

    public toJson() {
        let ownerId: string = this.owner ? this.owner.id : (this.owner_id ? this.owner_id : model.me.userId)
        return {
            description: this.description,
            subjectLabel: this.subjectLabel,
            title: this.title,
            class: this.class,
            annotation: this.annotation,
            owner_id: ownerId,
            progression_homeworks: this.homeworksToJson(ownerId),
            progression_folder_id: this.folder_id
        };
    }

    isValidForm = () => {
        let validSessionOrDueDate = false;
        return this
            && this.title
            && this.description
            && this.description.length;
    };

    setOwnerId(owner_id: any) {
        this.owner_id = owner_id;
    }

    static formatSqlDataToModel(data: any) {
        return {
            id: data.id,
            title: data.title,
            class: data.class,
            description: data.description,
            owner_id: data.owner_id,
            subjectLabel: data.subject_label,
            type_id: data.type_id,
            progression_homeworks: data.homeworks && data.homeworks[0] !== null ? ProgressionHomeworks.formatSqlDataToModel(data.homeworks) : [],
            modified: data.modified,
            created: data.created
        };
    }
}

export class ProgressionFolder implements Selectable {
    selected: boolean = false;
    id: number = null;
    parent_id = null;
    title: string = "";
    progressionSessions: ProgressionSession[] = [];
    deepStep: number = 0;
    ownerId: null;

    childFolders: ProgressionFolder[] = [];

    static formatSqlDataToModel(data: any, owner_id) {
        return {
            id: data.id,
            parent_id: data.parent_id,
            title: data.title,
            progressionSessions: data.progressions && data.progressions !== "[null]" ? ProgressionSessions.formatSqlDataToModel(data.progressions, owner_id) : [],
            modified: data.modified,
            created: data.created,
            ownerId: owner_id
        };
    }

    toSendFormat() {
        return {
            owner_id: this.ownerId,
            title: this.title,
            parent_id: this.parent_id
        };
    }

    async save() {
        if (this.id) {
            return await this.update();
        }
        return await this.create();
    }

    async update() {
        let response = await http.put('diary/progression/folder/update/' + this.id, this.toSendFormat());
        return ToastUtils.setToastMessage(response, 'progression.folder.updated', 'progression.folder.updated.error');
    }

    async create() {
        let response = await http.post('diary/progression/folder/create', this.toSendFormat());
        return ToastUtils.setToastMessage(response, 'progression.folder.created', 'progression.folder.created.error');
    }
}


export class ProgressionFolders extends Selection<ProgressionFolder> {
    owner_id;

    constructor(owner_id) {
        super([]);
        this.owner_id = owner_id;
    }

    async sync() {
        let {data} = await http.get('/diary/progressions/' + this.owner_id);
        this.all = Mix.castArrayAs(ProgressionFolder, ProgressionFolders.formatSqlDataToModel(data, this.owner_id));
        let nullFoldersLength = this.all.findIndex((x) => x.id === null && x.parent_id === null);
        if (nullFoldersLength === -1) {
            this.all.push(new ProgressionFolder());
        }
    }

    static organizeTree(folders: ProgressionFolder[], currentFolders: ProgressionFolder[] = null, currentDeepStep: number = 0) {
        if (!currentFolders) {
            currentFolders = folders.filter((x: ProgressionFolder) => x.id === null && x.parent_id === null);
            ProgressionFolders.organizeTree(folders, currentFolders);
            return currentFolders;
        } else {
            currentFolders.map((x) => {
                x.deepStep = currentDeepStep;
                x.childFolders = folders.filter((y: ProgressionFolder) => (y.parent_id === x.id) && !(y.id === null && y.parent_id === null));
                if (x.childFolders.length != 0) {
                    ProgressionFolders.organizeTree(folders, x.childFolders, currentDeepStep + 1);
                }
            });
        }
    }

    static isParentFolder(folder: ProgressionFolder, folderEnd: ProgressionFolder) {
        if (folder.id === folderEnd.id) return true;
        let childFolders = folder.childFolders;
        if (childFolders.length > 0) {
            let res = false;
            for (let i = 0; i < childFolders.length; i++) {
                res = ProgressionFolders.isParentFolder(childFolders[i], folderEnd);
                if (res) break;
            }
            return res;
        }
        return false
    }

    static idsToRemove(folder: ProgressionFolder, deepRemove: boolean = false, folderIds: number[] = [], sessionIds: number[] = []) {
        if (deepRemove) {
            folder.progressionSessions.forEach((s) => {
                sessionIds.push(s.id);
            });
            folderIds.push(folder.id);
            folder.childFolders.forEach((f) => this.idsToRemove(f, deepRemove, folderIds, sessionIds))
        } else {
            folderIds.push(folder.id);
        }
    }

    private static formatSqlDataToModel(data: any, owner_id) {
        let dataModel = [];
        data.forEach(i => dataModel.push(ProgressionFolder.formatSqlDataToModel(i, owner_id)));
        return dataModel;
    }

    static async delete(folderIds: number[], owner_id) {
        let params = {
            data: {
                owner_id: owner_id,
                folder_ids: folderIds
            }
        };

        try {
            let response = await http.delete(`/diary/progression/folders`, params);
            return ToastUtils.setToastMessage(response, 'progression.session.delete', 'progression.session.delete.error');
        } catch (e) {
            console.error(e);
        }
    }

}

export class ProgressionSessions extends Selection<ProgressionSession> {
    constructor() {
        super([]);
    }

    static formatSqlDataToModel(data: any, owner_id) {
        let dataModel = [];
        let json = JSON.parse(data.toString());
        json.forEach(i => dataModel.push(Mix.castAs(ProgressionSession, ProgressionSession.formatSqlDataToModel(i))));
        dataModel.forEach((model: ProgressionSession) => {
            model.setOwnerId(owner_id)
        });
        return dataModel;
    }

    static async delete(sessionIds: number[], owner_id) {
        let params = {
            data: {
                owner_id: owner_id,
                session_ids: sessionIds
            }
        };

        try {
            let response = await http.delete(`/diary/progressions`, params);
            return ToastUtils.setToastMessage(response, 'progression.session.delete', 'progression.session.delete.error');
        } catch (e) {
            console.error(e);
        }
    }
}

export class ProgressionHomework {
    id: string;
    description: string = '';
    plainTextDescription: string = '';
    p_session_id: number;
    type: HomeworkType;
    type_id;
    type_label;
    alreadyValidate: boolean = false;
    p_session: ProgressionSession;
    estimatedTime: number = 0;
    isNewField: boolean = false;
    opened: boolean;
    owner;

    pedagogicType: number = PEDAGOGIC_TYPES.TYPE_HOMEWORK;
    attachedToSession: boolean = true;

    constructor(homework?: Homework) {
        if (homework) {
            if (homework.description) this.description = homework.description;
            if (homework.type) this.type = homework.type;
            if (homework.estimatedTime) this.estimatedTime = homework.estimatedTime;
        }
    }

    initType() {
        if (this.type_label && this.type_id) {
            this.type = new HomeworkType();
            this.type.id = this.type_id;
            this.type.label = this.type_label;
        }
    }

    toJson(ownerId) {
        if (this.description.length)
            return {
                id: this.id || null,
                description: this.description,
                type_id: this.type ? this.type.id : this.type_id,
                estimatedTime: this.estimatedTime ? this.estimatedTime : 0,
                owner_id: ownerId,

            };
    }

    isValidForm = () => {
        let validSessionOrDueDate = false;
        return this
            && this.estimatedTime >= 0
            && this.type
            && this.description
            && this.description.length;
    };

    static formatSqlDataToModel(data) {
        return {
            id: data.id,
            type_id: data.type_id,
            type_label: data.type_label,
            description: data.description,
            estimatedTime: data.estimatedtime,
            modified: data.modified,
            created: data.created
        };
    }

    async delete() {
        try {
            let response = await http.delete(`/diary/progression/homework/${this.id}`);
            return ToastUtils.setToastMessage(response, 'homework.deleted', 'homework.deleted.error');

        } catch (e) {
            console.error(e);
        }
    }
}

export class ProgressionHomeworks {
    all: ProgressionHomework[];

    static formatSqlDataToModel(data: any) {
        let dataModel = [];
        data.forEach(i => dataModel.push(Mix.castAs(ProgressionHomework, ProgressionHomework.formatSqlDataToModel(i))));
        dataModel.forEach(i => i.initType());
        return dataModel;
    }
}