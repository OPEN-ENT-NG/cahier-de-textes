package fr.openent.diary.controllers;

import fr.openent.diary.models.Subject;
import fr.openent.diary.security.workflow.SessionRead;
import fr.openent.diary.services.SubjectService;
import fr.wseduc.rs.Get;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import io.vertx.core.Promise;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.response.DefaultResponseHandler;

import java.util.List;

public class SubjectController extends ControllerHelper {

    private final SubjectService subjectService;

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

    @Get("/timetableSubjects/:structureId")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(SessionRead.class)
    public void getTimetableSubjects(final HttpServerRequest request) {
        final String structureId = request.getParam("structureId");
        Promise<List<Subject>> promise = Promise.promise();
        subjectService.getSubjects(structureId, promise);

        promise.future()
                .onSuccess(result -> renderJson(request, new JsonArray(result)))
                .onFailure(fail -> badRequest(request));
    }
}
