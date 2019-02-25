package fr.openent.diary.controllers;

import fr.openent.diary.security.workflow.AccessExternalData;
import fr.openent.diary.security.workflow.AccessOwnData;
import fr.openent.diary.services.HomeworkService;
import fr.openent.diary.services.InitService;
import fr.wseduc.rs.Get;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.response.DefaultResponseHandler;

public class InitController extends ControllerHelper {

    private InitService initService;
    public InitController(InitService initService) {
        this.initService = initService;
    }

    @Get("/init")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(AccessOwnData.class)
    public void initHomeworksType(final HttpServerRequest request) {
        String startDate = request.getParam("startDate");
        String endDate = request.getParam("endDate");
        String type = request.getParam("type");
        String typeId = request.getParam("typeId");

        initService.init(new Handler<Either<String, JsonObject>>() {
            @Override
            public void handle(Either<String, JsonObject> event) {

            }
        });
    }
}

