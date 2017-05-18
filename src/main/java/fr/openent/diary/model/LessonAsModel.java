package fr.openent.diary.model;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;


public class LessonAsModel {
    private List<String> classes = new ArrayList<>();
    private String subjectId;
    private Date startDate;
    private Date endDate;

    public String getSubjectLabel() {
        return subjectLabel;
    }

    public void setSubjectLabel(String subjectLabel) {
        this.subjectLabel = subjectLabel;
    }

    private List<String> roomLabels = new ArrayList<>();
    private String subjectLabel;

    public List<String> getClasses() {
        return classes;
    }

    public void setClasses(List<String> classes) {
        this.classes = classes;
    }

    public String getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(String subjectId) {
        this.subjectId = subjectId;
    }

    public Date getStartDate() {
        return startDate;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public Date getEndDate() {
        return endDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }

    public List<String> getRoomLabels() {
        return roomLabels;
    }

    public void setRoomLabels(List<String> roomLabels) {
        this.roomLabels = roomLabels;
    }
}
