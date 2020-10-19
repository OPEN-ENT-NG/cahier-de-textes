package fr.openent.diary.services;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

import java.util.List;

public interface VisaService {

    /**
     * Fetch visas based on ids we have in parameter
     *
     * @param structure_id  structure identifier
     * @param sessionsIds   all sessions identifiers fetched
     * @param homeworkIds   all homework identifiers fetched
     * @param handler       function handler returning visas
     */
    void getVisasFromSessionsAndHomework(String structure_id, List<String> sessionsIds, List<String>
            homeworkIds, Handler<Either<String, JsonArray>> handler);

    void createVisas(final HttpServerRequest request, JsonArray visas, UserInfos user, Handler<Either<String, JsonArray>> handler);

    void getVisaPdfDetails(String visaId, Handler<Either<String, JsonObject>> handler);

    String getPDFName(final JsonObject visa);

}
