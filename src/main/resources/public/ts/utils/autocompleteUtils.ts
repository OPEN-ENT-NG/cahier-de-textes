import http from "axios";

export class AutocompleteUtils {
    private static structure;

    static teacher;
    private static teacherOptions;
    private static teachersSelected;

    static class;
    private static classOptions;
    private static classesSelected;

    static init(structure) {
        this.structure = structure;
        this.teachersSelected = [];
        this.classesSelected = [];
        this.resetSearchFields();
    }

    static getTeacherOptions() {
        return this.teacherOptions;
    }

    static getClassOptions() {
        return this.classOptions;
    }

    static getTeachersSelected() {
        return this.teachersSelected;
    }

    static getClassesSelected() {
        return this.classesSelected;
    }

    static setTeachersSelected(value) {
        this.teachersSelected = [...value];
    }

    static setClassesSelected(value) {
        this.classesSelected = [...value];
    }

    static removeTeacherSelected(value) {
        this.teachersSelected.splice(this.teachersSelected.indexOf(value), 1);
    }

    static removeClassSelected(value) {
        this.classesSelected.splice(this.classesSelected.indexOf(value), 1);
    }


    static resetSearchFields() {
        this.teacher = null;
        this.teacherOptions = [];
        this.class = null;
        this.classOptions = [];
    }


    static async filterTeacherOptions(value) {
        try {
            this.teacherOptions = await this.searchTeachers(value);
        } catch (err) {
            this.teacherOptions = [];
            throw err;
        }
    };

    static async filterClassOptions(value) {
        try {
            this.classOptions = await this.searchClasses(value);
        } catch (err) {
            this.classOptions = [];
            throw err;
        }
    }

    static selectTeacher(model, item) {
        this.teachersSelected.push(item);
    };

    static selectClass(model, item) {
        this.classesSelected.push(item);
    };

    static async searchClasses(value) {
        try {
            const {data} = await http.get(`/diary/search?structureId=${this.structure.id}&q=${value}`);
            data.forEach((item) => item.toString = () => item.displayName.trim());
            return data;
        } catch (err) {
            throw err;
        }
    }

    static async searchTeachers(value) {
        try {
            const {data} = await http.get(`/diary/search/users?structureId=${this.structure.id}&profile=Teacher&q=${value}&field=firstName&field=lastName`);
            data.forEach((user) => user.toString = () => user.displayName.trim());
            return data;
        } catch (err) {
            throw err;
        }
    }
}