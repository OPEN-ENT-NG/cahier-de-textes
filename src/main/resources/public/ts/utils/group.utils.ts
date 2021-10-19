import {Group} from "../model/group";
import {Structure, Structures} from "../model";

export class GroupUtils {

    static addGroupsToStructures = (groups: Group[], structures: Structures): void => {
        groups.forEach((group: Group) => {
            let structure: Structure = structures.get(group.id_structure);
            if (structure) structure.addGroup(group);
        });
    }

}