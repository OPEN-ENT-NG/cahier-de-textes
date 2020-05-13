package fr.openent.diary.controllers;

import fr.openent.diary.security.WorkflowUtils;
import fr.wseduc.rs.Get;
import fr.wseduc.security.SecuredAction;
import io.vertx.core.http.HttpServerRequest;
import org.entcore.common.controller.ControllerHelper;

public class FakeRight extends ControllerHelper {

    public FakeRight() {
        super();
    }

    private void notImplemented(HttpServerRequest request) {
        request.response().setStatusCode(501).end();
    }

    @Get("/rights/access/external/data")
    @SecuredAction(WorkflowUtils.ACCESS_EXTERNAL_DATA)
    public void accessExternalData(HttpServerRequest request) {
        notImplemented(request);
    }
}
