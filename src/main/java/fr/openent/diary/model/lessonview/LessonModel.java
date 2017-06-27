package fr.openent.diary.model.lessonview;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Created by A664240 on 13/06/2017.
 */
public class LessonModel {

    private String lessonId;
    private String teacherName;
    private String subject;
    private String audienceLabel;
    private Date date;


    private String startTime;
    private String endTime;
    private String title;
    private String description;
    private List<HomeworkModel> homeworks = new ArrayList<>();

    public String getLessonId() {
        return lessonId;
    }

    public void setLessonId(String lessonId) {
        this.lessonId = lessonId;
    }

    public String getTeacherName() {
        return teacherName;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<HomeworkModel> getHomeworks() {
        return homeworks;
    }

    public void setHomeworks(List<HomeworkModel> homeworks) {
        this.homeworks = homeworks;
    }

    public String getAudienceLabel() {
        return audienceLabel;
    }

    public void setAudienceLabel(String audienceLabel) {
        this.audienceLabel = audienceLabel;
    }

}
