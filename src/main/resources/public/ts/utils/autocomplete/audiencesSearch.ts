import {AutoCompleteUtils} from "./auto-complete";
import {groupService, SearchItem, SearchService} from "../../services";
import {Audience} from "../../model";
import {Group} from '../../model/group';


/**
 * ⚠ This class is used for the directive async-autocomplete
 * use it for group only (groups/classes)
 */

export class AudiencesSearch extends AutoCompleteUtils {

    private searchItems: SearchItem[];
    private selectedAudiences: Audience[];

    public searchQuery: string;

    constructor(structureId: string, searchService: SearchService) {
        super(structureId, searchService);
    }

    public getAudiences(): SearchItem[] {
        return this.searchItems;
    }

    public getSelectedAudiences(): SearchItem[] {
        return this.selectedAudiences ? this.selectedAudiences : [];
    }

    public setSelectedAudiences(selectedAudiences: Audience[]): void {
        this.selectedAudiences = selectedAudiences;
    }

    public async removeSelectedAudience(audience: Audience): Promise<void> {
        let groups: Array<Group> = await groupService.initGroupsFromClassIds([audience.id]);

        if (groups.length > 0) {
            this.resetSelectedAudiences();
        } else {
            this.selectedAudiences.splice(this.selectedAudiences.indexOf(audience), 1);
        }
    }

    public resetSearch(): void {
        this.searchQuery = '';
        this.resetSearchItems();
    }

    public resetSearchItems(): void {
        this.searchItems = [];
    }

    public resetSelectedAudiences(): void {
        this.selectedAudiences = [];
    }

    public selectAudiences(valueInput: string, audienceItem: Audience): void {
        if (!this.selectedAudiences) this.selectedAudiences = [];
        if (!this.selectedAudiences.find((audience: Audience) => audience.id === audienceItem.id))
            this.selectedAudiences.push(audienceItem);
    };

    public selectGroup(valueInput: string, audienceItem: Audience): void {
        this.selectedAudiences = [];
        this.selectedAudiences.push(audienceItem);
    }

    public async searchAudiences(valueInput: string): Promise<void> {
        try {
            this.searchItems = await this.searchService.searchGroup(this.structureId, valueInput);
            this.searchItems.forEach((group: SearchItem) => group.toString = () => group.name);
        } catch (err) {
            this.searchItems = [];
            throw err;
        }
    };
}