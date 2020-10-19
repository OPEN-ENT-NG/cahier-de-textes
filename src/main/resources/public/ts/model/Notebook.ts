import {ISubject} from "./subject";
import {User} from "./User";
import {IAudience} from "./audience";
import {ISessionType} from "./session";
import {IHomeworkType} from "./homework";
import {Visa} from "./visa";

export interface INotebookResponse {
    page?: number;
    page_count?: number;
    limit?: number;
    offset?: number;
    all?: Array<INotebook>;
}

export interface INotebookRequest {
    structure_id?: string;
    start_at?: string;
    end_at?: string;
    teacher_id?: string;
    teacher_ids?: Array<string>;
    audience_ids?: Array<string>;
    audience_id?: string;
    subject_id?: string;
    published?: Boolean;
    visa?: Boolean;
    orderVisa?: Boolean;
    page?: number;
}

export interface INotebook {
    notebook_id: string;
    id: number;
    subject: ISubject;
    teacher: User;
    audience: IAudience;
    sessions: number;
    description: string;
    title?: string;
    date: string;
    start_time?: string;
    end_time?: string;
    modified: string;
    is_published: string;
    session_id?: number;
    diaryType?: ISessionType | IHomeworkType;
    visa?: string;
    visas?: Visa;
    type?: string;
    notebookSessionsContents: Array<INotebook>;
    isClicked?: boolean;
    isSelected?: boolean;

    // visas type
    homeworks: Array<any>;
}

export class Notebook {
    structure_id: string;
    notebookResponse: INotebookResponse;

    constructor(structure_id: string) {
        this.structure_id = structure_id;
        this.notebookResponse = {} as INotebookResponse;
    }

    async build(data: INotebookResponse): Promise<void> {
        this.notebookResponse.all = [];
        data.all.forEach((notebook: INotebook) => {
            notebook.notebookSessionsContents = [];
            this.notebookResponse.all.push(notebook);
        });
        this.notebookResponse.page = data.page;
        this.notebookResponse.page_count = data.page_count;
    }
}