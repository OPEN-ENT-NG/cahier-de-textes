package fr.openent.diary.models;

import io.vertx.core.json.JsonObject;

public class NotebookArchive {

    private Long id;
    private String structureId;
    private String structureLabel;
    private String teacherId;
    private String teacherFirstName;
    private String teacherLastName;
    private String audienceLabel;
    private String subjectLabel;
    private String archiveSchoolYear;
    private String createdAt;
    private String fileId;

    public NotebookArchive(JsonObject archive) {
        this.id = archive.getLong("id", null);
        this.structureId = archive.getString("structure_id", null);
        this.structureLabel = archive.getString("structure_label", "");
        this.teacherId = archive.getString("teacher_id", null);
        this.teacherFirstName = archive.getString("teacher_first_name", "");
        this.teacherLastName = archive.getString("teacher_last_name", "");
        this.audienceLabel = archive.getString("audience_label", "");
        this.subjectLabel = archive.getString("subject_label", "");
        this.archiveSchoolYear = archive.getString("archive_school_year", null);
        this.createdAt = archive.getString("created_at", null);
        this.fileId = archive.getString("file_id", null);
    }

    public NotebookArchive(Notebook notebook) {
        this.teacherId = notebook.getTeacher().getId();
        this.teacherFirstName = notebook.getTeacher().getFirstName();
        this.teacherLastName = notebook.getTeacher().getLastName();
        this.audienceLabel = notebook.getAudience().getName();
        this.subjectLabel = notebook.getSubject().getName();
    }

    public JsonObject toJSON() {
        return new JsonObject()
                .put("id", this.id)
                .put("structure_id", this.structureId)
                .put("structure_label", this.structureLabel)
                .put("teacher_id", this.teacherId)
                .put("teacher_first_name", this.teacherFirstName)
                .put("teacher_last_name", this.teacherLastName)
                .put("audience_label", this.audienceLabel)
                .put("subject_label", this.subjectLabel)
                .put("archive_school_year", this.archiveSchoolYear)
                .put("created_at", this.createdAt)
                .put("file_id", this.fileId);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStructureId() {
        return structureId;
    }

    public void setStructureId(String structureId) {
        this.structureId = structureId;
    }

    public String getStructureLabel() {
        return structureLabel;
    }

    public void setStructureLabel(String structureLabel) {
        this.structureLabel = structureLabel;
    }

    public String getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(String teacherId) {
        this.teacherId = teacherId;
    }

    public String getTeacherFirstName() {
        return teacherFirstName;
    }

    public void setTeacherFirstName(String teacherFirstName) {
        this.teacherFirstName = teacherFirstName;
    }

    public String getTeacherLastName() {
        return teacherLastName;
    }

    public void setTeacherLastName(String teacherLastName) {
        this.teacherLastName = teacherLastName;
    }

    public String getAudienceLabel() {
        return audienceLabel;
    }

    public void setAudienceLabel(String audienceLabel) {
        this.audienceLabel = audienceLabel;
    }

    public String getSubjectLabel() {
        return subjectLabel;
    }

    public void setSubjectLabel(String subjectLabel) {
        this.subjectLabel = subjectLabel;
    }

    public String getArchiveSchoolYear() {
        return archiveSchoolYear;
    }

    public void setArchiveSchoolYear(String archiveSchoolYear) {
        this.archiveSchoolYear = archiveSchoolYear;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getFileId() {
        return fileId;
    }

    public void setFileId(String fileId) {
        this.fileId = fileId;
    }
}
