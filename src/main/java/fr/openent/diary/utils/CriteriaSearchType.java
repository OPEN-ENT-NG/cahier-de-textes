package fr.openent.diary.utils;

import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by a457593 on 15/06/2016.
 */
public enum CriteriaSearchType {

    HOMEWORK_LINKED_TO_LESSON("homeworkLinkedToLesson"),
    START_DATE_TIME("startDateTime"),
    END_DATE_TIME("endDateTime"),
    /**
     * Filter to start date of lesson only (not homework date filter like start_date)
     */
    END_DATE_LESSON("endDateLesson"),
    EXCLUDE_LESSON_ID("excludeLessonId"),
    /**
     * Limit max number of results retrieved
     */
    LIMIT("limit"),
    START_DATE("startDate"),
    END_DATE("endDate"),
    AUDIENCE("audienceId"),
    SUBJECT("subject"),
    PUBLISH_STATE("publishState"),
    SEARCH_TYPE("returnType"), // 'homework' or 'lesson' or 'both'
    TEACHER("teacher"); // teacher id

    private String name;

    private static final Map<String,CriteriaSearchType> lookup = new HashMap<String,CriteriaSearchType>();

    static {
        for(CriteriaSearchType type : values()) //or EnumSet.allOf(CriteriaSearchType.class)
            lookup.put(type.getName(), type);
    }

    private CriteriaSearchType(String name) {
        this.name = name;
    }

    public static CriteriaSearchType valueOfName(String name) {
        return lookup.get(name);
    }

    public String getName() {
        return name;
    }
}
