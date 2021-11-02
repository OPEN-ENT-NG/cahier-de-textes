import {Me, model} from "entcore";
import {Structure, Structures, Student} from "../model";
import {UPDATE_STRUCTURE_EVENTS} from "../core/enum/events";
import {PreferencesUtils} from "./preference/preferences";
import {groupService, structureService, studentService} from "../services";
import {ArrayUtils} from "./array.utils";
import {Group} from "../model/group";
import {GroupUtils} from "./group.utils";

declare let window: any;

export class UserUtils {

    static isStudent = (type: string): boolean => type === "ELEVE";

    static isParent = (type: string): boolean => type === "PERSRELELEVE";

    static isTeacher = (type: string): boolean => type === "ENSEIGNANT";

    static isRelative = (type: string): boolean => type === "PERSRELELEVE";

    static isStudentOrParent = (type: string): boolean => UserUtils.isStudent(type) || UserUtils.isParent(type);

    static amIStudentOrParent = (): boolean => UserUtils.isStudentOrParent(model.me.type);

    static amIStudent = (): boolean => UserUtils.isStudent(model.me.type);

    static amIParent = (): boolean => UserUtils.isParent(model.me.type);

    static amITeacher = (): boolean => UserUtils.isTeacher(model.me.type);

    static amIRelative = (): boolean => UserUtils.isRelative(model.me.type);


    /* ******** ******
     * CHILD/PARENTS *
     *************** */

    static addChildrenToStructures = (students: Student[], structures: Structures): void => {
        students.forEach((student: Student) => {
            let structure: Structure = structures.get(student.structureId);
            if (structure) structure.addStudent(student);
        });
    };

    static changeStudent = ($scope: any, structure: Structure, student: Student): void => {
        if (!structure || student.structureId != structure.id)
            $scope.$emit(UPDATE_STRUCTURE_EVENTS.TO_UPDATE, student.structureId);
    };

    static currentChildStructures = (student: Student, structures: Structures): Structure[] =>
        (student && structures) ? structures.filterByStudents(student.id) : [];

    static async setWindowStructureFromUser() {
        let structures: Structure[] = structureService.getUserStructure();
        let preferenceStructure = await Me.preference(PreferencesUtils.PREFERENCE_KEYS.CDT_STRUCTURE);
        let preferenceStructureId = preferenceStructure ? preferenceStructure['id'] : null;
        window.structure = preferenceStructureId ?
            structures.find((s: Structure) => s.id === preferenceStructureId) : structures[0];
    }

    static async setParentStructures(): Promise<Structures> {
        let structuresList: Structure[] = structureService.getUserStructure();
        let students: Student[];
        let studentIds: string[];

        if (UserUtils.amIParent()) {
            students = await studentService.initStudents();
            studentIds = ArrayUtils.distinct(students.map((student: Student) => student.id));
        } else {
            students = [model.me];
            studentIds = [model.me.userId];
        }

        let requests: any[] = [
            groupService.initGroupsFromStudentIds(studentIds),
            ...structuresList.map((structure: Structure) => structure.sync())
        ];
        let result: any[] = await Promise.all(requests);
        let groups: Group[] = result[0];

        let structures: Structures = new Structures(structuresList);
        GroupUtils.addGroupsToStructures(groups, structures);
        if(UserUtils.amIParent()) UserUtils.addChildrenToStructures(students, structures);
        return structures;
    }

}