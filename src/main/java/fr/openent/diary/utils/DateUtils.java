package fr.openent.diary.utils;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;

/**
 * Created by a457593 on 26/02/2016.
 */
public final class DateUtils {

    private final static String FORMAT ="yyyy-MM-dd";

    private DateUtils()  {}

    /**
     * Parses a sql date formatted as yyyy-MM-dd into a Date Object.
     */
    public static Date parseDate(String dateToParse) throws ParseException {
        SimpleDateFormat dateFormat = new SimpleDateFormat(FORMAT);
        return dateFormat.parse(dateToParse);
    }

    public static Boolean isBefore(Date d1, Date d2) {
        if ((d1 == null) || (d2 == null)) {
            return false;
        }
        final Date d1Arr = untimed(d1);
        final Date d2Arr = untimed(d2);
        return (d1Arr.before(d2) || d1Arr.equals(d2Arr));
    }

    private static Date untimed(Date date) {
        final Calendar cal = new GregorianCalendar();
        cal.setTime(date);
        cal.set(Calendar.HOUR_OF_DAY, 0);

        return cal.getTime();
    }
}
