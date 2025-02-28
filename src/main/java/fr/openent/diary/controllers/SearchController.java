package fr.openent.diary.controllers;

import fr.openent.diary.Diary;
import fr.openent.diary.security.workflow.AdminAccess;
import fr.openent.diary.security.workflow.SearchRight;
import fr.openent.diary.services.SearchService;
import fr.openent.diary.services.impl.DefaultSearchService;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.user.*;

import java.util.List;

import static fr.wseduc.webutils.Utils.handlerToAsyncHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;



public class SearchController extends ControllerHelper {

    private final EventBus eb;
    private final SearchService searchService;

    public SearchController(EventBus eb) {
        super();
        this.eb = eb;
        this.searchService = new DefaultSearchService(eb);
    }

    @Get("/search/users")
    @ApiDoc("Search for users")
    @SecuredAction(Diary.SEARCH)
    public void searchUsers(HttpServerRequest request) {
        if (request.params().contains("q") && !"".equals(request.params().get("q").trim())
                && request.params().contains("field")
                && request.params().contains("profile")
                && request.params().contains("structureId")) {


            UserUtils.getUserInfos(eb, request, user ->
                    new SearchRight().authorize(request, null, user, isAuthorized -> {
                        if (isAuthorized.equals(Boolean.TRUE)) {
                            String query = request.getParam("q");
                            List<String> fields = request.params().getAll("field");
                            String profile = request.getParam("profile");
                            String structureId = request.getParam("structureId");

                            JsonObject action = new JsonObject()
                                    .put("action", "user.search")
                                    .put("q", query)
                                    .put("fields", new JsonArray(fields))
                                    .put("profile", profile)
                                    .put("structureId", structureId);

                            callCDTEventBus(action, request);
                        } else {
                            badRequest(request);
                        }
                    }));

        } else {
            badRequest(request);
        }
    }

    @Get("/search/groups")
    @ApiDoc("Search for groups")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(SearchRight.class)
    public void searchGroups(HttpServerRequest request) {
        if (request.params().contains("q") && !"".equals(request.params().get("q").trim())
                && request.params().contains("field")
                && request.params().contains("structureId")) {

            String query = request.getParam("q");
            List<String> fields = request.params().getAll("field");
            String structure_id = request.getParam("structureId");

            searchService.searchGroups(query, fields, structure_id, arrayResponseHandler(request));
        } else {
            badRequest(request);
        }
    }

    @Get("/search")
    @ApiDoc("Search for a student or a group")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(AdminAccess.class)
    public void search(HttpServerRequest request) {
        if (request.params().contains("q") && !"".equals(request.params().get("q").trim())
                && request.params().contains("structureId")) {
            searchService.search(request.getParam("q"), request.getParam("structureId"), arrayResponseHandler(request));
        }
    }

    private void callCDTEventBus(JsonObject action, HttpServerRequest request) {
        eb.request("viescolaire", action, handlerToAsyncHandler(event -> {
            JsonObject body = event.body();
            if (!"ok".equals(body.getString("status"))) {
                log.error("[CDT@SearchController::callCDTEventBus] An error has occured while using viescolaire eb");
                renderError(request);
                return;
            }

            renderJson(request, body.getJsonArray("results"));
        }));
    }


}
