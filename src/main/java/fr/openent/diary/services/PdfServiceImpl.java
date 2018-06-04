package fr.openent.diary.services;

import fr.openent.diary.controllers.VisaController;
import fr.openent.diary.model.HandlerResponse;
import fr.openent.diary.model.lessonview.LessonModel;
import fr.openent.diary.utils.SqlMapper;
import fr.wseduc.webutils.http.Renders;
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.eventbus.Message;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.io.StringReader;
import java.io.StringWriter;
import java.io.Writer;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

/**
 * Created by A664240 on 22/06/2017.
 */
public class PdfServiceImpl {

    private VisaServiceImpl visaService = new VisaServiceImpl();
    public PdfServiceImpl(VisaServiceImpl visaService) {
        this.visaService = visaService;
    }

    public Handler<HandlerResponse<List<LessonModel>>>  lessonPdfGenerator(final Renders render, final JsonObject specificsDatas, final HttpServerRequest request, final Vertx vertx, final EventBus eb){
        return new Handler<HandlerResponse<List<LessonModel>>>() {
            @Override
            public void handle(HandlerResponse<List<LessonModel>> event) {
                final String templatePath = "./pdf/lesson.pdf.xhtml";
                final String node  = (String) vertx.sharedData().getLocalMap("server").get("node");

                List<LessonModel> lessons = event.getResult();

                final JsonObject templateProps = specificsDatas!=null ? specificsDatas : new JsonObject();

                final Map<String,String> stats = visaService.getVisaSelectLessonStats(lessons);
                for (String key : stats.keySet()){
                    templateProps.put(key,stats.get(key));
                }


                templateProps.put("nbLesson",lessons.size()+"");

                try {
                    templateProps.put("lessons",(JsonArray) SqlMapper.objectToJson(lessons, fr.openent.diary.utils.DateUtils.getFrenchSimpleDateFormat()));
                } catch (Exception e) {
                    e.printStackTrace();
                }

                URL resource = VisaController.class.getClassLoader().getResource(templatePath);

                try {
                    vertx.fileSystem().readFile(Paths.get(resource.toURI()).toFile().getAbsolutePath(), new Handler<AsyncResult<Buffer>>() {

                        @Override
                        public void handle(AsyncResult<Buffer> result) {
                            if(!result.succeeded()){
                                Renders.badRequest(request);
                                return;
                            }

                            StringReader reader = new StringReader(result.result().toString("UTF-8"));

                            render.processTemplate(request, templateProps, templatePath, reader, new Handler<Writer>(){
                                public void handle(Writer writer) {
                                    String processedTemplate = ((StringWriter) writer).getBuffer().toString();

                                    if(processedTemplate == null){
                                        Renders.badRequest(request);
                                        return;
                                    }

                                    JsonObject actionObject = new JsonObject();
                                    actionObject
                                            .put("content", processedTemplate.getBytes());

                                    eb.send(node + "entcore.pdf.generator", actionObject, new Handler<AsyncResult<Message<JsonObject>>>() {
                                        public void handle(AsyncResult<Message<JsonObject>> reply) {
                                            JsonObject pdfResponse = reply.result().body();
                                            if(!"ok".equals(pdfResponse.getString("status"))){
                                                Renders.badRequest(request, pdfResponse.getString("message"));
                                                return;
                                            }


                                            byte[] pdf = pdfResponse.getBinary("content");
                                            request.response().putHeader("Content-Type", "application/pdf");
                                            request.response().putHeader("Content-Disposition",
                                                    "attachment; filename=file.pdf");
                                            request.response().end(Buffer.buffer(pdf));
                                        }
                                    });
                                }

                            });
                        }
                    });
                } catch (URISyntaxException e) {
                    Renders.badRequest(request,e.getMessage());
                }
            }
        };
    }
}
