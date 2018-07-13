package fr.openent.diary.services;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.neo4j.Neo4j;
import org.entcore.common.neo4j.Neo4jResult;
import org.entcore.common.user.UserInfos;

public class StudentServiceImpl implements StudentService {

    @Override
    public void getChildren(UserInfos user, Handler<Either<String, JsonArray>> handler) {

        String query = "MATCH (:User {id:{userId}})<-[RELATED]-(u:User)-[IN]->(s:Structure) " +
                "MATCH (c:Class) where c.externalId IN u.classes " +
                "WITH {id: u.id, firstName: u.firstName, lastName: u.lastName, class:{name:c.name, id: c.id}} as user return user";
        Neo4j.getInstance().execute(query, new JsonObject().put("userId", user.getUserId()), Neo4jResult.validResultHandler(handler));
    }
}
