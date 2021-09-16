package fr.openent.diary.utils;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.TimeZone;


public final class DateUtils {

    public static final String DATE_FORMAT ="yyyy-MM-dd";
    public static final String FRENCH_DATE_FORMAT ="dd-MM-yyyy";
    public static final String DATE_FORMAT_REGEX = "\\d{4}-[01]\\d-[0-3]\\d";
    public static final String DATE_FORMAT_SQL = "yyyy-MM-dd HH:mm:ss";
    public static final String SQL_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";
    public static final String YEAR = "yyyy";
    public static final String DAY_MONTH_YEAR_HOUR_TIME = "dd/MM/yyyy HH:mm:ss";
    public static final String HOUR_MINUTE_SECOND = "HH:mm:ss";
    public static final String HOUR_MINUTE = "HH:mm";


    private DateUtils()  {}

    /**
     * Parses a sql date formatted as yyyy-MM-dd into a Date Object.
     */
    public static Date parseDate(String dateToParse) throws ParseException {
        SimpleDateFormat dateFormat = new SimpleDateFormat(DATE_FORMAT);
        return dateFormat.parse(dateToParse);
    }

    public static Date parseDate(String dateToParse, String format) {
        try {
            SimpleDateFormat dateFormat = new SimpleDateFormat(format);
            return dateFormat.parse(dateToParse);
        } catch (ParseException e) {
            return null;
        }
    }

    /**
     * Fetching current date (now())
     *
     * @param format date format your type want to be returned
     * @return return current date with the wished format
     */
    public static String getCurrentDate(String format) {
        Calendar calendar = Calendar.getInstance();
        SimpleDateFormat sdf = new SimpleDateFormat(format);
        sdf.setTimeZone(TimeZone.getTimeZone("Europe/Paris"));
        return sdf.format(calendar.getTime());
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

    public static SimpleDateFormat getSimpleDateFormatSql(){
        return new SimpleDateFormat(DATE_FORMAT_SQL);
    }

    public static SimpleDateFormat getSimpleDateFormat(){
        SimpleDateFormat sdf = new SimpleDateFormat(DATE_FORMAT);
        return sdf;
    }

    public static SimpleDateFormat getFrenchSimpleDateFormat(){
        SimpleDateFormat sdf = new SimpleDateFormat(FRENCH_DATE_FORMAT);
        return sdf;
    }

    public static String formatDateSql(Date dateToParse) {
        SimpleDateFormat dateFormat = getSimpleDateFormatSql();
        return dateFormat.format(dateToParse);
    }

    public static Date parseDateSql(String dateToParse) throws ParseException {
        SimpleDateFormat dateFormat = getSimpleDateFormatSql();
        return dateFormat.parse(dateToParse);
    }


    public static String formatDate(Date dateToParse) {
        SimpleDateFormat dateFormat = getSimpleDateFormat();
        return dateFormat.format(dateToParse);
    }

    public static String formatDate(Date dateToParse, String format) {
        if (dateToParse == null) return null;
        SimpleDateFormat dateFormat = new SimpleDateFormat(format);
        return dateFormat.format(dateToParse);
    }
}
