import {AxiosResponse} from "axios";
import {Homework} from "./homework";

export interface ISessionHomeworkBody {
    homeworks: Array<Homework>;
}

export interface ISessionHomeworkService {
    create(sessionHomework: ISessionHomeworkBody): Promise<AxiosResponse>;

    update(sessionHomework: ISessionHomeworkBody): Promise<AxiosResponse>;
}