package fr.openent.diary.security.workflow;

import fr.openent.diary.security.WorkflowUtils;
import fr.wseduc.webutils.http.Binding;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.http.HttpServerRequest;
import org.entcore.common.http.filter.ResourcesProvider;
import org.entcore.common.user.UserInfos;

public class HomeworkRead implements ResourcesProvider {

    @Override
    public void authorize(HttpServerRequest resourceRequest, Binding binding, UserInfos user,
                          Handler<Boolean> handler) {
        handler.handle(WorkflowUtils.hasRight(user, WorkflowUtils.HOMEWORK_READ));
    }

    public Future<Boolean> canAccessHomework(HttpServerRequest request, UserInfos userInfos) {
        Promise<Boolean> promise = Promise.promise();
        this.authorize(request, null, userInfos, promise::complete);
        return promise.future();
    }
}