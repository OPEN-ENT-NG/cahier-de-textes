package fr.openent.diary.controllers;

import fr.openent.diary.services.DiaryService;
import fr.openent.diary.services.HomeworkService;
import fr.openent.diary.services.LessonService;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.http.BaseController;
import fr.wseduc.webutils.request.RequestUtils;
import org.entcore.common.http.filter.ResourceFilter;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonObject;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.notEmptyResponseHandler;

/**
 * Created by a457593 on 18/02/2016.
 */
public class DiaryController extends BaseController{

    //TODO is this the best place to declare that variable?
    public static final String DATABASE_SCHEMA = "diary";

    DiaryService diaryService;
    LessonService lessonService;
    HomeworkService homeworkService;

    public DiaryController(DiaryService diaryService, LessonService lessonService, HomeworkService homeworkService) {
        this.diaryService = diaryService;
        this.homeworkService = homeworkService;
        this.lessonService = lessonService;
    }

    /**
     * Creates a teacher if it does not exist.
     * @param teacherId
     * @param request
     */
//    public void createNewTeacher(final String teacherId, final HttpServerRequest request) {
//        diaryService.retrieveTeacher(teacherId, new Handler<Either<String, JsonObject>>() {
//            @Override
//            public void handle(Either<String, JsonObject> event) {
//                if (event.isRight()) {
//                    RequestUtils.bodyToJson(request, pathPrefix + "createTeacher", new Handler<JsonObject>() {
//                        @Override
//                        public void handle(JsonObject json) {
//                            diaryService.createTeacher(json, notEmptyResponseHandler(request, 201));
//                        }
//                    });
//                } else {
//                    badRequest(request, "Teacher identifier is unknown.");
//                }
//            }
//        });
//    }

}
