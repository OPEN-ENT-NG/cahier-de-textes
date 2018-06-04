package fr.openent.diary.services;

import fr.openent.diary.model.GenericHandlerResponse;
import fr.wseduc.webutils.Either;
import org.entcore.common.neo4j.Neo4j;
import org.entcore.common.sql.*;
import org.entcore.common.user.UserInfos;
import org.entcore.common.utils.StringUtils;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.Message;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.entcore.common.sql.SqlResult.validUniqueResultHandler;

/**
 * Created by dbreyton on 13/07/2016.
 * TODO refactor in ENTCORE
 */
public class SharedServiceImpl implements SharedService {

    private final Neo4j neo = Neo4j.getInstance();
    private final Sql sql = Sql.getInstance();
    private final JsonArray profileNamesToShare = new fr.wseduc.webutils.collections.JsonArray(Arrays.asList("Teacher", "Student", "Relative"));

    private final static Logger log = LoggerFactory.getLogger(SharedServiceImpl.class);
    private String schema;
    private String membersTable;
    private String shareTable;

    private String groupsTable;
    private String usersTable;


    private HomeworkService homeworkService;

    public SharedServiceImpl(final String sqlConfContext) {
        final SqlConf sqlConf = SqlConfs.getInstance().get(sqlConfContext);
        this.schema = sqlConf.getSchema();

        this.membersTable = schema + "groups";
        this.groupsTable = schema + "groups";
        this.usersTable = schema + "users";
        this.shareTable = schema + ((sqlConf.getShareTable() != null && !sqlConf.getShareTable().trim().isEmpty()) ? sqlConf.getShareTable() : "shares");
    }

    @Override
    public void shareResource(final UserInfos userInfos, String classGroupId, final String resourceId, Boolean isGroup, final List<String> actions,
                              final Handler<Either<String, JsonObject>> handler) {
        if (isGroup) {
            massGroupShare(userInfos,resourceId, Arrays.asList(classGroupId), actions, handler);
        } else {
            findAllSubGroup(classGroupId, new Handler<Message<JsonObject>>() {
                @Override
                public void handle(Message<JsonObject> event) {
                    if ("ok".equals(event.body().getString("status"))) {
                        JsonArray r = event.body().getJsonArray("result", new fr.wseduc.webutils.collections.JsonArray());
                        //fixme TODO CHECK VISIBILITY IF NECESSARY
                        massGroupShare(userInfos,resourceId, getListFromNeoResult(r), actions, handler);
                    } else {
                        handler.handle(new Either.Left<String, JsonObject>(event.body().getString("message")));
                    }
                }
            });
        }
    }

    private void massGroupShare(final UserInfos userInfos, final String resourceId, final List<String> groupShareIds,
                                final List<String> actions, final Handler<Either<String, JsonObject>> handler) {
        final StringBuilder rawParams = new StringBuilder();
        for (final String groupShareId : groupShareIds) {
            rawParams.append("'").append(groupShareId).append("'").append(",");
        }
        rawParams.deleteCharAt(rawParams.length() - 1);

        final SqlStatementsBuilder s = new SqlStatementsBuilder();
        s.raw("LOCK TABLE " + membersTable + " IN SHARE ROW EXCLUSIVE MODE");
        s.raw("LOCK TABLE " + shareTable + " IN SHARE ROW EXCLUSIVE MODE");
        s.raw(
                "INSERT INTO " + membersTable + " (id) SELECT id " +
                        "FROM unnest(ARRAY[" + rawParams.toString() + "]) M (id) " +
                        "WHERE NOT EXISTS (SELECT * FROM " + membersTable + " WHERE id = M.id);"
        );

        final Object rId = Sql.parseId(resourceId);
        final String query =
                "INSERT INTO " + shareTable + " (member_id, resource_id, action) SELECT ?, ?, ? WHERE NOT EXISTS " +
                        "(SELECT * FROM " + shareTable + " WHERE member_id = ? AND resource_id = ? AND action = ?);";
        for (String action : actions) {
            for (String shareId : groupShareIds) {
                JsonArray ar = new fr.wseduc.webutils.collections.JsonArray()
                        .add(shareId).add(rId).add(action).add(shareId).add(rId).add(action);
                s.prepared(query, ar);
            }
        }
        sql.transaction(s.build(), new Handler<Message<JsonObject>>() {
            @Override
            public void handle(Message<JsonObject> res) {
                final Either<String, JsonObject> r = SqlResult.validUniqueResult(2, res);
                handler.handle(r);
            }
        });
    }

    private void findAllSubGroup(String classGroupId, final Handler<Message<JsonObject>> handler) {
        //find all subgroup of the classroom
        String query = "MATCH (:Class {id:{classId}})<-[:DEPENDS]-(g:ProfileGroup)-[:DEPENDS]->(ProfileGroup)-[:HAS_PROFILE]-(p:Profile) " +
                "WHERE p.name IN {profileNames} return g.id";
        final JsonObject params = new JsonObject().put("classId", classGroupId).put("profileNames", profileNamesToShare);

        neo.execute(query, params, handler);
    }

    @Override
    public void updateShareResource(final UserInfos userInfos, final String oldClassGroupId, final String newClassGroupId, final String resourceId, final Boolean isOldGroup, final Boolean isNewGroup,
                                    final List<String> actions, final Handler<Either<String, JsonObject>> handler) {
        if (!StringUtils.isEmpty(oldClassGroupId) && !StringUtils.isEmpty(newClassGroupId) && !oldClassGroupId.equals(newClassGroupId)) {
            if (isOldGroup && isNewGroup) {
                removeAndCreateShareResource(userInfos,Arrays.asList(oldClassGroupId), Arrays.asList(newClassGroupId), resourceId, actions, handler);
            } else if ((isOldGroup && !isNewGroup) || (!isOldGroup && isNewGroup)) {
                findAllSubGroup((isOldGroup ? newClassGroupId : oldClassGroupId), new Handler<Message<JsonObject>>() {
                    @Override
                    public void handle(Message<JsonObject> event) {
                        if ("ok".equals(event.body().getString("status"))) {
                            final JsonArray result = event.body().getJsonArray("result", new fr.wseduc.webutils.collections.JsonArray());
                            final List<String> groupShareIds = getListFromNeoResult(result);
                            removeAndCreateShareResource(userInfos,(isOldGroup ? Arrays.asList(oldClassGroupId) : groupShareIds),
                                    (isNewGroup ? Arrays.asList(newClassGroupId) : groupShareIds), resourceId, actions, handler);
                        } else {
                            handler.handle(new Either.Left<String, JsonObject>(event.body().getString("message")));
                        }
                    }
                });
            } else {
                findAllSubGroup(oldClassGroupId, new Handler<Message<JsonObject>>() {
                    @Override
                    public void handle(Message<JsonObject> event) {
                        if ("ok".equals(event.body().getString("status"))) {
                            final JsonArray oldResult = event.body().getJsonArray("result", new fr.wseduc.webutils.collections.JsonArray());
                            final List<String> oldGroupShareIds = getListFromNeoResult(oldResult);
                            findAllSubGroup(newClassGroupId, new Handler<Message<JsonObject>>() {
                                @Override
                                public void handle(Message<JsonObject> event) {
                                    if ("ok".equals(event.body().getString("status"))) {
                                        final JsonArray newResult = event.body().getJsonArray("result", new fr.wseduc.webutils.collections.JsonArray());
                                        removeAndCreateShareResource(userInfos, oldGroupShareIds, getListFromNeoResult(newResult), resourceId, actions, handler);
                                    } else {
                                        handler.handle(new Either.Left<String, JsonObject>(event.body().getString("message")));
                                    }
                                }
                            });
                        } else {
                            handler.handle(new Either.Left<String, JsonObject>(event.body().getString("message")));
                        }
                    }
                });
            }
        } else {
            //nothing TODO
            handler.handle(new Either.Right<String, JsonObject>(new JsonObject()));
        }
    }

    private void removeAndCreateShareResource(final UserInfos userInfos, List<String> oldClassGroupId, final List<String> newClassGroupId, final String resourceId, final List<String> actions, final Handler<Either<String, JsonObject>> handler) {
        removeMassGroupShare(resourceId, oldClassGroupId, new Handler<Either<String, JsonObject>>() {
            @Override
            public void handle(Either<String, JsonObject> event) {
                if (event.isRight()) {
                    massGroupShare(userInfos,resourceId, newClassGroupId, actions, handler);
                }
            }
        });
    }

    @Override
    public void removeShareResource(String classGroupId, final String resourceId, Boolean isGroup,
                                     final Handler<Either<String, JsonObject>> handler) {
        if (isGroup) {
            removeMassGroupShare(resourceId, Arrays.asList(classGroupId), handler);
        } else {
            findAllSubGroup(classGroupId, new Handler<Message<JsonObject>>() {
                @Override
                public void handle(Message<JsonObject> event) {
                    if ("ok".equals(event.body().getString("status"))) {
                        JsonArray r = event.body().getJsonArray("result", new fr.wseduc.webutils.collections.JsonArray());
                        removeMassGroupShare(resourceId, getListFromNeoResult(r), handler);
                    } else {
                        handler.handle(new Either.Left<String, JsonObject>(event.body().getString("message")));
                    }
                }
            });
        }
    }

    private void removeMassGroupShare(final String resourceId, final List<String> groupShareIds,
                                             final Handler<Either<String, JsonObject>> handler) {
        final Object[] g = groupShareIds.toArray();

        final String query = "DELETE FROM " + shareTable + " WHERE member_id IN " + Sql.listPrepared(g) + " AND resource_id = ? ";
        final JsonArray values = new fr.wseduc.webutils.collections.JsonArray(Arrays.asList(g));
        values.add(Sql.parseId(resourceId));
        sql.prepared(query, values, SqlResult.validUniqueResultHandler(handler));
    }

    private List<String> getListFromNeoResult(JsonArray r) {
        final List<String> groupShareIds = new ArrayList<String>();
        for (int i = 0; i < r.size(); i++) {
            JsonObject j = r.getJsonObject(i);
            if (j != null && j.getString("g.id") != null) {
                groupShareIds.add(j.getString("g.id"));
            }
        }
        return groupShareIds;
    }

    @Override
    public void shareOrUpdateLinkedResources(final Long parentResourceId, final List<Long> resourceIds, final UserInfos userInfos, final String groupId, final List<String> actions,
                                            final Handler<Either<String, JsonObject>> handler) {

        final boolean isGroup;
        final String memberId;

        if (groupId == null) {
            memberId = userInfos.getUserId();
            isGroup = false;
        } else {
            memberId = groupId;
            isGroup = true;
        }

        removeLinkedHomeworks(resourceIds, memberId, actions, new Handler<Either<String, JsonObject>>() {
            @Override
            public void handle(Either<String, JsonObject> event) {
                if (event.isRight()) {
                    shareLinkedHomeworks(resourceIds, memberId, isGroup, actions, new Handler<Either<String, JsonObject>>() {
                        @Override
                        public void handle(final Either<String, JsonObject> event) {
                            if (event.isRight()){
                                final List<Boolean> count = new ArrayList<Boolean>();
                                for (final Long resourceId: resourceIds) {
                                    homeworkService.notifyHomeworkShare(parentResourceId, resourceId, userInfos, new Handler<GenericHandlerResponse>() {
                                        @Override
                                        public void handle(GenericHandlerResponse eventGeneric) {
                                            count.add(Boolean.TRUE);
                                            if (resourceIds.size() == count.size()){
                                                handler.handle(new Either.Right<String, JsonObject>(event.right().getValue()));
                                            }
                                        }
                                    });
                                }
                            }else{
                                handler.handle(new Either.Left<String, JsonObject>(event.left().getValue()));
                            }
                        }
                    });
                } else {
                    handler.handle(new Either.Left<String, JsonObject>(event.left().getValue()));
                }
            }
        });
    }

    @Override
    public void removeLinkedHomeworks(final List<Long> homeworkIds, final String memberId, List<String> actions,
                                      final Handler<Either<String, JsonObject>> handler) {

        String actionFilter;
        JsonArray parameters;
        if (actions != null && actions.size() > 0) {
            Object[] a = actions.toArray();
            actionFilter = "action IN " + Sql.listPrepared(a) + " AND ";
            parameters = new fr.wseduc.webutils.collections.JsonArray(Arrays.asList(a));
        } else {
            actionFilter = "";
            parameters = new fr.wseduc.webutils.collections.JsonArray();
        }

        for (Long homeworkId: homeworkIds) {
            parameters.add(homeworkId);
        }

        StringBuilder query = new StringBuilder();
        query.append("DELETE FROM diary.homework_shares WHERE ");
        query.append(actionFilter);
        query.append("resource_id IN ");
        query.append(Sql.listPrepared(homeworkIds.toArray()));
        query.append(" AND member_id = ? ");

        parameters.add(memberId);

        sql.prepared(query.toString(), parameters, validUniqueResultHandler(handler));
    }

    private void shareLinkedHomeworks(final List<Long> resourceIds, final String memberId, final boolean isGroup, final List<String> actions,
                                      final Handler<Either<String, JsonObject>> handler) {

        String membersTable = (isGroup) ? this.groupsTable : this.usersTable;

        final SqlStatementsBuilder s = new SqlStatementsBuilder();
        s.raw("LOCK TABLE " + membersTable + " IN SHARE ROW EXCLUSIVE MODE");
        s.raw("LOCK TABLE diary.homework_shares IN SHARE ROW EXCLUSIVE MODE");

        StringBuilder raw = new StringBuilder();
        raw.append("INSERT INTO ").append(membersTable).append("(id) SELECT '").append(memberId).append("'");
        raw.append(" WHERE NOT EXISTS (SELECT * FROM ").append(membersTable).append(" WHERE id = '").append(memberId).append("');");

        s.raw(raw.toString());

        final StringBuilder query = new StringBuilder();
        query.append("INSERT INTO diary.homework_shares (member_eid, resource_id, action) SELECT ?, ?, ? WHERE NOT EXISTS ");
        query.append("(SELECT * FROM diary.homework_shares WHERE member_id = ? AND resource_id = ? AND action = ?);");


        for (String action : actions) {
            for (Long resourceId: resourceIds) {
                JsonArray queryParams = new fr.wseduc.webutils.collections.JsonArray();
                queryParams.add(memberId).add(resourceId).add(action).add(memberId).add(resourceId).add(action);
                s.prepared(query.toString(), queryParams);
            }
        }

        sql.transaction(s.build(), new Handler<Message<JsonObject>>() {
            @Override
            public void handle(Message<JsonObject> res) {
                Either<String, JsonObject> r = SqlResult.validUniqueResult(2, res);
                handler.handle(r);

                /*final Either<String, JsonObject> r = SqlResult.validUniqueResult(2, res);
                final List<Boolean> count = new ArrayList<Boolean>();
                //NOTIFY RESOURCES
                if (notify){
                    for (final Long resourceId: resourceIds) {
                        homeworkService.notifyHomeworkShare(null, resourceId, new Handler<GenericHandlerResponse>() {
                            @Override
                            public void handle(GenericHandlerResponse event) {
                                count.add(Boolean.TRUE);
                                if (resourceIds.size() == count.size()){
                                    handler.handle(r);
                                }
                            }
                        });
                    }
                }*/
            }
        });
    }
}