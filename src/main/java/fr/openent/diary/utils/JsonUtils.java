package fr.openent.diary.utils;

import org.vertx.java.core.json.JsonArray;

/**
 * Created by a457593 on 03/03/2016.
 */
public final class JsonUtils {

    private JsonUtils()  {}

    /**
     * Removes an item at given index in the array.
     * @param array
     * @param pos
     * @return a JsonArray without the item at given position.
     */
    public static JsonArray removeItemAt(final JsonArray array, final int pos) {

        JsonArray result = new JsonArray();
        for (int i = 0; i < array.size(); i++) {
            if (i != pos)
                result.add(array.get(i));
        }
        return result;
    }
}
