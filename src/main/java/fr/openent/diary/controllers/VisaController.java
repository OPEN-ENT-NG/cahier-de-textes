package fr.openent.diary.controllers;

import fr.openent.diary.security.WorkflowUtils;
import fr.openent.diary.security.workflow.AdminAccess;
import fr.openent.diary.security.workflow.AdminVisaManage;
import fr.openent.diary.services.ExportPDFService;
import fr.openent.diary.services.VisaService;
import fr.openent.diary.services.impl.ExportPDFServiceImpl;
import fr.openent.diary.services.impl.VisaServiceImpl;
import fr.openent.diary.utils.DateUtils;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.http.Renders;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.Handler;
import io.vertx.core.MultiMap;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.response.DefaultResponseHandler;
import org.entcore.common.storage.Storage;
import org.entcore.common.user.UserUtils;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;

public class VisaController extends ControllerHelper {

    private final VisaService visaService;
    private ExportPDFService exportPDFService;
    private final Storage storage;

    public VisaController(VisaServiceImpl visaService, Storage storage) {
        this.visaService = visaService;
        this.exportPDFService = new ExportPDFServiceImpl(vertx, storage, config);
        this.storage = storage;
    }

    @SecuredAction(value = WorkflowUtils.ADMIN_ACCESS, type = ActionType.WORKFLOW)
    public void workflow1(final HttpServerRequest request) {
    }


    @SecuredAction(value = WorkflowUtils.ADMIN_VISA_MANAGE, type = ActionType.WORKFLOW)
    public void workflow2(final HttpServerRequest request) {
    }

    @Get("/visas")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(AdminAccess.class)
    public void getVisas(final HttpServerRequest request) {
        MultiMap params = request.params();
        String structure_id = params.get("structure_id");
        List<String> sessionsIds = params.getAll("session_id");
        List<String> homeworksIds = params.getAll("homework_id");
        visaService.getVisasFromSessionsAndHomework(structure_id, sessionsIds, homeworksIds,
                DefaultResponseHandler.arrayResponseHandler(request));
    }

    @Post("/visas")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(AdminVisaManage.class)
    public void createVisa(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> RequestUtils.bodyToJson(request, json -> {
            Handler<Either<String, JsonArray>> handler = arrayResponseHandler(request);
            JsonArray visas = json.getJsonArray("visas");
            visaService.createVisas(request, visas, user, handler);
        }));
    }

    @Post("/visa/pdf")
    @SecuredAction(value = "", type = ActionType.AUTHENTICATED)
    public void postPDFforVisa(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {

            VisaController.this.storage.writeUploadFile(request, uploaded -> {
                if (!"ok".equals(uploaded.getString("status"))) {
                    badRequest(request, uploaded.getString("message"));
                    return;
                }
                // Vérification du format qui doit-être un pdf
                JsonObject metadata = uploaded.getJsonObject("metadata");
                String contentType = metadata.getString("content-type");

                if (Arrays.asList("application/pdf").contains(contentType)) {
                    Renders.renderJson(request, uploaded);
                } else {
                    badRequest(request, "Format de fichier incorrect");
                }

            });
        });
    }

    @Get("/visa/:id/pdf")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(AdminAccess.class)
    public void getVisaPdf(final HttpServerRequest request) {
        String visaId = request.getParam("id");
        visaService.getVisaPdfDetails(visaId, visa -> {
            String pdfId = visa.right().getValue().getString("pdf_details");
            this.exportPDFService.getPDF(pdfId, pdf ->
                    request.response()
                            .putHeader("Content-type", "application/pdf; charset=utf-8")
                            .putHeader("Content-Disposition", "attachment; filename=" + visaService.getPDFName(visa.right().getValue()))
                            .end(pdf)
            );

        });
    }

    @Post("/visas/topdf")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(AdminAccess.class)
    public void sessionsToPdf(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            RequestUtils.bodyToJson(request, json -> {
                try {
                    this.exportPDFService = new ExportPDFServiceImpl(vertx, storage, config);
                    JsonObject sessionsGroup = json.getJsonObject("visas");
                    sessionsGroup.put("owner_id", "");
                    sessionsGroup.put("created", "");
                    sessionsGroup.put("modified", "");
                    sessionsGroup.put("printPDF", true);
                    this.exportPDFService.generatePDF(request, user, sessionsGroup, "visa.xhtml", buffer -> {
                        String fileName;
                        try {
                            DateFormat dateFormat = new SimpleDateFormat(DateUtils.DAY_MONTH_YEAR_HOUR_TIME);
                            Date date = new Date();
                            fileName = dateFormat.format(date) + "-" + sessionsGroup.getString("audience") + "-" + sessionsGroup.getString("subject") + "-" + sessionsGroup.getString("teacher");
                        } catch (Exception e) {
                            fileName = "exportpdf";
                        }
                        request.response()
                                .putHeader("Content-type", "application/pdf; charset=utf-8")
                                .putHeader("Content-Disposition", "attachment; filename=" + fileName + ".pdf")
                                .end(buffer);
                    });
                } catch (Exception e) {
                    badRequest(request, "Can't create pdfs");
                }
            });
        });
    }
}
