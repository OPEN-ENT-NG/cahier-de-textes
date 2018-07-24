package fr.openent.diary.controllers;

import fr.openent.diary.security.WorkflowUtils;
import fr.openent.diary.services.DiaryService;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.http.BaseController;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.neo4j.Neo;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.http.RouteMatcher;

import java.util.Map;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;

public class DiaryController extends BaseController {

    private final static Logger log = LoggerFactory.getLogger(DiaryController.class);

    private Neo neo;

    DiaryService diaryService;

    public DiaryController(DiaryService diaryService) {
        this.diaryService = diaryService;
    }

    @Override
    public void init(Vertx vertx, JsonObject config, RouteMatcher rm,
                     Map<String, fr.wseduc.webutils.security.SecuredAction> securedActions) {
        super.init(vertx, config, rm, securedActions);
        this.neo = new Neo(vertx, eb, log);
    }

    @Get("")
    @SecuredAction(value = WorkflowUtils.VIEW, type = ActionType.WORKFLOW)
    public void view(final HttpServerRequest request) {
        renderView(request);
    }

    @Get("/children/list")
    @ApiDoc("Get all children for current user (if applicable)")
    @SecuredAction(value = WorkflowUtils.CHILDREN_READ, type = ActionType.AUTHENTICATED)
    public void listChildren(final HttpServerRequest request) {

        UserUtils.getUserInfos(eb, request, user -> {
            if (user != null) {
                diaryService.listChildren(user.getUserId(), arrayResponseHandler(request));
            } else {
                badRequest(request, "diary.invalid.login");
            }
        }
        );
    }

    @SecuredAction(value = WorkflowUtils.VIEW_CALENDAR, type = ActionType.WORKFLOW)
    public void workflow1(final HttpServerRequest request) { }

    @SecuredAction(value = WorkflowUtils.VIEW_LIST, type = ActionType.WORKFLOW)
    public void workflow2(final HttpServerRequest request) { }

    @SecuredAction(value = WorkflowUtils.ACCESS_OWN_DATA, type = ActionType.WORKFLOW)
    public void workflow3(final HttpServerRequest request) { }

    @SecuredAction(value = WorkflowUtils.ACCESS_CHILD_DATA, type = ActionType.WORKFLOW)
    public void workflow4(final HttpServerRequest request) { }

    @SecuredAction(value = WorkflowUtils.ACCESS_EXTERNAL_DATA, type = ActionType.WORKFLOW)
    public void workflow5(final HttpServerRequest request) { }
}
