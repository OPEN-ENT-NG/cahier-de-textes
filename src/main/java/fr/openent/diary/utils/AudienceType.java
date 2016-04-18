package fr.openent.diary.utils;

/**
 * Created by a629001 on 13/04/2016.
 * Type of audience (schema: diary table: audience column: audience_type)
 */
public enum AudienceType {
    /**
     * Class type
     */
    CLASS("class"),
    /**
     * Group type
     */
    GROUP("group");

    private final String stateLabel;

    /**
     * @param label
     */
    AudienceType(String label) {
        this.stateLabel = label;
    }

    @Override
    public String toString() {
        return this.stateLabel;
    }
}
