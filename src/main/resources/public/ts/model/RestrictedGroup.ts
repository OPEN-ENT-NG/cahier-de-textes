
export interface IRestrictedGroup {
    id: number;
    structure_id: string;
    session_id: number;
    audience_id: string;
    teacher_id: string;
    subject_id: string;
    student_ids: string[];
    label: string;
    is_valid: boolean;
}

export class RestrictedGroup {
    id: number;
    audience_id: string;
    session_id: number;
    slug: string;
    structure_id: string;
    student_ids: string[] = [];
    subject_id: string;
    teacher_id: string;
    is_valid = true;
    label = '';

    constructor() {
    }
}
