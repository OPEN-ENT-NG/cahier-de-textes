import {AutoCompleteUtils} from "./auto-complete";
import {Student, User} from "../../model";
import {SearchService} from "../../services";
import {display} from "html2canvas/dist/types/css/property-descriptors/display";

/**
 * ⚠ This class is used for the directive async-autocomplete
 * use it only for students's info purpose
 */

export class StudentsSearch extends AutoCompleteUtils {

    private students: Array<Student>;
    private selectedStudents: Array<{}>;
    private searchStudents: Array<Student>;

    public student: string;

    constructor(structureId: string, searchService?: SearchService, searchStudents?: Student[]) {
        super(structureId, (searchService || null));
        this.searchStudents = searchStudents || [];
    }

    public getStudents() {
        return this.students;
    }

    public getSelectedStudents() {
        return this.selectedStudents ? this.selectedStudents : [];
    }

    setSearchStudents(searchStudents: Student[]) {
        this.searchStudents = searchStudents;
    }

    public setSelectedStudents(selectedStudents: Array<{}>) {
        this.selectedStudents = selectedStudents;
    }

    public removeSelectedStudents(studentItem) {
        this.selectedStudents.splice(this.selectedStudents.indexOf(studentItem), 1);
    }

    public resetStudents() {
        this.students = [];
    }

    public resetSelectedStudents() {
        this.selectedStudents = [];
    }

    public resetQuery() {
        this.student = null;
    }

    public selectStudents(valueInput, studentItem) {
        if (!this.selectedStudents) this.selectedStudents = [];
        if (this.selectedStudents.find(student => student["id"] === studentItem.id) === undefined) {
            this.selectedStudents.push(studentItem);
        }
    };

    public selectStudent(valueInput, studentItem) {
        this.selectedStudents = [];
        this.selectedStudents.push(studentItem);
    }

    public searchStudentsFromArray(query: string, selectedIds?: string[]): void {
        let setStringComparable = (value: string): string => {
            return value.trim().toLowerCase()
        }

        let queries: string [] = query
            .split(" ")
            .map((q: string) => setStringComparable(q));

        let containQuery = (testingValue: string): boolean => {
            let testingValues: string[] = testingValue.split(" ");
            return !!testingValues
                .find((value: string) =>
                    !!queries.find((q: string) => q.includes(setStringComparable(value)) || setStringComparable(value).includes(q))
                );
        }

        this.students = this.searchStudents ?
            this.searchStudents
                .filter((student: Student) => (!selectedIds || (selectedIds && selectedIds.indexOf(student.id) === -1)) &&
                    ((containQuery(student.firstName) || containQuery(student.lastName))
                        || (!student.firstName && !student.lastName && containQuery(student.displayName)))
                )
                .map((student: Student) => {
                    student.toString = () => student.displayName ? student.displayName : `${student.firstName} ${student.lastName}`;
                    return student;
                }) :
            [];
    }
}