package fr.openent.diary.core.constants;

public class Actions {

    private Actions() {
        throw new IllegalStateException("Utility class");
    }

    // user create a session
    public static final String CREATE_SESSION = "CREATE_SESSION";
    // user update a session
    public static final String UPDATE_SESSION = "UPDATE_SESSION";
    // user delete a session
    public static final String DELETE_SESSION = "DELETE_SESSION";

    // user create a homework
    public static final String CREATE_HOMEWORK = "CREATE_HOMEWORK";
    // user update a homework
    public static final String UPDATE_HOMEWORK = "UPDATE_HOMEWORK";
    // user delete a homework
    public static final String DELETE_HOMEWORK = "DELETE_HOMEWORK";

    // user create a progression
    public static final String CREATE_PROGRESSION = "CREATE_PROGRESSION";
    // user create a progression folder
    public static final String CREATE_PROGRESSION_FOLDER = "CREATE_PROGRESSION_FOLDER";
    // user update a progression
    public static final String UPDATE_PROGRESSION = "UPDATE_PROGRESSION";
    // user update a progression folder
    public static final String UPDATE_PROGRESSION_FOLDER = "UPDATE_PROGRESSION_FOLDER";
    // user delete a progression
    public static final String DELETE_PROGRESSION = "DELETE_PROGRESSION";
    // user delete a progression folder
    public static final String DELETE_PROGRESSION_FOLDER = "DELETE_PROGRESSION_FOLDER";

    // user add a visa
    public static final String CREATE_VISA = "CREATE_VISA";
}