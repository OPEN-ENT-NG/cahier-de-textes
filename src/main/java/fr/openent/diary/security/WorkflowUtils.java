package fr.openent.diary.security;

import org.entcore.common.user.UserInfos;

import java.util.List;

public final class WorkflowUtils {

    static public final String VIEW = "view";
    static public final String CHILDREN_READ = "children.red";

    static public final String ADMIN_ACCESS = "administrator.read";
    static public final String ADMIN_VISA_MANAGE = "administrator.visa.manage";

    static public final String SESSION_READ = "session.read";
    static public final String SESSION_MANAGE = "session.manage";
    static public final String SESSION_PUBLISH = "session.publish";

    static public final String HOMEWORK_READ = "homework.read";
    static public final String HOMEWORK_MANAGE = "homework.manage";
    static public final String HOMEWORK_PUBLISH = "homework.publish";
    static public final String HOMEWORK_SET_PROGRESS = "homework.set.progress";

    static public final String VIESCO_SETTING_INIT_DATA = "viesco.setting.initalisation.data";
    static public final String VIESCO_SETTING_HOMEWORK_AND_SESSION_TYPE_READ = "viesco.setting.homework.and.session.type.read";
    static public final String VIESCO_SETTING_HOMEWORK_AND_SESSION_TYPE_MANAGE = "viesco.setting.homework.and.session.type.manage";

    static public final String VIEW_CALENDAR = "view.calendar";
    static public final String VIEW_LIST = "view.list";

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