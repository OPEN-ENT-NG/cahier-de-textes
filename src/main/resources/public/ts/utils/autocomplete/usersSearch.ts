
import {AutoCompleteUtils} from "./auto-complete";
import {User} from "../../model";
import {SearchService} from "../../services";

/**
 * ⚠ This class is used for the directive async-autocomplete
 * use it only for "important" user such as teacher...personal...
 */

export class UsersSearch extends AutoCompleteUtils {

    private users: Array<User>;
    private selectedUsers: Array<{}>;

    public user: string;

    constructor(structureId: string, searchService: SearchService) {
        super(structureId, searchService);
    }

    public getUsers() {
        return this.users;
    }

    public getSelectedUsers() {
        return this.selectedUsers ? this.selectedUsers : [];
    }

    public removeSelectedUsers(studentItem) {
        this.selectedUsers.splice(this.selectedUsers.indexOf(studentItem), 1);
    }

    public resetUsers() {
        this.users = [];
    }

    public resetSelectedUsers() {
        this.selectedUsers = [];
    }

    public selectUsers(valueInput, studentItem) {
        if (!this.selectedUsers) this.selectedUsers = [];
        if (this.selectedUsers.find(student => student["id"] === studentItem.id) === undefined) {
            this.selectedUsers.push(studentItem);
        }
    };

    public selectStudent(valueInput, studentItem) {
        this.selectedUsers = [];
        this.selectedUsers.push(studentItem);
    }

    public async searchUsers(valueInput: string) {
        try {
            await Promise.all([
                this.searchService.searchUser(this.structureId, valueInput, 'Personnel'),
                this.searchService.searchUser(this.structureId, valueInput, 'Teacher')
            ]).then(response => {
                this.users = [].concat(...response);
            })
        } catch (err) {
            this.users = [];
            throw err;
        }
    };

    public async searchTeacher(valueInput: string) {
        try {
            this.searchService.searchUser(this.structureId, valueInput, 'Teacher').then((response: User[]) => {
                this.users = [].concat(...response);
            })
        } catch (err) {
            this.users = [];
            throw err;
        }
    };
}