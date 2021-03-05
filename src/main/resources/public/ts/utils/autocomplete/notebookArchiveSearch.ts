import {INotebookArchiveService} from '../../services';

/**
 * ⚠ This class is used for the directive async-autocomplete
 * Used only for notebook archive searching.
 */
export class NotebookArchiveSearch {

    protected readonly structureId: string;
    protected notebookArchiveService: INotebookArchiveService;

    private teachers: Array<string>;
    private audiences: Array<string>;
    private selectedTeachers: Array<string>;
    private selectedAudiences: Array<string>;

    public teacher: string;
    public audience: string;


    constructor(structureId: string, notebookArchiveService: INotebookArchiveService) {
        this.structureId = structureId;
        this.notebookArchiveService = notebookArchiveService;
    }

    public getTeachers(): Array<string> {
        return this.teachers;
    }

    public getSelectedTeachers(): Array<string> {
        return this.selectedTeachers ? this.selectedTeachers : [];
    }

    public setSelectedTeachers(selectedTeachers: Array<string>): void {
        this.selectedTeachers = selectedTeachers;
    }

    public removeSelectedTeachers(teacherItem: string): void {
        this.selectedTeachers.splice(this.selectedTeachers.indexOf(teacherItem), 1);
    }

    public resetTeachers(): void {
        this.teachers = [];
    }

    public resetSelectedTeachers(): void {
        this.selectedTeachers = [];
    }

    public selectTeachers(valueInput: string, teacherItem: string): void {
        if (!this.selectedTeachers) this.selectedTeachers = [];
        if (this.selectedTeachers.indexOf(teacherItem) === -1) {
            this.selectedTeachers.push(teacherItem);
        }
    };

    public selectTeacher(valueInput: string, teacherItem: string): void {
        this.selectedTeachers = [];
        this.selectedTeachers.push(teacherItem);
    }

    public async searchTeachers(valueInput: string): Promise<void> {
        try {
            this.teachers = await this.notebookArchiveService.searchTeacher(this.structureId, valueInput);
        } catch (err) {
            this.teachers = [];
            throw err;
        }
    };

    public getAudiences(): Array<string> {
        return this.audiences;
    }

    public getSelectedAudiences(): Array<string> {
        return this.selectedAudiences ? this.selectedAudiences : [];
    }

    public setSelectedAudiences(selectedAudiences: Array<string>): void {
        this.selectedAudiences = selectedAudiences;
    }

    public removeSelectedAudiences(audienceItem: string): void {
        this.selectedAudiences.splice(this.selectedAudiences.indexOf(audienceItem), 1);
    }

    public resetAudiences(): void {
        this.audiences = [];
    }

    public resetSelectedAudiences(): void {
        this.selectedAudiences = [];
    }

    public selectAudiences(valueInput: string, audienceItem: string): void {
        if (!this.selectedAudiences) this.selectedAudiences = [];
        if (this.selectedAudiences.indexOf(audienceItem) === -1) {
            this.selectedAudiences.push(audienceItem);
        }
    };

    public selectAudience(valueInput: string, audienceItem: string): void {
        this.selectedAudiences = [];
        this.selectedAudiences.push(audienceItem);
    }

    public async searchAudiences(valueInput: string): Promise<void> {
        try {
            this.audiences = await this.notebookArchiveService.searchAudience(this.structureId, valueInput);
        } catch (err) {
            this.audiences = [];
            throw err;
        }
    };
}