package fr.openent.diary.model.visa;

import fr.openent.diary.model.util.KeyValueModel;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by A664240 on 08/06/2017.
 */
public class VisaFilters {

    private String structureId;


    private List<KeyValueModel> teachers = new ArrayList<>();
    private List<KeyValueModel> subjects = new ArrayList<>();
    private List<KeyValueModel> audiences = new ArrayList<>();
    private List<KeyValueModel> states = new ArrayList<>();

    public String getStructureId() {
        return structureId;
    }

    public void setStructureId(String structureId) {
        this.structureId = structureId;
    }



    public List<KeyValueModel> getTeachers() {
        return teachers;
    }

    public void setTeachers(List<KeyValueModel> teachers) {
        this.teachers = teachers;
    }

    public List<KeyValueModel> getSubjects() {
        return subjects;
    }

    public void setSubjects(List<KeyValueModel> subjects) {
        this.subjects = subjects;
    }

    public List<KeyValueModel> getAudiences() {
        return audiences;
    }

    public void setAudiences(List<KeyValueModel> audiences) {
        this.audiences = audiences;
    }

    public List<KeyValueModel> getStates() {
        return states;
    }

    public void setStates(List<KeyValueModel> states) {
        this.states = states;
    }
}
