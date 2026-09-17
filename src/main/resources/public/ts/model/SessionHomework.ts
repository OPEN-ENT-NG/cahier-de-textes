import { HttpResponse } from 'entcore-toolkit';
import {Homework} from "./homework";

export interface ISessionHomeworkBody {
    homeworks: Array<Homework>;
}

export interface ISessionHomeworkService {
    create(sessionHomework: ISessionHomeworkBody): Promise<HttpResponse>;

    update(sessionHomework: ISessionHomeworkBody): Promise<HttpResponse>;
}