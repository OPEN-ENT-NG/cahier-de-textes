package fr.openent.diary.security.workflow;

import fr.openent.diary.Diary;
import fr.openent.diary.db.DB;
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

public class HomeworkManage extends DBService implements ResourcesProvider {

    private static final Logger LOGGER = LoggerFactory.getLogger(HomeworkManage.class);

    @Override
    public void authorize(HttpServerRequest resourceRequest, Binding binding, UserInfos user,
                          Handler<Boolean> handler) {
        String stringId = resourceRequest.getParam("id");
        stringId = stringId != null ? stringId : resourceRequest.getParam("homeworkId");
        boolean hasHomeworkManageRight = WorkflowUtils.hasRight(user, WorkflowUtils.HOMEWORK_MANAGE);

        if (stringId == null) {
            handler.handle(hasHomeworkManageRight);
            return;
        }

        long sessionId = Long.parseLong(stringId);

        resourceRequest.pause();
        getHomeworkTeacherId(sessionId)
                .onFailure(fail -> {
                    resourceRequest.resume();
                    LOGGER.error("[Diary@HomeworkManage::authorize] " +
                            "An error occurred while checking homeworkManage authorization. " + fail.getMessage());
                    handler.handle(false);
                })
                .onSuccess(result -> {
                    resourceRequest.resume();
                    handler.handle(
                            hasHomeworkManageRight && user.getUserId().equals(result.getString("teacher_id"))
                    );
                });

    }

    private Future<JsonObject> getHomeworkTeacherId(long homeworkId) {
        Promise<JsonObject> promise = Promise.promise();
        String query = " SELECT teacher_id" +
                " FROM " + Diary.DIARY_SCHEMA + ".homework" +
                " WHERE id = ? ";
        if (sql == null) {
            this.sql = DB.getInstance().sql();
        }
        sql.prepared(query, new JsonArray(Collections.singletonList(homeworkId)),
                SqlResult.validUniqueResultHandler(FutureHelper.handlerJsonObject(promise)));
        return promise.future();
    }
}