package fr.openent.diary.model.visa;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Created by A664240 on 08/06/2017.
 */
public class ResultVisaList {

    private String teacherId;
    private String teacherName;
    private String subjectId;
    private String subjectName;
    private String audienceId;
    private String audienceName;
    private String structureId;

    public String getStructureId() {
        return structureId;
    }

    public void setStructureId(String structureId) {
        this.structureId = structureId;
    }

    public Date getLastDateUpdate() {
        return lastDateUpdate;
    }

    public void setLastDateUpdate(Date lastDateUpdate) {
        this.lastDateUpdate = lastDateUpdate;
    }

    private Date lastDateUpdate;
    private Long nbTotal;
    private Long nbNotVised;

    private List<VisaModel> visas = new ArrayList<>();

    public List<VisaModel> getVisas() {
        return visas;
    }

    public void setVisas(List<VisaModel> visas) {
        this.visas = visas;
    }


    public Long getNbTotal() {
        return nbTotal;
    }

    public void setNbTotal(Long nbTotal) {
        this.nbTotal = nbTotal;
    }

    public Long getNbNotVised() {
        return nbNotVised;
    }

    public void setNbNotVised(Long nbNotVised) {
        this.nbNotVised = nbNotVised;
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
}
