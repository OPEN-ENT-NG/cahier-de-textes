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
    public void workflow1(final HttpServerRequest request) {
    }

    @SecuredAction(value = WorkflowUtils.SESSION_MANAGE, type = ActionType.WORKFLOW)
    public void workflow2(final HttpServerRequest request) {
    }

    @SecuredAction(value = WorkflowUtils.SESSION_PUBLISH, type = ActionType.WORKFLOW)
    public void workflow3(final HttpServerRequest request) {
    }

    @Get("/sessions/own/:startDate/:endDate/:structureId")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(AccessOwnData.class)
    public void getOwnSessions(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            String startDate = request.getParam("startDate");
            String endDate = request.getParam("endDate");
            String structureId = request.getParam("structureId");
            String audienceId = request.getParam("audienceId");
            String subjectId = request.getParam("subjectId");

            sessionService.getOwnSessions(structureId, startDate, endDate, audienceId, subjectId, user, DefaultResponseHandler.arrayResponseHandler(request));
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
        Boolean displayVisa = request.getParam("visa") != null && Boolean.parseBoolean(request.getParam("visa"));

        List<String> listTeacherId = teacherId != null ? Arrays.asList(teacherId) : null;
        List<String> listAudienceId = request.getParam("audienceId") != null ? Arrays.asList(request.getParam("audienceId").split("\\s*,\\s*")) : null;
        List<String> listSubjectId = request.getParam("subjectId") != null ? Arrays.asList(request.getParam("subjectId").split("\\s*,\\s*")) : null;

        sessionService.getSessions(null, startDate, endDate, null, listAudienceId, listSubjectId, listTeacherId, true, displayVisa, true,
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

    @Get("/session-types")
    @SecuredAction(value = "", type = ActionType.AUTHENTICATED)
    @ResourceFilter(SessionRead.class)
    public void getSessionTypes(final HttpServerRequest request) {
        if (!request.params().contains("idStructure")) {
            badRequest(request);
            return;
        }
        final String structure_id = request.params().get("idStructure");
        sessionService.getSessionTypes(structure_id, DefaultResponseHandler.arrayResponseHandler(request));
    }

    @Post("/session-type")
    @SecuredAction(value = WorkflowUtils.GLOBAL_ACCESS_SETTING, type = ActionType.WORKFLOW)
    @ResourceFilter(GlobalSettingAccess.class)
    public void createSessionType(final HttpServerRequest request) {
        RequestUtils.bodyToJson(request, sessionType -> {
            sessionService.createSessionType(sessionType, DefaultResponseHandler.defaultResponseHandler(request));
        });
    }

    @Put("/session-type/:id")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(GlobalSettingAccess.class)
    public void updateSessionType(final HttpServerRequest request) {
        RequestUtils.bodyToJson(request, sessionType -> {
            Integer sessionTypeId = Integer.parseInt(request.getParam("id"));
            sessionService.updateSessionType(sessionTypeId, sessionType, DefaultResponseHandler.defaultResponseHandler(request));
        });
    }

    @Delete("/session-type/:id/:structureId")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(GlobalSettingAccess.class)
    public void deleteSessionType(final HttpServerRequest request) {
        Integer sessionTypeId = Integer.parseInt(request.getParam("id"));
        String structureId = request.getParam("structureId");
        sessionService.deleteSessionType(sessionTypeId, structureId, DefaultResponseHandler.defaultResponseHandler(request));
    }

}
