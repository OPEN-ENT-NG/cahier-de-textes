package fr.openent.diary.security;

import org.entcore.common.user.UserInfos;

import java.util.List;

public final class WorkflowUtils {

    public static final String VIEW = "view";
    public static final String CHILDREN_READ = "children.red";

    public static final String ADMIN_ACCESS = "administrator.read";
    public static final String ADMIN_VISA_MANAGE = "administrator.visa.manage";
    public static final String ADMIN_VISA_READ = "administrator.visa.read";

    public static final String SESSION_READ = "session.read";
    public static final String SESSION_MANAGE = "session.manage";
    public static final String SESSION_PUBLISH = "session.publish";

    public static final String HOMEWORK_READ = "homework.read";
    public static final String HOMEWORK_MANAGE = "homework.manage";
    public static final String HOMEWORK_PUBLISH = "homework.publish";
    public static final String HOMEWORK_SET_PROGRESS = "homework.set.progress";

    public static final String NOTEBOOK_ARCHIVE_READ ="notebook.archive.read";
    public static final String NOTEBOOK_ARCHIVE_SEARCH_TEACHERS = "notebook.archive.search.teachers";

    public static final String VIESCO_SETTING_INIT_DATA = "viesco.setting.initalisation.data";
    public static final String VIESCO_SETTING_HOMEWORK_AND_SESSION_TYPE_READ = "viesco.setting.homework.and.session.type.read";
    public static final String VIESCO_SETTING_HOMEWORK_AND_SESSION_TYPE_MANAGE = "viesco.setting.homework.and.session.type.manage";

    public static final String VIEW_CALENDAR = "view.calendar";
    public static final String VIEW_LIST = "view.list";

    public static final String ACCESS_OWN_DATA = "access.own.data";
    public static final String ACCESS_EXTERNAL_DATA = "access.external.data";
    public static final String ACCESS_CHILD_DATA = "access.child.data";

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