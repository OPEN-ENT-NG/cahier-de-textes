package fr.openent.diary.services.impl;

import fr.openent.diary.controllers.DiaryController;
import fr.openent.diary.services.DiaryService;
import fr.openent.diary.utils.StringUtils;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.Message;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.neo4j.Neo4j;
import org.entcore.common.neo4j.Neo4jResult;
import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.sql.SqlStatementsBuilder;

import java.util.ArrayList;
import java.util.List;

import static org.entcore.common.sql.SqlResult.validUniqueResultHandler;

/**
 * Created by a457593 on 18/02/2016.
 */
public class DiaryServiceImpl implements DiaryService {

    private final Neo4j neo = Neo4j.getInstance();

    /**
     * List children info about parent id
     * @param parentId
     * @param handler
     */
    public void listChildren(final String parentId, final Handler<Either<String, JsonArray>> handler) {
        StringBuilder sb = new StringBuilder("");
        sb.append(" MATCH (n:User {id : {id}}) ");
        sb.append(" WHERE HAS(n.login) ");
        sb.append(" MATCH n<-[:RELATED]-(child:User) ");
        sb.append(" MATCH child-[:IN]->(gp:Group) ");
        sb.append(" MATCH gp-[:DEPENDS]->(c:Class) ");
        sb.append(" RETURN distinct  child.id as id, child.displayName as displayName, c.id as classId, c.name as className ");

        JsonObject params = new JsonObject().put("id", parentId);
        neo.execute(sb.toString(), params, Neo4jResult.validResultHandler(handler));
    }

    @Override
    public void listGroupsFromChild(final List<String> childIds, final Handler<Either<String, JsonArray>> handler){
        StringBuilder query = new StringBuilder("");
        query.append("MATCH (n:User) - [IN] -> (g:Group) where n.id IN {id} RETURN g.id as groupId ");
        JsonObject params = new JsonObject().put("id",new fr.wseduc.webutils.collections.JsonArray(childIds));
        neo.execute(query.toString(), params, Neo4jResult.validResultHandler(handler));
    }

    @Override
    public void getAudienceFromChild(String childId, Handler<Either<String, JsonArray>> handler) {
        StringBuilder query = new StringBuilder("");
        query.append("MATCH (n:User)-[:IN]->(pg:ProfileGroup)-[:DEPENDS]->(c:Class) WHERE n.id = {id} RETURN c.id as audienceId ")
                .append("UNION ")
                .append("MATCH (n:User)-[:IN]->(fg:FunctionalGroup) WHERE n.id = {id} RETURN DISTINCT fg.id as audienceId ")
                .append("UNION ")
                .append("MATCH (n:User)-[:IN]->(mg:ManualGroup) WHERE n.id = {id} RETURN DISTINCT mg.id as audienceId;");
        JsonObject params = new JsonObject().put("id", childId);
        neo.execute(query.toString(), params, Neo4jResult.validResultHandler(handler));
    }
}
