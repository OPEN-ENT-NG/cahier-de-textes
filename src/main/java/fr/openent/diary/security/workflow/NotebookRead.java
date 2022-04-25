package fr.openent.diary.security.workflow;

import fr.openent.diary.helper.FutureHelper;
import fr.wseduc.webutils.http.Binding;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.http.HttpServerRequest;
import org.entcore.common.http.filter.ResourcesProvider;
import org.entcore.common.user.UserInfos;

import java.util.Arrays;
import java.util.List;

public class NotebookRead implements ResourcesProvider {

    @Override
    public void authorize(HttpServerRequest resourceRequest, Binding binding, UserInfos user,
                          Handler<Boolean> handler) {
        this.canAccessHomeworkAndSession(resourceRequest, user)
                .onSuccess(handler)
                .onFailure(err -> handler.handle(false));
    }

    private Future<Boolean> canAccessHomeworkAndSession(HttpServerRequest request, UserInfos userInfos) {
        Promise<Boolean> promise = Promise.promise();
        List<Future<Boolean>> futureList = Arrays.asList(
                new SessionRead().canAccessSession(request, userInfos),
                new HomeworkRead().canAccessHomework(request, userInfos)
        );
        FutureHelper.all(futureList)
                .onSuccess(res -> promise.complete(futureList.stream().allMatch(Future::result)))
                .onFailure(promise::fail);
        return promise.future();
    }
}