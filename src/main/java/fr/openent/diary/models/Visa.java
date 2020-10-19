package fr.openent.diary.models;

import io.vertx.core.json.JsonObject;

public class Visa {

    private Integer id;
    private String comment;
    private String created;
    private String modified;
    private String owner_id;
    private String owner_type;
    private String teacher_id;
    private int nb_sessions;
    private String pdf_details;
    private String structure_id;

    public Visa(JsonObject visa) {
        this.id = visa.getInteger("id", null);
        this.comment = visa.getString("comment", null);
        this.created = visa.getString("created", null);
        this.modified = visa.getString("modified", null);
        this.owner_id = visa.getString("owner_id", null);
        this.owner_type = visa.getString("owner_type", null);
        this.teacher_id = visa.getString("teacher_id", null);
        this.nb_sessions = visa.getInteger("nb_sessions", 0);
        this.pdf_details = visa.getString("pdf_details", null);
        this.structure_id = visa.getString("structure_id", null);
    }

    public Visa() {
        this.id = null;
        this.comment = null;
        this.created = null;
        this.modified = null;
        this.owner_id = null;
        this.owner_type = null;
        this.teacher_id = null;
        this.nb_sessions = 0;
        this.pdf_details = null;
        this.structure_id = null;
    }

    public JsonObject toJSON() {
        return new JsonObject()
                .put("id", this.id)
                .put("comment", this.comment)
                .put("created", this.created)
                .put("modified", this.modified)
                .put("owner_id", this.owner_id)
                .put("owner_type", this.owner_type)
                .put("teacher_id", this.teacher_id)
                .put("nb_sessions", this.nb_sessions)
                .put("pdf_details", this.pdf_details)
                .put("structure_id", this.structure_id);
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getCreated() {
        return created;
    }

    public void setCreated(String created) {
        this.created = created;
    }

    public String getModified() {
        return modified;
    }

    public void setModified(String modified) {
        this.modified = modified;
    }

    public String getOwnerId() {
        return owner_id;
    }

    public void setOwnerId(String owner_id) {
        this.owner_id = owner_id;
    }

    public String getOwnerType() {
        return owner_type;
    }

    public void setOwnerType(String owner_type) {
        this.owner_type = owner_type;
    }

    public String getTeacherId() {
        return teacher_id;
    }

    public void setTeacherId(String teacher_id) {
        this.teacher_id = teacher_id;
    }

    public int getNbSessions() {
        return nb_sessions;
    }

    public void setNbSessions(int nb_sessions) {
        this.nb_sessions = nb_sessions;
    }

    public String getPdfDetails() {
        return pdf_details;
    }

    public void setPdfDetails(String pdf_details) {
        this.pdf_details = pdf_details;
    }

    public String getStructureId() {
        return structure_id;
    }

    public void setStructureId(String structure_id) {
        this.structure_id = structure_id;
    }
}

