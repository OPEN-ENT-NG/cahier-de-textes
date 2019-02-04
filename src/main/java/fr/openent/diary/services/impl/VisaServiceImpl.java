package fr.openent.diary.services.impl;

import fr.openent.diary.services.ExportPDFService;
import fr.openent.diary.services.VisaService;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.storage.Storage;
import org.entcore.common.user.UserInfos;

public class VisaServiceImpl implements VisaService {

    private static final Logger log = LoggerFactory.getLogger(VisaServiceImpl.class);
    private ExportPDFService exportPDFService;
    private int indexAsync = 0;

    public VisaServiceImpl(Storage storage, EventBus eb, Vertx vertx, JsonObject config) {
        this.exportPDFService = new ExportPDFServiceImpl(eb, vertx, storage, config);

    }

    @Override
    public void createVisas(final HttpServerRequest request, JsonArray visas, UserInfos user, Handler<Either<String, JsonArray>> handler) {
        final JsonArray statements = new JsonArray();

        for (int i = 0; i < visas.size(); i++) {
            JsonObject visa = visas.getJsonObject(i);
            statements.add(getVisaSessionStatement(visa, user));
        }

        Sql.getInstance().transaction(statements, SqlResult.validResultHandler(handler));
    }

    @Override
    public void getVisaPdfDetails(String visaId, Handler<Either<String, JsonObject>> handler) {
        StringBuilder query = new StringBuilder();
        query.append(" SELECT *");
        query.append(" FROM diary.visa visa");
        query.append(" WHERE visa.id = ").append(visaId);

        Sql.getInstance().raw(query.toString(), SqlResult.validUniqueResultHandler(handler));
    }

    private JsonObject getVisaSessionStatement(JsonObject visa, UserInfos user) {
        StringBuilder query = new StringBuilder();
        JsonArray values = new JsonArray();
        query.append("INSERT INTO diary.visa (comment, structure_id, teacher_id, nb_sessions, pdf_details, owner_id, created, modified) ");
        query.append("VALUES ");

        JsonArray sessionIds = visa.getJsonArray("sessionIds");
        query.append("(?, ?, ?, ?, ?, ?, NOW(), NOW());");
        values.add(visa.getString("comment"));
        values.add(visa.getString("structure_id"));
        values.add(visa.getString("teacher_id"));
        values.add(visa.getJsonArray("sessionIds").size());
        values.add(visa.getString("fileId"));
        values.add(user.getUserId());

        for (int j = 0; j < sessionIds.size(); j++) {
            Integer sessionId = sessionIds.getInteger(j);
            query.append("INSERT INTO diary.session_visa ( session_id, visa_id) ");
            query.append("VALUES ");
            query.append("(?, (SELECT currval(pg_get_serial_sequence('diary.visa', 'id'))));");
            values.add(sessionId);
        }

        return new JsonObject().put("statement", query.toString())
                .put("values", values).put("action", "prepared");
    }

    private void generatePDF(final HttpServerRequest request, final JsonObject arrayVisaSessions, final Handler<Buffer> handler) {
        this.exportPDFService.generatePDF(request, arrayVisaSessions, "visa.xhtml", handler);
    }


    public String getPDFName(final JsonObject visa) {

        final String fileName = visa.getString("teacher_id") + "_" + visa.getString("structure_id") + visa.getString("owner_id") + "_" + visa.getString("created") + ".pdf";
        return fileName;
    }
}
