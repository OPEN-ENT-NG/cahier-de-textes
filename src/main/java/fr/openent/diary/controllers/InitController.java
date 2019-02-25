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
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.response.DefaultResponseHandler;
import org.entcore.common.user.UserUtils;

public class InitController extends ControllerHelper {

    private InitService initService;

    public InitController(InitService initService) {
        this.initService = initService;
    }

    @Get("/init")
    @SecuredAction(value = "", type = ActionType.AUTHENTICATED)
    public void initHomeworksType(final HttpServerRequest request) {
        initService.init(new Handler<Either<String, JsonObject>>() {
            @Override
            public void handle(Either<String, JsonObject> event) {
                if (event.isRight()) {
                    renderJson(request, event.right().getValue());
                } else {
                    log.error("Error when init");
                    badRequest(request);
                }
            }
        });
    }

}

