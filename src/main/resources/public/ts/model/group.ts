import http from "axios";

interface IGroup {
    id_classe: string;
    name_classe: string;
    id_groups: string[];
    name_groups: string[]
}

export class Group implements IGroup {
    id_classe: string;
    name_classe: string;
    id_groups: string[];
    name_groups: string[];

    /**
     * Structure constructor. Can take an id and a name in parameter
     * @param id_classe
     * @param name_classe
     * @param id_groups
     * @param name_groups
     */
    constructor(id_classe?: string, name_classe?: string, id_groups?: string[], name_groups?: string[]) {
        this.id_classe = id_classe && id_classe.trim() != '' ? id_classe : null;
        this.name_classe = name_classe && name_classe.trim() != '' ? name_classe : null;
        this.id_groups = id_groups ? id_groups : [];
        this.name_groups = name_groups ? name_groups : [];
    }
}

export class Groups {
    all: Group[];

    constructor(arr?: Group[]) {
        this.all = arr ? arr : [];
    }

    async sync(audience_ids: String[]): Promise<void> {
        let classes: String = '';
        audience_ids.forEach(id => {
            classes += `${classes.length === 0 ? '?' : '&'}classes=${id}`
        });
        let {data} = await http.get(`/viescolaire/group/from/class${classes}`);
        this.all = data;
    }

    /**
     * Returns first structure occurrence in the class
     * @returns {Group} first group contained in 'all' array
     */
    first(): Group {
        return this.all[0];
    }
}