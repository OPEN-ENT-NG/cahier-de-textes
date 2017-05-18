package fr.openent.diary.utils;

import org.vertx.java.core.json.impl.Json;

/**
 * Created by a629001 on 13/04/2016.
 * Basic utility classs for string objects
 * TODO move to entcore?
 *
 * @since 0.1
 */
public class StringUtils {


    /**
     * UUID version 4 pattern
     *
     * @since 0.1
     */
    private static final String UUID_REGEX = "[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";

    /**
     * Checks that the uuid fits with uuid version 4 pattern
     *
     * @param uuid Uuid to be verified
     * @return <code>true</code> if uuid is valid else <code>false</code>
     * @since 0.1
     */
    public static boolean isValidIdentifier(String uuid) {
        return uuid != null && uuid.matches(UUID_REGEX);
    }

    public static String encodeJson(Object obj){
        if (obj == null){
            return "";
        }else{
            return Json.encode(obj);
        }
    }
}
