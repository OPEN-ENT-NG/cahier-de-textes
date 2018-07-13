package fr.openent.diary.controllers;

import fr.openent.diary.model.GenericHandlerResponse;
import fr.openent.diary.model.HandlerResponse;
import fr.openent.diary.model.progression.LessonProgression;
import fr.openent.diary.model.progression.OrderLesson;
import fr.openent.diary.model.progression.Progression;
import fr.openent.diary.services.ProgressionServiceImpl;
import fr.openent.diary.services.StudentService;
import fr.openent.diary.services.StudentServiceImpl;
import fr.openent.diary.utils.SqlMapper;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Delete;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;

import java.util.List;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;

public class StudentController extends ControllerHelper {
    private StudentService studentService;

    StudentController(){
        studentService = new StudentServiceImpl();
    }

    @Get("/student/children")
    @SecuredAction(value = "", type = ActionType.AUTHENTICATED)
    @ApiDoc("Return information needs by relative profiles")
    public void getChildren(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(UserInfos user) {
                studentService.getChildren(user, arrayResponseHandler(request));
            }
        });
    }
}
