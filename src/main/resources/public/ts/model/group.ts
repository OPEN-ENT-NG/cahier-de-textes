import http from "axios";
import {Student} from "./student";
import {ArrayUtils} from "../utils/array.utils";

interface IGroup {
    id_classe: string;
    name_classe: string;
    id_groups: string[];
    name_groups: string[];
    id_structure: string;
}

export class Group implements IGroup {
    id_classe: string;
    name_classe: string;
    id_groups: string[];
    name_groups: string[];
    id_structure: string;

    addGroupIds(groupIds: string[]): void {
        if (groupIds) this.id_groups = [...groupIds, ...this.id_groups];
    }

    addGroupNames(groupNames: string[]): void {
        if (groupNames) this.name_groups = [...groupNames, ...this.id_groups];
    };
}

export class Groups {
    all: Group[];

    constructor(arr?: Group[]) {
        this.all = arr ? arr : [];
    }

    async sync(audience_ids: String[], student_ids?: String[]): Promise<void> {
        let params: String = '';
        audience_ids.forEach(id => params += `${params.length === 0 ? '?' : '&'}classes=${id}`);
        if (student_ids) student_ids.forEach(id => params += `${params.length === 0 ? '?' : '&'}student=${id}`)

        let {data} = await http.get(`/viescolaire/group/from/class${params}`);
        this.all = data;
    }

    set = (groups: Group[]): void => {
        this.all = groups;
    }

    /**
     * Returns first structure occurrence in the class
     * @returns {Group} first group contained in 'all' array
     */
    first(): Group {
        return this.all[0];
    }

    get = (groupClassId: string): Group => this.all.find((s: Group) => s.id_classe == groupClassId);

    getIds = (): string[] =>
        ArrayUtils.flat(this.all.map((group: Group) => {
            let groupIds: string[] = group.id_groups || [];
            if (group.id_classe) groupIds.push(group.id_classe);
            return groupIds;
        }))

    add(group: Group): void {
        this.all.push(group);
    }

    addAll = (groups: Group[]): void => groups.forEach((group: Group) => this.add(group));

    getGroupsFromStudent = (student: Student): Group =>
        this.all.find((group: Group) => !!group.id_groups.find((groupId: string) => groupId === student.groupId));
}