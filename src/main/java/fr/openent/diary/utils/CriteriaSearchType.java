package fr.openent.diary.utils;

import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by a457593 on 15/06/2016.
 */
public enum CriteriaSearchType {

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
