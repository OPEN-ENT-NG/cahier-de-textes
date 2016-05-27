package fr.openent.diary.filters;

import fr.openent.diary.controllers.LessonController;
import fr.wseduc.webutils.http.Binding;
import org.entcore.common.http.filter.ResourcesProvider;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlConf;
import org.entcore.common.sql.SqlConfs;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import java.util.ArrayList;
import java.util.List;

import static org.entcore.common.sql.Sql.parseId;

/**
 * Check access rights on lesson resources.
 */
public class LessonAccessFilter implements ResourcesProvider {

    @Override
    public void authorize(final HttpServerRequest request, final Binding binding, final UserInfos user, final Handler<Boolean> handler) {
        // test this for controller's name : String controllersName = binding.getServiceMethod().split("|")[0];
        SqlConf conf = SqlConfs.getConf(LessonController.class.getName());
        String resourceId = request.params().get(conf.getResourceIdLabel());

        if (resourceId != null && !resourceId.trim().isEmpty() && (parseId(resourceId) instanceof Integer)) {
            request.pause();
            // Replace character '.' by '-' in the called method's name
            String sharedMethod = binding.getServiceMethod().replaceAll("\\.", "-");

            // Groups and users
            final List<String> groupsAndUserIds = new ArrayList<>();
            groupsAndUserIds.add(user.getUserId());
            if (user.getGroupsIds() != null) {
                groupsAndUserIds.addAll(user.getGroupsIds());
            }

            //TODO change owner control to field owner !
            StringBuilder from = new StringBuilder(conf.getSchema());
            from.append(conf.getTable()).append(" AS t");
            from.append(" INNER JOIN ").append(conf.getSchema()).append(conf.getShareTable()).append(" AS st");
            from.append(" ON t.id = st.resource_id");

            StringBuilder query = new StringBuilder();
            JsonArray values = new JsonArray();
            query.append("SELECT count(*)")
                    .append(" FROM ").append(from.toString())
                    .append(" WHERE t.id = ? t.teacher_id = ? OR (st.resource_id = ? AND st.member_id IN ").append(Sql.listPrepared(groupsAndUserIds.toArray()))
                    .append(" AND st.action = ?) ");

            values.add(Sql.parseId(resourceId));
            values.add(user.getUserId());
            values.add(Sql.parseId(resourceId));
            for (String groupOrUser : groupsAndUserIds) {
                values.add(groupOrUser);
            }
            values.add(sharedMethod);

            Sql.getInstance().prepared(query.toString(), values, new Handler<Message<JsonObject>>() {
                @Override
                public void handle(Message<JsonObject> message) {
                    request.resume();
                    Long count = SqlResult.countResult(message);
                    handler.handle(count != null && count > 0);
                }
            });
        } else {
            handler.handle(false);
        }
    }
}
