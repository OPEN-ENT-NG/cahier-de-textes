package fr.openent.diary.controllers;

import fr.openent.diary.security.workflow.SessionRead;
import fr.openent.diary.services.SubjectService;
import fr.wseduc.rs.Get;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import io.vertx.core.http.HttpServerRequest;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.response.DefaultResponseHandler;

public class SubjectController extends ControllerHelper {

    private SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @Get("/subjects/exceptional/:structureId")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(SessionRead.class)
    public void getExceptionalLabels(final HttpServerRequest request) {
        if (!request.params().contains("structureId")) {
            badRequest(request);
            return;
        }
        final String structureId = request.getParam("structureId");
        subjectService.getExceptionalLabels(structureId, DefaultResponseHandler.asyncDefaultResponseHandler(request));
    }
}
