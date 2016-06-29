package fr.openent.diary.controllers;

import fr.openent.diary.services.DiaryService;
import fr.openent.diary.services.HomeworkService;
import fr.openent.diary.services.LessonService;
import fr.openent.diary.utils.CriteriaSearchType;
import fr.openent.diary.utils.SearchCriterion;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.http.BaseController;
import fr.wseduc.webutils.http.Renders;
import fr.wseduc.webutils.request.RequestUtils;
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

import java.util.*;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;

/**
 * Created by a457593 on 18/02/2016.
 */
public class DiaryController extends BaseController {

    //TODO is this the best place to declare that variable? NO if services can act as standalone...
    public static final String DATABASE_SCHEMA = "diary";
    private final static Logger log = LoggerFactory.getLogger(DiaryController.class);

    private Neo neo;

    DiaryService diaryService;
    LessonService lessonService;
    HomeworkService homeworkService;

    private static final String view = "diary.view";
    private static final String list_subjects = "diary.list.subjects";
    private static final String list_audiences = "diary.list.audiences";
    private static final String teacher_create = "diary.teacher.create";
    private static final String teacher_subjects = "diary.teacher.subjects";

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
    @SecuredAction(value = view, type = ActionType.WORKFLOW)
    public void view(final HttpServerRequest request) {
        renderView(request);
    }

    @Get("/subject/list/:schoolIds")
    @ApiDoc("Get all subjects for a school")
    @SecuredAction(value = list_subjects, type = ActionType.AUTHENTICATED)
    public void listSubjects(final HttpServerRequest request) {
        final String[] schoolIds = request.params().get("schoolIds").split(":");
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
                    @Override
                    public void handle(final UserInfos user) {
                        if (user != null) {
                            if ("Teacher".equals(user.getType())) {
                                diaryService.listSubjects(Arrays.asList(schoolIds), user.getUserId(), arrayResponseHandler(request));
                            } else {
                                diaryService.listSubjects(Arrays.asList(schoolIds), null, arrayResponseHandler(request));
                            }
                        } else {
                            badRequest(request, "diary.invalid.login");
                        }
                    }
                }
        );
    }

    @Get("/audience/list/:schoolId")
    @ApiDoc("Get all audiences for a school")
    @SecuredAction(value = list_audiences, type = ActionType.AUTHENTICATED)
    public void listAudiences(final HttpServerRequest request) {
        final String schoolId = request.params().get("schoolId");
        diaryService.listAudiences(schoolId, arrayResponseHandler(request));
    }

    @Post("/teacher/:schoolId")
    @ApiDoc("Get or create a teacher for a school")
    @SecuredAction(value = teacher_create, type = ActionType.AUTHENTICATED)
    public void getOrCreateTeacher(final HttpServerRequest request) {
        final String schoolId = request.params().get("schoolId");
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    if ("Teacher".equals(user.getType())) {
                        if (user.getStructures().contains(schoolId)) {
                            diaryService.getOrCreateTeacher(user.getUserId(), user.getUsername(), new Handler<Either<String, JsonObject>>() {
                                @Override
                                public void handle(Either<String, JsonObject> event) {
                                    if (event.isRight()) {
                                        //return 201 if teacher is created, 200 if it was retrieved
                                        if (!Boolean.TRUE.equals(event.right().getValue().getBoolean("teacherFound"))) {
                                            request.response().setStatusCode(200).end();
                                        } else {
                                            created(request);
                                        }
                                    } else {
                                        DefaultResponseHandler.leftToResponse(request, event.left());
                                    }
                                }
                            });
                        } else {
                            badRequest(request, "Invalid school identifier.");
                        }
                    } else {
                        badRequest(request, "User is not a teacher");
                    }
                } else {
                    unauthorized(request, "No user found in session.");
                }
            }
        });
    }

    @Post("/subjects/:schoolId/:teacherId")
    @SecuredAction(value = teacher_subjects, type = ActionType.AUTHENTICATED)
    public void initTeacherSubjects(final HttpServerRequest request) {
        final String schoolId = request.params().get("schoolId");
        final String teacherId = request.params().get("teacherId");
    }

    @Post("/pedagogicItems/list")
    @ApiDoc("Get all audiences for a school")
    @SecuredAction(value = list_audiences, type = ActionType.AUTHENTICATED)
    public void searchForPedagogicItems(final HttpServerRequest request) {

        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {

                    RequestUtils.bodyToJson(request, pathPrefix + "searchPedagogicItems", new Handler<JsonObject>() {
                        @Override
                        public void handle(final JsonObject json) {

                            if (json != null) {

                                final List<SearchCriterion> criteria = new ArrayList<SearchCriterion>();
                                Set<Map.Entry<String, Object>> entries = json.toMap().entrySet();
                                for (Map.Entry<String, Object> entry: entries) {
                                    SearchCriterion criterion = SearchCriterion.convertParameterToSearchCriterion(entry);
                                    if (criterion != null) {
                                        criteria.add(criterion);
                                    }
                                }

                                UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
                                    @Override
                                    public void handle(final UserInfos user) {
                                        if (user != null) {

                                            List<String> groups = null;
                                            if("Teacher".equals(user.getType())){
                                                SearchCriterion teacherId = new SearchCriterion();
                                                teacherId.setValue(user.getUserId());
                                                teacherId.setType(CriteriaSearchType.TEACHER);
                                                criteria.add(teacherId);
                                            } else {
                                                groups = user.getClasses();
                                            }

                                            diaryService.listPedagogicItems(criteria, groups, arrayResponseHandler(request));
                                        } else {
                                            unauthorized(request, "No user found in session.");
                                        }
                                    }
                                });
                            } else {
                                log.warn("No json search parameters given.");
                                badRequest(request, "Wrong parameters.");
                            }
                        }
                    });
                } else {
                    log.warn("No user found in session.");
                    unauthorized(request, "No user found in session.");
                }
            }
        });
    }
}
