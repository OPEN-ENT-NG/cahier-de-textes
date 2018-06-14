package fr.openent.diary.model.general;

/**
 * Created by a457593 on 29/03/2016.
 */
public enum ResourceState {

    DRAFT("draft"), PUBLISHED("published");

    private final String stateLabel;

    ResourceState(String label) {
        this.stateLabel = label;
    }

    @Override
    public String toString() {
        return this.stateLabel;
    }
}