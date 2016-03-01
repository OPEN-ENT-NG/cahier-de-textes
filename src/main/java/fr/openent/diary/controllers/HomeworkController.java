package fr.openent.diary.controllers;

import fr.openent.diary.services.HomeworkService;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.http.BaseController;
import org.entcore.common.http.filter.ResourceFilter;
import org.vertx.java.core.http.HttpServerRequest;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;

/**
 * Created by a457593 on 23/02/2016.
 */
public class HomeworkController extends BaseController {

    HomeworkService homeworkService;

    @Get("/")
    @ApiDoc("Get all homework")
    @SecuredAction(value = "diary.manager", type= ActionType.RESOURCE)
    public void listHomework(final HttpServerRequest request) {
        final String idTeacher = request.params().get("idTeacher");
        final String idSchool = request.params().get("idSchool");

        //TODO for students what about visibility of free homeworks?
    }

}
