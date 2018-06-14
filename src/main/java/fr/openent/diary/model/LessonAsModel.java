package fr.openent.diary.model;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;


public class LessonAsModel {
    private List<String> classes = new ArrayList<>();
    private String subjectId;


    private Date date;
    private String startHour;
    private String endHour;

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

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public String getStartHour() {
        return startHour;
    }

    public void setStartHour(String startHour) {
        this.startHour = startHour;
    }

    public String getEndHour() {
        return endHour;
    }

    public void setEndHour(String endHour) {
        this.endHour = endHour;
    }

    public List<String> getRoomLabels() {
        return roomLabels;
    }

    public void setRoomLabels(List<String> roomLabels) {
        this.roomLabels = roomLabels;
    }
}
