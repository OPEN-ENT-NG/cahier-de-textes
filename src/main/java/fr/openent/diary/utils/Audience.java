package fr.openent.diary.utils;

import org.vertx.java.core.json.JsonObject;

/**
 * Created by a629001 on 19/04/2016.
 */
public class Audience {

    /**
     * id in UUID format v4
     */
    private String id;

    /**
     * School id in UUID format v4
     */
    private String schoolId;

    /**
     * Audience label
     */
    private String audienceLabel;

    /**
     * Audience type
     */
    private AudienceType audienceType;

    /**
     * Instanciate an audience from lesson JSON object
     *
     * @param lesson
     */
    public Audience(JsonObject lesson) {
        this.id = lesson.getString("audience_id");
        this.schoolId = lesson.getString("school_id");
        this.audienceType = AudienceType.valueOf(lesson.getString("audience_type").toUpperCase());
        this.audienceLabel = lesson.getString("audience_name");
    }

    /**
     *
     * @return Id of audience
     */
    public String getId() {
        return id;
    }

    /**
     *
     * @return School Id of audience
     */
    public String getSchoolId() {
        return schoolId;
    }

    /**
     *
     * @return Audience label
     */
    public String getAudienceLabel() {
        return audienceLabel;
    }

    /**
     *
     * @return Type of audience
     */
    public AudienceType getAudienceType() {
        return audienceType;
    }
}
