package fr.openent.diary.models;

import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.List;

public class RestrictedGroup {

    private String id;
    private String label;
    private String structureId;
    private String homeworkId;
    private String audienceId;
    private String teacherId;
    private List<String> studentIds;
    private String legacyId;
    private String deletedAt;

    @SuppressWarnings("unchecked")
    public RestrictedGroup(JsonObject body) {
        this.id = body.getString("id", null);
        this.label = body.getString("label", "");
        this.structureId = body.getString("structure_id", null);
        this.homeworkId = body.getString("homework_id", null);
        this.teacherId = body.getString("teacher_id", null);
        this.audienceId = body.getString("audience_id", null);
        this.studentIds = body.getJsonArray("student_ids", new JsonArray()).getList();
        this.legacyId = body.getString("legacy_id", null);
        this.deletedAt = body.getString("deleted_at", null);
    }

    public JsonObject toJSON() {
        return new JsonObject()
                .put("id", this.id)
                .put("label", this.label)
                .put("structure_id", this.structureId)
                .put("homework_id", this.homeworkId)
                .put("teacher_id", this.teacherId)
                .put("audience_id", this.audienceId)
                .put("student_ids", this.studentIds)
                .put("legacy_id", this.legacyId)
                .put("deleted_at", this.deletedAt);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getStructureId() {
        return structureId;
    }

    public void setStructureId(String structureId) {
        this.structureId = structureId;
    }

    public String getHomeworkId() {
        return homeworkId;
    }

    public void setHomeworkId(String homeworkId) {
        this.homeworkId = homeworkId;
    }

    public String getAudienceId() {
        return audienceId;
    }

    public void setAudienceId(String audienceId) {
        this.audienceId = audienceId;
    }

    public String getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(String teacherId) {
        this.teacherId = teacherId;
    }

    public List<String> getStudentIds() {
        return studentIds;
    }

    public void setStudentIds(List<String> studentIds) {
        this.studentIds = studentIds;
    }

    public String getLegacyId() {
        return legacyId;
    }

    public void setLegacyId(String legacyId) {
        this.legacyId = legacyId;
    }

    public String getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(String deletedAt) {
        this.deletedAt = deletedAt;
    }
}
