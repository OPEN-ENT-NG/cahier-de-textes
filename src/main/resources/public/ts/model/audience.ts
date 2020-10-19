import { Mix } from 'entcore-toolkit';
import http from 'axios';

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
     * @returns {Promise<void>}
     */
    async sync(structureId: string) {
        try {
            let audiences = await http.get('/viescolaire/classes?idEtablissement=' + structureId + '&isEdt=true');
            this.all = Mix.castArrayAs(Audience, audiences.data);
            this.all.sort((g, gg) => {
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

