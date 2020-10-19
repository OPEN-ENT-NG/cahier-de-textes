package fr.openent.diary.models;

import io.vertx.core.json.JsonObject;

public class DiaryTypeModel implements Cloneable {
    private Long id;
    private String structure_id;
    private String label;
    private Long rank;
    private String type;

    public DiaryTypeModel(Long typeId) {
        super();
        this.id = typeId;
    }
    public DiaryTypeModel(JsonObject diaryType) {
        super();
        this.id = diaryType.getLong("id", null);
        this.structure_id = diaryType.getString("structure_id", null);
        this.label = diaryType.getString("label", null);
        this.rank = diaryType.getLong("rank", null);
        this.type = diaryType.getString("type", null);
    }

    public JsonObject toJSON() {
        return new JsonObject()
                .put("id", this.id)
                .put("structure_id", this.structure_id)
                .put("label", this.label)
                .put("rank", this.rank)
                .put("type", this.type);
    }

    @Override
    public DiaryTypeModel clone() {
        try {
            return (DiaryTypeModel) super.clone();
        } catch (CloneNotSupportedException e) {
            return this;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStructureId() {
        return structure_id;
    }

    public void setStructureId(String structure_id) {
        this.structure_id = structure_id;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public Long getRank() {
        return rank;
    }

    public void setRank(Long rank) {
        this.rank = rank;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

}
