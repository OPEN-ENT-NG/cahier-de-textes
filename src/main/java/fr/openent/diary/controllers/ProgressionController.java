package fr.openent.diary.controllers;

import fr.openent.diary.core.constants.Actions;
import fr.openent.diary.security.workflow.SessionManage;
import fr.openent.diary.security.workflow.SessionRead;
import fr.openent.diary.services.ProgressionService;
import fr.openent.diary.services.impl.ProgessionServiceImpl;
import fr.wseduc.rs.Delete;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.rs.Put;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.filter.Trace;
import org.entcore.common.http.response.DefaultResponseHandler;
import org.entcore.common.user.UserUtils;

import static fr.wseduc.webutils.http.response.DefaultResponseHandler.defaultResponseHandler;

public class ProgressionController extends ControllerHelper {

    ProgressionService progressionService;

    public ProgressionController(ProgessionServiceImpl diary) {
        this.progressionService = diary;
    }

    @Get("/progressions/:ownerId")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(SessionRead.class)
    public void getProgressions(final HttpServerRequest request) {

        String ownerId = request.getParam("ownerId");

        progressionService.getProgressions(ownerId, DefaultResponseHandler.arrayResponseHandler(request));
    }

    @Get("/progression/:progressionId")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(SessionManage.class)
    public void getProgression(final HttpServerRequest request) {

        String progressionId = request.getParam("progressionId");

        progressionService.getProgression(progressionId, DefaultResponseHandler.arrayResponseHandler(request));

    }

    @Delete("/progressions")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @Trace(value = Actions.DELETE_PROGRESSION)
    @ResourceFilter(SessionManage.class)
    public void deleteProgression(final HttpServerRequest request) {
        request.bodyHandler(body -> {
            JsonObject jsonBody = new JsonObject(body);
            progressionService.deleteProgressions(jsonBody, DefaultResponseHandler.arrayResponseHandler(request));
        });
    }

    @Delete("/progression/folders")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @Trace(value = Actions.DELETE_PROGRESSION_FOLDER)
    @ResourceFilter(SessionManage.class)
    public void deleteProgressionFolders(final HttpServerRequest request) {
        request.bodyHandler(body -> {
            JsonObject jsonBody = new JsonObject(body);
            progressionService.deleteProgressionFolders(jsonBody, DefaultResponseHandler.arrayResponseHandler(request));
        });
    }


    @Post("/progression/create")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @Trace(value = Actions.CREATE_PROGRESSION)
    @ResourceFilter(SessionManage.class)
    public void createProgression(final HttpServerRequest request) {

        UserUtils.getUserInfos(eb, request, user -> RequestUtils.bodyToJson(request, pathPrefix + "progression_session", new Handler<JsonObject>() {
            @Override
            public void handle(JsonObject progression) {
                if (progression.containsKey("progression_homeworks") && !progression.getJsonArray("progression_homeworks").isEmpty()) {
                    progressionService.createFullProgression(progression, defaultResponseHandler(request));
                } else {
                    progressionService.createSessionProgression(progression, DefaultResponseHandler.arrayResponseHandler(request));
                }
            }

        }));
    }


    @Post("/progression/folder/create")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @Trace(value = Actions.CREATE_PROGRESSION_FOLDER)
    @ResourceFilter(SessionManage.class)
    public void createProgressionFolder(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> RequestUtils.bodyToJson(request, json -> {
            Handler<Either<String, JsonObject>> handler = defaultResponseHandler(request);
            progressionService.createFolder(request, json, user, handler);
        }));
    }

    @Put("/progression/folder/update/:progressionId")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @Trace(value = Actions.UPDATE_PROGRESSION_FOLDER)
    @ResourceFilter(SessionManage.class)
    public void updateProgressionFolder(final HttpServerRequest request) {
        String progressionId = request.getParam("progressionId");
        UserUtils.getUserInfos(eb, request, user -> RequestUtils.bodyToJson(request, json -> {
            progressionService.updateProgressionFolder(json, progressionId, DefaultResponseHandler.defaultResponseHandler(request));
        }));

    }


    @Delete("/progression/homework/:progressionHomeworkId")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @Trace(value = Actions.DELETE_PROGRESSION)
    @ResourceFilter(SessionManage.class)
    public void deleteProgressionHomework(final HttpServerRequest request) {

        String progressionHomeworkId = request.getParam("progressionHomeworkId");

        progressionService.deleteHomeworkProgression(progressionHomeworkId, DefaultResponseHandler.arrayResponseHandler(request));
    }


    @Put("/progression/update/:progressionId")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @Trace(value = Actions.UPDATE_PROGRESSION)
    @ResourceFilter(SessionManage.class)
    public void updateProgressions(final HttpServerRequest request) {
        String folderId = request.getParam("progressionId");

        UserUtils.getUserInfos(eb, request, user -> RequestUtils.bodyToJson(request, pathPrefix + "progression_session", new Handler<JsonObject>() {
            @Override
            public void handle(JsonObject progression) {
                progressionService.updateProgressions(progression, folderId, DefaultResponseHandler.defaultResponseHandler(request));
            }

        }));

    }

    //TODO CHECK IF STILL CALLED
    @Put("/progression/to/session/:idProgression/:idSession")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(SessionManage.class)
    public void progressionToSession(final HttpServerRequest request) {
        String idProgression = request.getParam("idProgression");

        String idSession = request.getParam("idSession");
        UserUtils.getUserInfos(eb, request, user -> RequestUtils.bodyToJson(request, pathPrefix + "progression_session", new Handler<JsonObject>() {
            @Override
            public void handle(JsonObject progression) {
                progressionService.progressionToSession(progression, idProgression, idSession, DefaultResponseHandler.defaultResponseHandler(request));
            }

        }));

    }

}


