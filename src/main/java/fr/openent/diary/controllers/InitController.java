package fr.openent.diary.controllers;

import fr.openent.diary.security.WorkflowUtils;
import fr.openent.diary.security.workflow.ViescoSettingInitialisationData;
import fr.openent.diary.services.InitService;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;

import static org.entcore.common.http.response.DefaultResponseHandler.defaultResponseHandler;

public class InitController extends ControllerHelper {

    private InitService initService;

    public InitController(InitService initService) {
        this.initService = initService;
    }

    @Get("/initialization/structures/:id")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(ViescoSettingInitialisationData.class)
    @ApiDoc("Retrieve structure initialization status")
    public void getInitializationStatus(HttpServerRequest request) {
        String structure = request.getParam("id");
        initService.retrieveInitializationStatus(structure, defaultResponseHandler(request));
    }

    @Get("/init/structures/:id")
    @SecuredAction(value = WorkflowUtils.VIESCO_SETTING_INIT_DATA , type = ActionType.WORKFLOW)
    public void initHomeworksAndSessionsType(final HttpServerRequest request) {
        String structure_id = request.getParam("id");
        initService.init(structure_id, event -> {
            if (event.isRight()) {
                renderJson(request, event.right().getValue());
            } else {
                String message = "[diary@InitController::initHomeworksAndSessionsType] " +
                        "Failed to initialize structure ";
                log.error(message + event.left().getValue());
                badRequest(request);
            }
        });
    }

}

