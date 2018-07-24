package fr.openent.diary.services;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.user.UserInfos;


public class VisaServiceImpl implements VisaService {

    @Override
    public void createVisa(JsonObject visa, UserInfos user, Handler<Either<String, JsonArray>> handler) {
        JsonArray values = new JsonArray();
        String query = "INSERT INTO diary.visa (comment, structure_id, session_id, owner_id) " +
               "VALUES (?, ?, ?, ?) RETURNING id";
        values.add(visa.getString("comment"));
        values.add(visa.getString("structure_id"));
        values.add(visa.getInteger("session_id"));
        values.add(user.getUserId());

        Sql.getInstance().prepared(query, values, SqlResult.validResultHandler(handler));
    }

    @Override
    public void updateVisa(long visaId, JsonObject visa, Handler<Either<String, JsonArray>> handler) {
        JsonArray values = new JsonArray();
        String query = "UPDATE diary.visa " +
                "SET comment = ?, modified = NOW() WHERE id = ? ";
        values.add(visa.getString("comment"));
        values.add(visaId);

        Sql.getInstance().prepared(query, values, SqlResult.validResultHandler(handler));
    }

    @Override
    public void deleteVisa(long visaId, Handler<Either<String, JsonArray>> handler) {
        String query = "DELETE FROM diary.visa WHERE id = " + visaId;
        Sql.getInstance().raw(query, SqlResult.validResultHandler(handler));
    }
}
