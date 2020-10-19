package fr.openent.diary.helper;

import fr.openent.diary.models.Subject;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.ArrayList;
import java.util.List;

public class SubjectHelper {

    private SubjectHelper() {
    }

    /**
     * Convert JsonArray into subject list
     *
     * @param subjectArray     JsonArray response
     * @return new list of events
     */
    public static List<Subject> toSubjectList(JsonArray subjectArray) {
        List<Subject> subjectList = new ArrayList<>();
        for (Object o : subjectArray) {
            if (!(o instanceof JsonObject)) continue;
            Subject reason = new Subject((JsonObject) o);
            subjectList.add(reason);
        }
        return subjectList;
    }

    /**
     * Convert List subject into subject JsonArray
     *
     * @param subjectList subject list
     * @return new JsonArray of subjects
     */
    public static JsonArray toJsonArray(List<Subject> subjectList) {
        JsonArray subjectArray = new JsonArray();
        for (Subject subject : subjectList) {
            subjectArray.add(subject.toJSON());
        }
        return subjectArray;
    }
}
