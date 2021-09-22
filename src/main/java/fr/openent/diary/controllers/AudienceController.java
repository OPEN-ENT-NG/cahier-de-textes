package fr.openent.diary.controllers;

import fr.openent.diary.eventbus.Viescolaire;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import io.vertx.core.http.HttpServerRequest;
import org.entcore.common.controller.ControllerHelper;

public class AudienceController extends ControllerHelper {

    @Get("/structures/:structureId/audiences/:audienceId/students")
    @ApiDoc("Retrieve students from a given group")
//    @SecuredAction(value = "", type = ActionType.RESOURCE)
//    @ResourceFilter(SearchRight.class) TODO ajouter des droits
    public void getGroupStudents(HttpServerRequest request) {
        String audienceId = request.getParam("audienceId");
        Viescolaire.getInstance()
                .getAudienceStudents(audienceId)
                .onSuccess(result -> renderJson(request, result))
                .onFailure(err -> badRequest(request));
    }

}
