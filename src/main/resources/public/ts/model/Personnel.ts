import {Mix, Selectable, Selection} from 'entcore-toolkit';
import http from 'axios';
import {Structure} from './structure';

export class Personnel implements Selectable {
    id: string;
    firstName: string;
    lastName: string;
    selected: boolean;

    toString = (): string => {
        return this.lastName + ' ' + this.firstName;
    }
}

export class Personnels extends Selection<Personnel> {
    constructor () {
        super([]);
    }

    async sync (structure: Structure): Promise<void> {
        let {data} = await http.get(`/viescolaire/user/list?profile=Personnel&structureId=${structure.id}`);
        this.all = Mix.castArrayAs(Personnel, data);
    }
}