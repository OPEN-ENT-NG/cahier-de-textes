
export interface IRestrictedGroup {
    id: number;
    label: string;
    structure_id: string;
    homework_id: number;
    audience_id: string;
    teacher_id: string;
    student_ids: string[];
    legacy_id: string;
    deleted_at: string;
}

export class RestrictedGroup {
    id: number;
    label: string = '';
    audience_id: string;
    homework_id: number;
    legacy_id: string;
    structure_id: string;
    student_ids: string[] = [];
    subject_id: string;
    teacher_id: string;
    deleted_at: string;
}
