package fr.openent.diary.services;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.neo4j.Neo4j;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.user.UserInfos;


public class InspectorServiceImpl implements InspectorService {
    private final Neo4j neo = Neo4j.getInstance();

    @Override
    public void createInspectorHabilitation(JsonObject habilitation, Handler<Either<String, JsonArray>> handler) {
        JsonArray values = new JsonArray();
        String query = "INSERT INTO diary.inspector_habilitation (inspector_id, teacher_id, structure_id) " +
                "VALUES (?, ?, ?);";
        values.add(habilitation.getString("inspectorId"));
        values.add(habilitation.getString("teacherId"));
        values.add(habilitation.getString("structureId"));

        Sql.getInstance().prepared(query, values, SqlResult.validResultHandler(handler));
    }

    @Override
    public void deleteInspectorHabilitation(String inspectorId, String teacherId, String structureId, Handler<Either<String, JsonArray>> handler) {
        JsonArray values = new JsonArray();
        String query = "DELETE FROM diary.inspector_habilitation " +
                "WHERE inspector_id = ? " +
                "AND teacher_id = ? " +
                "AND structure_id = ? ";

        values.add(inspectorId);
        values.add(teacherId);
        values.add(structureId);

        Sql.getInstance().prepared(query, values, SqlResult.validResultHandler(handler));
    }

    @Override
    public void deleteInspector(String inspectorId, Handler<Either<String, JsonArray>> handler) {
        String query = "DELETE FROM diary.inspector_habilitation WHERE inspector_id = " + inspectorId;
        Sql.getInstance().raw(query, SqlResult.validResultHandler(handler));
    }


    @Override
    public void getInspectorHabilitations(String inspectorId, String structureId, UserInfos user, Handler<Either<String, JsonArray>> handler) {
        JsonArray values = new JsonArray();
        String query = "SELECT * FROM diary.inspector_habilitation " +
                " WHERE inspector_id = ? " +
                " AND structure_id = ? ";
        values.add(inspectorId);
        values.add(structureId);

        Sql.getInstance().prepared(query, values, SqlResult.validResultHandler(handler));
    }
}
