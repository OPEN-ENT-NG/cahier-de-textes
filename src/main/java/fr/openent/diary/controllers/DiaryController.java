package fr.openent.diary.controllers;

import fr.openent.diary.services.DiaryService;
import fr.openent.diary.services.HomeworkService;
import fr.openent.diary.services.LessonService;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.http.BaseController;
import org.entcore.common.http.filter.ResourceFilter;
import org.vertx.java.core.http.HttpServerRequest;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;

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


    @Get("/:idTeacher/:idSchool")
    @ApiDoc("Get all the lessons for a teacher and a school")
//    @SecuredAction(value = "diary.manager", type= ActionType.RESOURCE)
//    @ResourceFilter(OwnerOrLocalAdmin.class)
    public void showLessons(final HttpServerRequest request) {
        final String idTeacher = request.params().get("idTeacher");
        final String idSchool = request.params().get("idSchool");
//        lessonService.getAllLessonsForTeacher(idTeacher, idSchool, arrayResponseHandler(request));
    }

}
