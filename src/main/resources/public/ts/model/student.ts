import { model } from 'entcore';
import http from 'axios';
import { Mix } from 'entcore-toolkit';

export class Student {
    id: string;
    firstName: string;
    lastName: string;
    displayName: string;
    class: any;
    structures: string[];
}

export class Students {
    all: Student[] = [];

    async sync (): Promise<void> {
        let children = await http.get('/diary/student/children');
        this.all = Mix.castArrayAs(Student, children.data);
        return;
    }
}