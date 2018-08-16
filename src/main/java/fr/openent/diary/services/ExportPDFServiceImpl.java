package fr.openent.diary.services;

import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.data.FileResolver;
import fr.wseduc.webutils.http.Renders;
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.eventbus.Message;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.storage.Storage;

import java.io.StringReader;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.io.Writer;
import java.util.UUID;

import static fr.wseduc.webutils.Utils.handlerToAsyncHandler;
import static fr.wseduc.webutils.http.Renders.badRequest;
import static fr.wseduc.webutils.http.Renders.getScheme;


public class ExportPDFServiceImpl implements ExportPDFService {
    private static final Logger LOGGER = LoggerFactory.getLogger(ExportPDFServiceImpl.class);
    private String node;
    private JsonObject config;
    private Vertx vertx;
    private EventBus eb;
    private Renders renders;
    private Storage storage;
    private static final Logger log = LoggerFactory.getLogger(VisaServiceImpl.class);


    public ExportPDFServiceImpl(EventBus eb, Vertx vertx, Storage storage, JsonObject config) {
        super();
        this.eb = eb;
        this.config = config;
        this.vertx = vertx;
        this.renders = new Renders(this.vertx, this.config);
        this.storage = storage;

    }

    public void generatePDF(final HttpServerRequest request, final JsonObject templateProps, final String templateName, final Handler<Buffer> handler) {
        final String templatePath = config.getJsonObject("exports").getString("template-path");
        final String baseUrl = getScheme(request) + "://" + Renders.getHost(request) +
                config.getString("app-address") + "/public/";

        node = (String) vertx.sharedData().getLocalMap("server").get("node");
        if (node == null) {
            node = "";
        }

        String absolutePathPrefix = FileResolver.absolutePath("./");
        //templateProps.put("pathPrefix", absolutePathPrefix);

        vertx.fileSystem().readFile(absolutePathPrefix + templatePath + templateName, new Handler<AsyncResult<Buffer>>() {

            @Override
            public void handle(AsyncResult<Buffer> result) {
                if (!result.succeeded()) {
                    badRequest(request);
                    return;
                }
                StringReader reader = new StringReader(result.result().toString("UTF-8"));
                renders.processTemplate(request, templateProps, templateName, reader, new Handler<Writer>() {

                    @Override
                    public void handle(Writer writer) {
                        String processedTemplate = ((StringWriter) writer).getBuffer().toString();
                        if (processedTemplate == null) {
                            badRequest(request);
                            return;
                        }
                        JsonObject actionObject = new JsonObject();
                        byte[] bytes;
                        try {
                            bytes = processedTemplate.getBytes("UTF-8");
                        } catch (UnsupportedEncodingException e) {
                            bytes = processedTemplate.getBytes();
                            LOGGER.error(e.getMessage(), e);
                        }

                        actionObject
                                .put("content", bytes)
                                .put("baseUrl", baseUrl);
                        eb.send(node + "entcore.pdf.generator", actionObject, handlerToAsyncHandler(new Handler<Message<JsonObject>>() {
                            @Override
                            public void handle(Message<JsonObject> reply) {
                                JsonObject pdfResponse = reply.body();
                                if (!"ok".equals(pdfResponse.getString("status"))) {
                                    badRequest(request, pdfResponse.getString("message"));
                                    return;
                                }
                                byte[] pdf = pdfResponse.getBinary("content");
                                Buffer either = Buffer.buffer(pdf);
                                handler.handle(either);
                            }
                        }));
                    }
                });

            }
        });

    }

    @Override
    public void getPDF(String pdfId, Handler<Buffer> handler) {
        storage.readFile(pdfId, pdf -> handler.handle(pdf));
    }

    @Override
    public void storePDF(Buffer pdf, String fileName, Handler<Either<String, JsonObject>> handler) {
        final String id = UUID.randomUUID().toString();

        storage.writeBuffer(id, pdf, "application/pdf", fileName, file -> {
            if ("ok".equals(file.getString("status"))) {
                handler.handle(new Either.Right<>(file));
            } else {
                log.error("An error occurred when inserting pdf in mongo");
            }
        });
    }
}