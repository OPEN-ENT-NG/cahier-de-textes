package fr.openent.diary.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import com.fasterxml.jackson.core.JsonParser;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;

/**
 * Created by A664240 on 17/06/2017.
 */
public class MultiDateSerializer  extends StdDeserializer<Date> {

    private static final long serialVersionUID = 1L;

    private static final String[] DATE_FORMATS = new String[] {
            "yyyy-MM-dd HH:mm:ss.SSSSSSZ",
            "yyyy-MM-dd'T'HH:mm:ss.SSS"
    };

    public MultiDateSerializer() {
        this(null);
    }

    public MultiDateSerializer(Class<?> vc) {
        super(vc);
    }

    @Override
    public Date deserialize(JsonParser jp, DeserializationContext ctxt) throws IOException, JsonProcessingException {
        JsonNode node = jp.getCodec().readTree(jp);
        final String date = node.textValue();

        for (String DATE_FORMAT : DATE_FORMATS) {
            try {
                return new SimpleDateFormat(DATE_FORMAT).parse(date);
            } catch (ParseException e) {
            }
        }
        throw new RuntimeException("Unparseable date:  Supported formats: " + Arrays.toString(DATE_FORMATS));
    }
}