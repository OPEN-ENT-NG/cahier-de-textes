import { Mix } from 'entcore-toolkit';
import http, {AxiosResponse} from 'axios';

export interface IAudience {
    id?: string;
    externalId?: string;
    name?: string;
    labels?: Array<string>;
}

export class Audience {
    name: string;
    groupName?: string;
    id: string;
    type: string;
    type_group: number;

    constructor(name: string, id?, type?) {
        this.name = name;
        if (id)
            this.id = id;
        else if (type) {
            this.type = type;
            this.type_group = type;
        }
    }

    toString(): string {
        return this.name;
    }
}

export class Audiences {
    all: Audience[];

    constructor() {
        this.all = [];
    }

    /**
     * Synchronize groups belongs to the parameter structure
     * @param structureId structure id
     * @param canFetchAllClasses boolean
     * @returns {Promise<void>}
     */
    async sync(structureId: string, canFetchAllClasses: boolean): Promise<void> {
        try {
            let structureParam: string = `?idEtablissement=${structureId}`;
            let optionalEdtParams: string = `&isEdt=true${canFetchAllClasses ? '&isTeacherEdt=true' : ''}`;
            let audiences: AxiosResponse = await http.get(`/viescolaire/classes${structureParam}${optionalEdtParams}`);
            this.all = Mix.castArrayAs(Audience, audiences.data);
            this.all.sort((g: Audience, gg: Audience) => {
                if (g.type_group < gg.type_group)
                    return -1;
                else if (g.type_group > gg.type_group)
                    return 1;
                else if (g.type_group === gg.type_group)
                    if (g.name < gg.name)
                        return -1;
                    else {
                        return 1;
                    }
            });
        } catch (e) {
            throw e;
        }
    }

    getIds(): String[] {
        return this.all.map(audience => audience.id);
    }
}

