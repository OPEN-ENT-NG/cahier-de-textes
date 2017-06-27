package fr.openent.diary.model.history;

import fr.openent.diary.model.util.KeyValueModel;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by A664240 on 21/06/2017.
 */
public class HistoryModel {

    private String yearLabel;

    private List<KeyValueModel> teachers = new ArrayList<>();
    private List<KeyValueModel> audiences = new ArrayList<>();

    public String getYearLabel() {
        return yearLabel;
    }

    public void setYearLabel(String yearLabel) {
        this.yearLabel = yearLabel;
    }

    public List<KeyValueModel> getTeachers() {
        return teachers;
    }

    public void setTeachers(List<KeyValueModel> teachers) {
        this.teachers = teachers;
    }

    public List<KeyValueModel> getAudiences() {
        return audiences;
    }

    public void setAudiences(List<KeyValueModel> audiences) {
        this.audiences = audiences;
    }
}
