package fr.openent.diary.security.workflow;

import fr.openent.diary.Diary;
import fr.openent.diary.db.DBService;
import fr.openent.diary.helper.FutureHelper;
import fr.openent.diary.security.WorkflowUtils;
import fr.wseduc.webutils.http.Binding;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.http.filter.ResourcesProvider;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.user.UserInfos;

import java.util.Collections;


public class SessionManage extends DBService implements ResourcesProvider {

    private static final Logger LOGGER = LoggerFactory.getLogger(SessionManage.class);

    @Override
    public void authorize(HttpServerRequest resourceRequest, Binding binding, UserInfos user,
                          Handler<Boolean> handler) {
        String stringId = resourceRequest.getParam("id");
        stringId = stringId != null ? stringId : resourceRequest.getParam("sessionId");
        boolean hasSessionManageRight = WorkflowUtils.hasRight(user, WorkflowUtils.SESSION_MANAGE);

        if (stringId == null) {
            handler.handle(hasSessionManageRight);
            return;
        }

        long sessionId = Long.parseLong(stringId);

        resourceRequest.pause();
        getSessionTeacherId(sessionId)
                .onFailure(fail -> {
                    resourceRequest.resume();
                    LOGGER.error("[Diary@SessionManage::authorize] " +
                            "An error occurred while checking sessionManage authorization. " + fail.getMessage());
                    handler.handle(false);
                })
                .onSuccess(result -> {
                    resourceRequest.resume();
                    handler.handle(
                            hasSessionManageRight && user.getUserId().equals(result.getString("teacher_id"))
                    );
                });
    }

    private Future<JsonObject> getSessionTeacherId(long sessionId) {
        Promise<JsonObject> promise = Promise.promise();
        String query = " SELECT teacher_id" +
                " FROM " + Diary.DIARY_SCHEMA + ".session" +
                " WHERE id = ? ";
        sql.prepared(query, new JsonArray(Collections.singletonList(sessionId)),
                SqlResult.validUniqueResultHandler(FutureHelper.handlerJsonObject(promise)));
        return promise.future();
    }

}