package fr.openent.diary.controllers;

import fr.openent.diary.security.WorkflowUtils;
import fr.openent.diary.security.workflow.*;
import fr.openent.diary.services.HomeworkService;
import fr.openent.diary.services.ProgressionService;
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
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.response.DefaultResponseHandler;
import org.entcore.common.user.UserUtils;

public class ProgressionController extends ControllerHelper {

    ProgressionService progressionService;


    public ProgressionController(ProgressionService progressionService) {
        this.progressionService = progressionService;
    }

    @Get("/progressions/:ownerId")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(SessionRead.class)
    public void getProgressions(final HttpServerRequest request) {

        String ownerId = request.getParam("ownerId");

        progressionService.getProgressions( ownerId, DefaultResponseHandler.arrayResponseHandler(request));
    }


    @Delete("/progression/:progressionId")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(SessionManage.class)
    public void deleteProgression(final HttpServerRequest request) {

        String progressionId = request.getParam("progressionId");

        progressionService.deleteProgressions( progressionId, DefaultResponseHandler.arrayResponseHandler(request));
    }


    @Post("/progression/create")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(SessionManage.class)
    public void createProgression(final HttpServerRequest request) {

        UserUtils.getUserInfos(eb, request, user -> RequestUtils.bodyToJson(request, pathPrefix + "progression_session", progression -> {
            if(progression.containsKey("progression_homeworks")&&!progression.getJsonArray("progression_homeworks").isEmpty()){
                progressionService.createFullProgression(progression, DefaultResponseHandler.arrayResponseHandler(request));
            }else{
                progressionService.createSessionProgression(progression, DefaultResponseHandler.arrayResponseHandler(request));
            }
        }));
//                progressionService.createSessionProgression(new JsonObject(), DefaultResponseHandler.arrayResponseHandler(request));


    }


    @Delete("/progression/homework/:progressionId")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(SessionManage.class)
    public void deleteProgressionHomework(final HttpServerRequest request) {

        String progressionId = request.getParam("progressionId");

        progressionService.deleteHomeworkProgression( progressionId, DefaultResponseHandler.arrayResponseHandler(request));
    }

    @Post("/progression/:progressionId")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(SessionManage.class)
    public void updateProgressions(final HttpServerRequest request) {

        String progressionId = request.getParam("progressionId");

        progressionService.updateProgressions( progressionId, DefaultResponseHandler.arrayResponseHandler(request));
    }

    @Post("/progression/to/session/:idProgression/:idSession")
    @SecuredAction(value = "",type = ActionType.RESOURCE)
    @ResourceFilter(SessionManage.class)
    public void progressionToSession(final HttpServerRequest request){
        String idProgression = request.getParam("idProgression");

        String idSession = request.getParam("idSession");
        progressionService.progressionToSession( idProgression,idSession, DefaultResponseHandler.arrayResponseHandler(request));

    }

}


