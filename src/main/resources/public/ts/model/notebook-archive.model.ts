export type NotebookArchive = {
    id: number,
    structureId?: string,
    structureLabel?: string,
    teacherId?: string,
    teacherFirstName: string,
    teacherLastName: string,
    audienceLabel: string,
    subjectLabel: string,
    schoolYear: string,
    createdAt: string,
    fileId?: string
    isSelected?: boolean
};

export type NotebookArchiveResponse = {
    page?: number,
    page_count?: number,
    all: Array<{
        id: number,
        structure_id: string,
        structure_label: string,
        subject_label: string,
        teacher_id: string,
        teacher_first_name: string,
        teacher_last_name: string,
        audience_label: string,
        created_at: string,
        archive_school_year: string,
        end_at: string,
        file_id: string
    }>
};

export type NotebookArchiveSearchResponse = {
    data: {
        audienceNames?: Array<string>;
        teacherNames?: Array<string>;
    }
};


export type NotebookArchiveParams = {
    schoolYear: string,
    teacherName?: Array<string>,
    audienceLabel?: Array<string>,
    page?: number
};
