package fr.openent.diary.controllers;

import fr.openent.diary.security.WorkflowUtils;
import fr.openent.diary.security.workflow.VisaManage;
import fr.openent.diary.services.VisaService;
import fr.openent.diary.services.VisaServiceImpl;
import fr.wseduc.rs.Delete;
import fr.wseduc.rs.Post;
import fr.wseduc.rs.Put;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.response.DefaultResponseHandler;
import org.entcore.common.user.UserUtils;

public class VisaController extends ControllerHelper {

    private VisaService visaService;

    public VisaController(VisaServiceImpl visaService) {
        this.visaService = visaService;
    }

    @SecuredAction(value = WorkflowUtils.VISA_MANAGE, type = ActionType.WORKFLOW)
    public void workflow1(final HttpServerRequest request) { }

    @Post("/visa")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(VisaManage.class)
    public void createVisa(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> RequestUtils.bodyToJson(request, pathPrefix + "createVisa", visa -> {
            Handler<Either<String, JsonArray>> handler = DefaultResponseHandler.arrayResponseHandler(request);
            visaService.createVisa(visa, user, handler);
        }));
    }

    @Put("/visa/:id")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(VisaManage.class)
    public void updateVisa(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> RequestUtils.bodyToJson(request, pathPrefix + "updateVisa", visa -> {
            Handler<Either<String, JsonArray>> handler = DefaultResponseHandler.arrayResponseHandler(request);
            visaService.updateVisa(Long.parseLong(request.params().get("id")), visa, handler);
        }));
    }

    @Delete("/visa/:id")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(VisaManage.class)
    public void deleteVisa(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            Handler<Either<String, JsonArray>> handler = DefaultResponseHandler.arrayResponseHandler(request);
            visaService.deleteVisa(Long.parseLong(request.params().get("id")), handler);
        });
    }
}
