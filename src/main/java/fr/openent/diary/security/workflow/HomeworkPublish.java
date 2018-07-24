package fr.openent.diary.security.workflow;

import fr.openent.diary.security.WorkflowUtils;
import fr.wseduc.webutils.http.Binding;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import org.entcore.common.http.filter.ResourcesProvider;
import org.entcore.common.user.UserInfos;

public class HomeworkPublish implements ResourcesProvider {

    @Override
    public void authorize(HttpServerRequest resourceRequest, Binding binding, UserInfos user,
                          Handler<Boolean> handler) {
        handler.handle(WorkflowUtils.hasRight(user, WorkflowUtils.HOMEWORK_PUBLISH));
    }

}