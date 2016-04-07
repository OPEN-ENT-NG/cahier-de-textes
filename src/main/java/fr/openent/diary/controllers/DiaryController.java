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
import org.entcore.common.http.response.DefaultResponseHandler;
import org.entcore.common.neo4j.Neo;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.Handler;
import org.vertx.java.core.Vertx;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.http.RouteMatcher;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;
import org.vertx.java.platform.Container;

import java.util.Map;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.notEmptyResponseHandler;

/**
 * Created by a457593 on 18/02/2016.
 */
public class DiaryController extends BaseController{

    //TODO is this the best place to declare that variable?
    public static final String DATABASE_SCHEMA = "diary";
    private final static Logger log = LoggerFactory.getLogger(DiaryController.class);

    private Neo neo;

    DiaryService diaryService;
    LessonService lessonService;
    HomeworkService homeworkService;

    public DiaryController(DiaryService diaryService, LessonService lessonService, HomeworkService homeworkService) {
        this.diaryService = diaryService;
        this.homeworkService = homeworkService;
        this.lessonService = lessonService;
    }

    @Override
    public void init(Vertx vertx, Container container, RouteMatcher rm,
                     Map<String, fr.wseduc.webutils.security.SecuredAction> securedActions) {
        super.init(vertx, container, rm, securedActions);
        this.neo = new Neo(vertx, eb, log);
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

    @Post("/teacher/:schoolId")
    @ApiDoc("Get or create a teacher for a school")
    public void getOrCreateTeacher(final HttpServerRequest request) {
        final String schoolId = request.params().get("schoolId");
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if(user != null){
                    if(user.getStructures().contains(schoolId)){
                        diaryService.getOrCreateTeacher(user.getUserId(), user.getUsername(), new Handler<Either<String, JsonObject>>() {
                            @Override
                            public void handle(Either<String, JsonObject> event) {
                                if (event.isRight()) {
                                    //return 201 if teacher is created, 200 if it was retrieved
                                    if (Boolean.TRUE.equals(event.right().getValue().getBoolean("teacherFound"))) {
                                        DefaultResponseHandler.defaultResponseHandler(request);
                                    } else {
                                        DefaultResponseHandler.defaultResponseHandler(request, 201);
                                    }
                                } else {
                                    DefaultResponseHandler.leftToResponse(request, event.left());
                                }
                            }
                        });
                    } else {
                        badRequest(request,"Invalid school identifier.");
                    }
                } else {
                    unauthorized(request, "No user found in session.");
                }
            }
        });
    }

    @Post("/subjects/:schoolId/:teacherId")
    public void initTeacherSubjects(final HttpServerRequest request) {
        final String schoolId = request.params().get("schoolId");
        final String teacherId = request.params().get("teacherId");
    }
}
