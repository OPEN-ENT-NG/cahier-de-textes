import {Me} from "entcore";

export class PreferencesUtils {

    public static readonly PREFERENCE_KEYS = {
        CDT_STRUCTURE: 'cdt.structure',
        // cdt module's preferences
        CDT_REGISTER: 'cdt.register',
        CDT_EVENT_LIST_FILTER: 'cdt.eventList.filters',
    };

    /**
     * Updated default structure selected
     *
     * @param structure selected.
     */
    static async updateStructure(structure): Promise<void> {
        if (!Me.preferences[this.PREFERENCE_KEYS.CDT_STRUCTURE]) {
            await Me.savePreference(this.PREFERENCE_KEYS.CDT_STRUCTURE);
            await Me.preference(this.PREFERENCE_KEYS.CDT_STRUCTURE)
        }
        Me.preferences[this.PREFERENCE_KEYS.CDT_STRUCTURE] = structure;
        await Me.savePreference(this.PREFERENCE_KEYS.CDT_STRUCTURE);
    }
}