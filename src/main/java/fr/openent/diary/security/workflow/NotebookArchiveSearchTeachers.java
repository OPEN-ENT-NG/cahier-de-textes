package fr.openent.diary.security.workflow;

import fr.openent.diary.security.*;
import fr.wseduc.webutils.http.*;
import io.vertx.core.*;
import io.vertx.core.http.*;
import org.entcore.common.http.filter.*;
import org.entcore.common.user.*;

public class NotebookArchiveSearchTeachers implements ResourcesProvider {

    @Override
    public void authorize(HttpServerRequest resourceRequest, Binding binding, UserInfos user,
                          Handler<Boolean> handler) {
        handler.handle(WorkflowUtils.hasRight(user, WorkflowUtils.NOTEBOOK_ARCHIVE_SEARCH_TEACHERS));
    }

}