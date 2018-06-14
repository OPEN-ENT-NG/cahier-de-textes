package fr.openent.diary.model.visa;

import fr.openent.diary.model.util.KeyValueModel;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by A664240 on 26/06/2017.
 */
public class TeacherToInspectorManagement {

    private List<KeyValueModel> availableTeachers = new ArrayList<>();
    private List<KeyValueModel> onInspectorTeachers = new ArrayList<>();

    public List<KeyValueModel> getAvailableTeachers() {
        return availableTeachers;
    }

    public void setAvailableTeachers(List<KeyValueModel> availableTeachers) {
        this.availableTeachers = availableTeachers;
    }

    public List<KeyValueModel> getOnInspectorTeachers() {
        return onInspectorTeachers;
    }

    public void setOnInspectorTeachers(List<KeyValueModel> onInspectorTeachers) {
        this.onInspectorTeachers = onInspectorTeachers;
    }
}
