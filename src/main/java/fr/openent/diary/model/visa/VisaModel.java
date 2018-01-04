package fr.openent.diary.model.visa;

import java.util.Date;

/**
 * Created by A664240 on 08/06/2017.
 */
public class VisaModel {
    private Long id;

    private String comment;
    private Date dateCreate = new Date();
    private String structureId;
    private String teacherId;
    private String teacherName;
    private String subjectId;
    private String subjectName;
    private String audienceId;
    private String audienceName;
    private String ownerId;
    private String ownerName;
    private String ownerType;
    private Date lastModifiedLesson;
    private Long nbDirty;

    public Long getNbDirty() {
        return nbDirty;
    }

    public void setNbDirty(Long nbDirty) {
        this.nbDirty = nbDirty;
    }

    public Date getLastModifiedLesson() {
        return lastModifiedLesson;
    }

    public void setLastModifiedLesson(Date lastModifiedLesson) {
        this.lastModifiedLesson = lastModifiedLesson;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Date getDateCreate() {
        return dateCreate;
    }

    public void setDateCreate(Date dateCreate) {
        this.dateCreate = dateCreate;
    }

    public String getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(String teacherId) {
        this.teacherId = teacherId;
    }

    public String getTeacherName() {
        return teacherName;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }

    public String getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(String subjectId) {
        this.subjectId = subjectId;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public String getAudienceId() {
        return audienceId;
    }

    public void setAudienceId(String audienceId) {
        this.audienceId = audienceId;
    }

    public String getAudienceName() {
        return audienceName;
    }

    public void setAudienceName(String audienceName) {
        this.audienceName = audienceName;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getOwnerType() {
        return ownerType;
    }

    public void setOwnerType(String ownerType) {
        this.ownerType = ownerType;
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

}
