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
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.http.HttpServerRequest;
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

        String ownerId = request.getParam("owner");

        progressionService.getProgressions( ownerId, DefaultResponseHandler.arrayResponseHandler(request));
    }


    @Delete("/progression/:progressionID")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(SessionManage.class)
    public void deleteProgressions(final HttpServerRequest request) {

        String ownerId = request.getParam("owner");

        progressionService.deleteProgressions( ownerId, DefaultResponseHandler.arrayResponseHandler(request));
    }


    @Get("/progression/:ownerId")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(SessionManage.class)
    public void updateProgressions(final HttpServerRequest request) {

        String ownerId = request.getParam("owner");

        progressionService.updateProgressions( ownerId, DefaultResponseHandler.arrayResponseHandler(request));
    }


}


