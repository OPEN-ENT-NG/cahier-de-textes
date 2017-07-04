package fr.openent.diary.model;

import java.util.Date;


public class ModelWeek {

    private Long id;
    private String weekAlias;
    private String teacherId;
    private Boolean pair;


    private Date beginDate;
    private Date endDate;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getWeekAlias() {
        return weekAlias;
    }

    public void setWeekAlias(String weekAlias) {
        this.weekAlias = weekAlias;
    }

    public String getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(String teacherId) {
        this.teacherId = teacherId;
    }

    public Boolean getPair() {
        return pair;
    }

    public void setPair(Boolean pair) {
        this.pair = pair;
    }

    public Date getBeginDate() {
        return beginDate;
    }

    public void setBeginDate(Date beginDate) {
        this.beginDate = beginDate;
    }

    public Date getEndDate() {
        return endDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }
}
