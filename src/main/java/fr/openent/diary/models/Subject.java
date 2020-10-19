package fr.openent.diary.models;

import io.vertx.core.json.JsonObject;

public class Subject implements Cloneable {

    private String id;
    private String externalId;
    private String name;
    private Integer rank;

    public Subject(String id) {
        this.id = id;
        this.externalId = null;
        this.name = null;
        this.rank = null;
    }

    public Subject(JsonObject subject) {
        this.id = subject.getString("id");
        this.externalId = subject.getString("externalId");
        this.name = subject.getString("name");
        this.rank = subject.getInteger("rank");
    }

    public JsonObject toJSON() {
        return new JsonObject()
                .put("id", this.id)
                .put("externalId", this.externalId)
                .put("name", this.name)
                .put("rank", this.rank);
    }

    @Override
    public Subject clone() {
        try {
            return (Subject) super.clone();
        } catch (CloneNotSupportedException e) {
            return this;
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getExternalId() {
        return externalId;
    }

    public void setExternalId(String externalId) {
        this.externalId = externalId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getRank() {
        return rank;
    }

    public void setRank(Integer rank) {
        this.rank = rank;
    }
}

