package fr.openent.diary.services.impl;

import fr.openent.diary.Diary;
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

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

public class VisaServiceImpl implements VisaService {

    private static final Logger log = LoggerFactory.getLogger(VisaServiceImpl.class);
    private ExportPDFService exportPDFService;
    private int indexAsync = 0;

    public VisaServiceImpl(Storage storage, EventBus eb, Vertx vertx, JsonObject config) {
        this.exportPDFService = new ExportPDFServiceImpl(vertx, storage, config);

    }

    @Override
    public void createVisas(final HttpServerRequest request, JsonArray visas, UserInfos user, Handler<Either<String, JsonArray>> handler) {
        final JsonArray statements = new JsonArray();
        indexAsync = visas.size();

        DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd_HH:mm:ss");
        Date date = new Date();
        final String currentTime = dateFormat.format(date);

        for (int i = 0, imax = visas.size(); i < imax; i++) {
            final JsonObject visa = visas.getJsonObject(i);

            visa.put("owner_id", user.getUserId());
            visa.put("created", currentTime);
            visa.put("modified", currentTime);

            String fileName = getPDFName(visa);

            generatePDF(request, user, visa, pdf -> {
                this.exportPDFService.storePDF(pdf, fileName, response -> {

                    if (response.isLeft()) {
                        handler.handle(new Either.Left<>("Stored pdf failed"));
                    }
                    if (response.isRight()) {
                        JsonObject file = response.right().getValue();
                        visa.put("pdf_details", file.getString("_id"));
                        statements.add(get_VisaSession_Statement(visa));
                        indexAsync--;

                        if (indexAsync <= 0) {
                            Sql.getInstance().transaction(statements, SqlResult.validResultHandler(handler));
                        }
                    }
                });

            });
        }
    }

    @Override
    public void getVisaPdfDetails(String visaId, Handler<Either<String, JsonObject>> handler) {
        StringBuilder query = new StringBuilder();
        query.append(" SELECT *");
        query.append(" FROM " + Diary.DIARY_SCHEMA + ".visa visa");
        query.append(" WHERE visa.id = ").append(visaId);

        Sql.getInstance().raw(query.toString(), SqlResult.validUniqueResultHandler(handler));
    }

    private JsonObject get_VisaSession_Statement(JsonObject visa) {
        StringBuilder query = new StringBuilder();
        JsonArray values = new JsonArray();
        query.append("INSERT INTO diary.visa (comment, structure_id, teacher_id, nb_sessions, pdf_details, owner_id, created, modified) ");
        query.append("VALUES ");

        JsonArray sessionIds = visa.getJsonArray("sessionIds");
        query.append("(?, ?, ?, ?, ?, ?, ?, ?);");
        String comment = visa.getString("comment");
        values.add(comment == null || comment.isEmpty() ? "" : comment);
        values.add(visa.getString("structure_id"));
        values.add(visa.getString("teacher_id"));
        values.add(visa.getJsonArray("sessionIds").size());
        values.add(visa.getString("pdf_details"));
        values.add(visa.getString("owner_id"));
        values.add(visa.getString("created"));
        values.add(visa.getString("modified"));

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

    private void generatePDF(final HttpServerRequest request, UserInfos user, final JsonObject arrayVisaSessions, final Handler<Buffer> handler) {
        this.exportPDFService.generatePDF(request, user, arrayVisaSessions, "visa.xhtml", handler);
    }


    public String getPDFName(final JsonObject visa) {
        final String fileName = visa.getString("teacher_id") + "_" + visa.getString("structure_id") + visa.getString("owner_id") + "_" + visa.getString("created") + ".pdf";
        return fileName;
    }
}
