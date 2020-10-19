package fr.openent.diary.helper;

import fr.openent.diary.models.Audience;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.ArrayList;
import java.util.List;

public class AudienceHelper {

    /**
     * Convert JsonArray into subject list
     *
     * @param audienceArray     JsonArray response
     * @return new list of events
     */
    public static List<Audience> toAudienceList(JsonArray audienceArray) {
        List<Audience> audienceList = new ArrayList<>();
        for (Object o : audienceArray) {
            if (!(o instanceof JsonObject)) continue;
            Audience audience = new Audience((JsonObject) o);
            audienceList.add(audience);
        }
        return audienceList;
    }

    /**
     * Convert List audience into audience JsonArray
     *
     * @param audienceList audience list
     * @return new JsonArray of audiences
     */
    public static JsonArray toJsonArray(List<Audience> audienceList) {
        JsonArray audienceArray = new JsonArray();
        for (Audience audience : audienceList) {
            audienceArray.add(audience.toJSON());
        }
        return audienceArray;
    }
}
