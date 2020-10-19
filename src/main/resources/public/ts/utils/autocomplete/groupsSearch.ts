import {AutoCompleteUtils} from "./auto-complete";
import {SearchItem, SearchService} from "../../services";


/**
 * ⚠ This class is used for the directive async-autocomplete
 * use it for group only (groups/classes)
 */

export class GroupsSearch extends AutoCompleteUtils {

    private groups: Array<SearchItem>;
    private selectedGroups: Array<{}>;

    public group: string;

    constructor(structureId: string, searchService: SearchService) {
        super(structureId, searchService);
    }

    public getGroups() {
        return this.groups;
    }

    public getSelectedGroups() {
        return this.selectedGroups ? this.selectedGroups : [];
    }

    public setSelectedGroups(selectedGroups: Array<{}>) {
        this.selectedGroups = selectedGroups;
    }

    public removeSelectedGroups(groupItem) {
        this.selectedGroups.splice(this.selectedGroups.indexOf(groupItem), 1);
    }

    public resetGroups() {
        this.groups = [];
    }

    public resetSelectedGroups() {
        this.selectedGroups = [];
    }

    public selectGroups(valueInput, groupItem) {
        if (!this.selectedGroups) this.selectedGroups = [];
        if (this.selectedGroups.find(group => group["id"] === groupItem.id) === undefined) {
            this.selectedGroups.push(groupItem);
        }
    };

    public selectGroup(valueInput, groupItem) {
        this.selectedGroups = [];
        this.selectedGroups.push(groupItem);
    }

    public async searchGroups(valueInput: string) {
        try {
            this.groups = await this.searchService.searchGroup(this.structureId, valueInput);
            this.groups.map((group: SearchItem) => group.toString = () => group.name);
        } catch (err) {
            this.groups = [];
            throw err;
        }
    };
}