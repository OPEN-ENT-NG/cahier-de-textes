package fr.openent.diary.controllers;

import fr.openent.diary.security.WorkflowUtils;
import fr.openent.diary.security.workflow.*;
import fr.openent.diary.services.SessionService;
import fr.wseduc.rs.Delete;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.rs.Put;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.http.HttpServerRequest;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.response.DefaultResponseHandler;
import org.entcore.common.user.UserUtils;

import java.util.Arrays;
import java.util.List;

public class SessionController extends ControllerHelper {

    private SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @SecuredAction(value = WorkflowUtils.SESSION_READ, type = ActionType.WORKFLOW)
    public void workflow1(final HttpServerRequest request) { }

    @SecuredAction(value = WorkflowUtils.SESSION_MANAGE, type = ActionType.WORKFLOW)
    public void workflow2(final HttpServerRequest request) { }

    @SecuredAction(value = WorkflowUtils.SESSION_PUBLISH, type = ActionType.WORKFLOW)
    public void workflow3(final HttpServerRequest request) { }

    @Get("/sessions/own/:startDate/:endDate")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(AccessOwnData.class)
    public void getOwnSessions(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user ->  {
            String startDate = request.getParam("startDate");
            String endDate = request.getParam("endDate");
            String audienceId = request.getParam("audienceId");
            String subjectId = request.getParam("subjectId");

            sessionService.getOwnSessions(startDate, endDate, audienceId, subjectId, user, DefaultResponseHandler.arrayResponseHandler(request));
        });
    }

    @Get("/sessions/external/:startDate/:endDate/:type/:typeId")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(AccessExternalData.class)
    public void getExternalSessions(final HttpServerRequest request) {
        String startDate = request.getParam("startDate");
        String endDate = request.getParam("endDate");
        String type = request.getParam("type");
        String typeId = request.getParam("typeId");

        sessionService.getExternalSessions(startDate, endDate, type, typeId, DefaultResponseHandler.arrayResponseHandler(request));
    }

    @Get("/sessions/child/:startDate/:endDate/:childId")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(AccessChildData.class)
    public void getChildSessions(final HttpServerRequest request) {
        String startDate = request.getParam("startDate");
        String endDate = request.getParam("endDate");
        String childId = request.getParam("childId");

        sessionService.getChildSessions(startDate, endDate, childId, DefaultResponseHandler.arrayResponseHandler(request));
    }


    @Get("/sessions/visa/:startDate/:endDate/:teacherId")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(AdminAccess.class)
    public void getSessionsWithVisaField(final HttpServerRequest request) {
        String startDate = request.getParam("startDate");
        String endDate = request.getParam("endDate");
        String teacherId = request.getParam("teacherId");
        List<String> listTeacherId = Arrays.asList(teacherId);
        sessionService.getSessions(startDate, endDate, null, null, null, listTeacherId, true, false, true,
                DefaultResponseHandler.arrayResponseHandler(request));
    }


    @Get("/session/:id")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(SessionRead.class)
    public void getSession(final HttpServerRequest request) {
        long sessionId = Long.parseLong(request.getParam("id"));
        sessionService.getSession(sessionId, DefaultResponseHandler.defaultResponseHandler(request));
    }

    @Post("/session")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(SessionManage.class)
    public void createSession(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> RequestUtils.bodyToJson(request, pathPrefix + "session", session -> {
            sessionService.createSession(session, user, DefaultResponseHandler.defaultResponseHandler(request));
        }));
    }

    @Put("/session/:id")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(SessionManage.class)
    public void updateSession(final HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "session", session -> {
            long sessionId = Long.parseLong(request.getParam("id"));
            sessionService.updateSession(sessionId, session, DefaultResponseHandler.defaultResponseHandler(request));
        });
    }

    @Delete("/session/:id")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(SessionManage.class)
    public void deleteSession(final HttpServerRequest request) {
        long sessionId = Long.parseLong(request.getParam("id"));
        sessionService.deleteSession(sessionId, DefaultResponseHandler.defaultResponseHandler(request));
    }

    @Post("/session/publish/:id")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(SessionPublish.class)
    public void publishSession(final HttpServerRequest request) {
        long sessionId = Long.parseLong(request.getParam("id"));
        sessionService.publishSession(sessionId, DefaultResponseHandler.defaultResponseHandler(request));
    }

    @Post("/session/unpublish/:id")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(SessionPublish.class)
    public void unpublishSession(final HttpServerRequest request) {
        long sessionId = Long.parseLong(request.getParam("id"));
        sessionService.unpublishSession(sessionId, DefaultResponseHandler.defaultResponseHandler(request));
    }
}
