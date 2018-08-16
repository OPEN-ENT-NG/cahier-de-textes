package fr.openent.diary.controllers;

import fr.openent.diary.security.WorkflowUtils;
import fr.openent.diary.security.workflow.VisaManage;
import fr.openent.diary.security.workflow.VisaRead;
import fr.openent.diary.services.ExportPDFService;
import fr.openent.diary.services.ExportPDFServiceImpl;
import fr.openent.diary.services.VisaService;
import fr.openent.diary.services.VisaServiceImpl;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.storage.Storage;
import org.entcore.common.user.UserUtils;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;

public class VisaController extends ControllerHelper {

    private VisaService visaService;
    private ExportPDFService exportPDFService;

    public VisaController(VisaServiceImpl visaService, Storage storage) {
        this.visaService = visaService;
        this.exportPDFService = new ExportPDFServiceImpl(eb, vertx, storage, config);

    }

    @SecuredAction(value = WorkflowUtils.VISA_READ, type = ActionType.WORKFLOW)
    public void workflow1(final HttpServerRequest request) {
    }


    @SecuredAction(value = WorkflowUtils.VISA_MANAGE, type = ActionType.WORKFLOW)
    public void workflow2(final HttpServerRequest request) {
    }

    @Post("/visas")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(VisaManage.class)
    public void createVisa(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> RequestUtils.bodyToJson(request, json -> {
            Handler<Either<String, JsonArray>> handler = arrayResponseHandler(request);
            JsonArray visas = json.getJsonArray("visas");
            visaService.createVisas(request, visas, user, handler);
        }));
    }

    @Get("/visa/:id/pdf")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(VisaRead.class)
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
}
