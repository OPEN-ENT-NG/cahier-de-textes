import {SearchItem, SearchService} from "../../services";
import {User} from "../../model";

export class AutocompleteUtils {
    private static structure;

    static teacher;
    private static teacherOptions;
    private static teachersSelected;

    static class;
    private static classOptions;
    private static classesSelected;

    static init(structure): void {
        this.structure = structure;
        this.teachersSelected = [];
        this.classesSelected = [];
        this.resetSearchFields();
    }

    static resetSearchFields(): void {
        this.teacher = "";
        this.teacherOptions = [];
        this.class = "";
        this.classOptions = [];
    }

    /**
     * ⚠ Method for teacher
     */

    static getTeacherOptions(): Array<any> {
        return this.teacherOptions;
    }

    static getTeachersSelected(): Array<any> {
        return this.teachersSelected;
    }

    static setTeachersSelected(value): void {
        this.teachersSelected = [...value];
    }

    static removeTeacherSelected(value): void {
        this.teachersSelected.splice(this.teachersSelected.indexOf(value), 1);
    }

    static async filterTeacherOptions(value): Promise<void> {
        try {
            this.teacherOptions = await this.searchTeachers(value);
        } catch (err) {
            this.teacherOptions = [];
            throw err;
        }
    };

    static selectTeacher(model, item) {
        this.teachersSelected.push(item);
    };

    static async searchTeachers(value) {
        try {
            const data = await SearchService.searchUser(this.structure.id, value, "Teacher");
            data.forEach((user: User) => user.toString = () => user.displayName.trim());
            return data;
        } catch (err) {
            throw err;
        }
    }

    /**
     * ⚠ Method for classes
     */

    static getClassOptions(): Array<any> {
        return this.classOptions;
    }

    static getClassesSelected(): Array<any> {
        return this.classesSelected;
    }

    static setClassesSelected(value): void {
        this.classesSelected = [...value];
    }

    static removeClassSelected(value): void {
        this.classesSelected.splice(this.classesSelected.indexOf(value), 1);
    }

    static filterClassOptionsFromList(value, allClasses): void {
        let audiencesId = this.classesSelected.map(a => a.id);
        this.classOptions = allClasses
            .filter(audience =>
                audience.name.toLowerCase().includes(value.toLowerCase())
                && !audiencesId.includes(audience.id)
            )
            .map((audience) => {
                audience.toString = () => audience.name.trim();
                return audience;
            });
    }

    static async filterClassOptions(value): Promise<void> {
        try {
            this.classOptions = await this.searchClasses(value);
        } catch (err) {
            this.classOptions = [];
            throw err;
        }
    }

    static selectClass(model, item) {
        this.classesSelected.push(item);
    };

    static async searchClasses(value): Promise<SearchItem[]> {
        try {
            const data = await SearchService.searchGroup(this.structure.id, value);
            data.forEach((item: SearchItem) => {
                item.toString = () => item.name.trim();
                item.displayName = item.name.trim();
            });
            return data;
        } catch (err) {
            throw err;
        }
    }
}