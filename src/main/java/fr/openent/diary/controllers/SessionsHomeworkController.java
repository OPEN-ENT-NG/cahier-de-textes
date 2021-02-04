package fr.openent.diary.controllers;

import fr.openent.diary.security.workflow.HomeworkManage;
import fr.openent.diary.services.SessionHomeworkService;
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

public class SessionsHomeworkController extends ControllerHelper {

    private final SessionHomeworkService sessionHomeworkService;

    public SessionsHomeworkController(SessionHomeworkService sessionHomeworkService) {
        this.sessionHomeworkService = sessionHomeworkService;
    }

    @Post("/sessions/homework")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(HomeworkManage.class)
    public void createSessionsHomework(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> RequestUtils.bodyToJson(request, sessionsHomework ->
                sessionHomeworkService.create(sessionsHomework, user, DefaultResponseHandler.defaultResponseHandler(request)))
        );
    }

    @Put("/sessions/homework")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(HomeworkManage.class)
    public void updateSessionsHomework(final HttpServerRequest request) {
        RequestUtils.bodyToJson(request, sessionsHomework ->
                sessionHomeworkService.update(sessionsHomework, DefaultResponseHandler.defaultResponseHandler(request))
        );
    }
}
