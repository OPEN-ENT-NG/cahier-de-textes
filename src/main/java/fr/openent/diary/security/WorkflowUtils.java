package fr.openent.diary.security;

import org.entcore.common.user.UserInfos;

import java.util.List;

public final class WorkflowUtils {

    static public final String HOMEWORK_MANAGE_RIGHT = "diary.homework.manage";
    static public final String LESSON_MANAGE_RIGHT = "diary.lesson.manage";
    static public final String LESSON_READ_RIGHT = "diary.lesson.read";
    static public final String VISA_MANAGE_RIGHT = "diary.visa.manage";

    static public final String ACCESS_OWN_DATA = "access.own.data";
    static public final String ACCESS_EXTERNAL_DATA = "access.external.data";
    static public final String ACCESS_CHILD_DATA = "access.child.data";

    private WorkflowUtils() {
        throw new IllegalAccessError("Utility class");
    }

    public static boolean hasRight (UserInfos user, String action) {
        List<UserInfos.Action> actions = user.getAuthorizedActions();
        for (UserInfos.Action userAction : actions) {
            if (action.equals(userAction.getDisplayName())) {
                return true;
            }
        }
        return false;
    }

}