package fr.openent.diary.controllers;

import fr.openent.diary.services.DiaryService;
import fr.openent.diary.services.HomeworkService;
import fr.openent.diary.services.LessonService;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.http.BaseController;
import fr.wseduc.webutils.request.RequestUtils;
import org.entcore.common.http.filter.ResourceFilter;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.notEmptyResponseHandler;

/**
 * Created by a457593 on 18/02/2016.
 */
public class DiaryController extends BaseController{

    //TODO is this the best place to declare that variable?
    public static final String DATABASE_SCHEMA = "diary";
    private final static Logger log = LoggerFactory.getLogger("DiaryController");

    DiaryService diaryService;
    LessonService lessonService;
    HomeworkService homeworkService;

    public DiaryController(DiaryService diaryService, LessonService lessonService, HomeworkService homeworkService) {
        this.diaryService = diaryService;
        this.homeworkService = homeworkService;
        this.lessonService = lessonService;
    }

	@Get("")
	@SecuredAction("diary.view")
	public void view(final HttpServerRequest request) {
		renderView(request);
	}

    @Get("/subject/list/:schoolId")
    @ApiDoc("Get all subjects for a school")
    public void listSubjects(final HttpServerRequest request) {
        final String schoolId = request.params().get("schoolId");
        diaryService.listSubjects(schoolId, arrayResponseHandler(request));
    }

    @Get("/audience/list/:schoolId")
    @ApiDoc("Get all audiences for a school")
    public void listAudiences(final HttpServerRequest request) {
        final String schoolId = request.params().get("schoolId");
        diaryService.listAudiences(schoolId, arrayResponseHandler(request));
    }

}
