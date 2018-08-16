package fr.openent.diary.services;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;

public interface ExportPDFService {
    /**
     * Generation of a PDF from a XHTML template
     *
     * @param request       Http request
     * @param templateProps JSON object
     * @param templateName  template's name
     * @param handler       Function handler returning data
     */
    void generatePDF(final HttpServerRequest request, final JsonObject templateProps, final String templateName, final Handler<Buffer> handler);

    void getPDF(String pdfId, Handler<Buffer> handler);

    void storePDF(final Buffer pdf, String fileName, final Handler<Either<String, JsonObject>> handler);
}