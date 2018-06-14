package fr.openent.diary.utils;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.Map;
import java.util.TimeZone;

/**
 * Created by a629001 on 13/04/2016.
 * Basic utility classs for string objects
 * TODO move to entcore?
 *
 * @since 0.1
 */
public class StringUtils {

    public static ObjectMapper mapper = new ObjectMapper();

    static{
        mapper.configure(JsonParser.Feature.ALLOW_COMMENTS, true);
        mapper.configure(SerializationFeature.INDENT_OUTPUT, true);
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

        DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ");
        dateFormat.setTimeZone(TimeZone.getTimeZone("CET"));
        mapper.setDateFormat(dateFormat);
    }

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
            try {
                return mapper.writeValueAsString(obj);
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        }
    }

    public static String cleanHtml(String html){
        return html.replaceAll("<br>","<br/>");
            //.replaceAll("\\p{C}", "?");
    }

    public static Map<String,String> unicodeToReplace = new HashMap<>();
    static {
        unicodeToReplace.put("\\u00e0","&agrave;");
        unicodeToReplace.put("\\u00e2","&acirc;");
        unicodeToReplace.put("\\u00e4","&auml;");
        unicodeToReplace.put("\\u00e7","&ccedil;");
        unicodeToReplace.put("\\u00e8","&egrave;");
        unicodeToReplace.put("\\u00e9","&eacute;");
        unicodeToReplace.put("\\u00ea","&ecirc;");
        unicodeToReplace.put("\\u00eb","&euml;");
        unicodeToReplace.put("\\u00ee","&icirc;");
        unicodeToReplace.put("\\u00ef","&iuml;");
        unicodeToReplace.put("\\u00f4","&ocirc;");
        unicodeToReplace.put("\\u00f6","&ouml;");
        unicodeToReplace.put("\\u00f9","&ugrave;");
        unicodeToReplace.put("\\u00fb","&ucirc;");
        unicodeToReplace.put("\\u00fc","&uuml;");
        unicodeToReplace.put("\\p{C}","");
    }

    public static String unicode(String txt) {
        String result = txt;
        for (String key : unicodeToReplace.keySet()){
            result = result.replaceAll(key,unicodeToReplace.get(key));
        }
        return result;
    }
}
