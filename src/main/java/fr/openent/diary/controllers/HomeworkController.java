package fr.openent.diary.controllers;

import fr.openent.diary.filters.HomeworkAccessFilter;
import fr.openent.diary.services.HomeworkService;
import fr.openent.diary.services.LessonService;
import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.request.RequestUtils;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.leftToResponse;
import static org.entcore.common.http.response.DefaultResponseHandler.notEmptyResponseHandler;

/**
 * Created by a457593 on 23/02/2016.
 */
public class HomeworkController extends SharedResourceController {

    HomeworkService homeworkService;
    LessonService lessonService;

    List<String> actionsForAutomaticSharing;

    //Permissions
    private static final String view_resource = "diary.read";
    private static final String manage_resource = "diary.manager";
    private static final String publish_resource = "diary.publish";
    private static final String list_homeworks = "diary.list.homeworks";
    private static final String list_homeworks_by_lesson = "diary.list.homeworks.lesson";


    private static final String sharing_action_read = "fr.openent.diary.controllers.HomeworkController|getHomework";
    private static final String sharing_action_list = "fr.openent.diary.controllers.HomeworkController|listHomeworks";
    private static final String sharing_action_list_by_lesson = "fr.openent.diary.controllers.HomeworkController|listHomeworkByLesson";

    private final static Logger log = LoggerFactory.getLogger(HomeworkController.class);

    public HomeworkController(HomeworkService homeworkService, LessonService lessonService) {
        this.homeworkService = homeworkService;
        this.lessonService = lessonService;

        //init automatic sharing actionsForAutomaticSharing
        actionsForAutomaticSharing = new ArrayList<String>();
        actionsForAutomaticSharing.add(sharing_action_read);
        actionsForAutomaticSharing.add(sharing_action_list);
        actionsForAutomaticSharing.add(sharing_action_list_by_lesson);
    }

    @Get("/homework/:id")
    @ApiDoc("Get a homework using its identifier")
    @SecuredAction(value = view_resource, type = ActionType.RESOURCE)
    @ResourceFilter(HomeworkAccessFilter.class)
    public void getHomework(final HttpServerRequest request) {
        final String homeworkId = request.params().get("id");

        if (isValidHomeworkId(homeworkId)) {
            UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
                @Override
                public void handle(final UserInfos user) {
                    if (user != null) {
                        homeworkService.retrieveHomework(homeworkId, notEmptyResponseHandler(request, 201));
                    } else {
                        log.debug("User not found in session.");
                        unauthorized(request, "No user found in session.");
                    }
                }
            });
        } else {
            badRequest(request,"Invalid homework identifier.");
        }
    }

    @Get("/homework/list/:lessonId")
    @ApiDoc("Get all homeworks for a lesson")
    @SecuredAction(value = list_homeworks_by_lesson, type = ActionType.AUTHENTICATED)
    public void listHomeworkByLesson(final HttpServerRequest request) {
        final String lessonId = request.params().get("lessonId");

        //TODO for students what about visibility of free homeworks? depending on due date and current date
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(UserInfos user) {
                if(user != null){
                    homeworkService.getAllHomeworksForALesson(lessonId, arrayResponseHandler(request));
                } else {
                    unauthorized(request,"No user found in session.");
                }
            }
        });
    }

    @Get("/homework/:etabId/:startDate/:endDate")
    @ApiDoc("Get all homeworks for a school")
    @SecuredAction(value = list_homeworks, type = ActionType.AUTHENTICATED)
    public void listHomeworks(final HttpServerRequest request) {
        final String idSchool = request.params().get("etabId");
        final String startDate = request.params().get("startDate");
        final String endDate = request.params().get("endDate");

        log.debug("listHomeworks on school : " + idSchool);

        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(UserInfos user) {

                if(user != null){
                    if("Teacher".equals(user.getType())){
                        homeworkService.getAllHomeworksForTeacher(idSchool, user.getUserId(), startDate, endDate, arrayResponseHandler(request));
                    } else { //if student
                        homeworkService.getAllHomeworksForStudent(idSchool, user.getGroupsIds(), startDate, endDate, arrayResponseHandler(request));
                    } //TODO manage more type of users?

                } else {
                    unauthorized(request,"No user found in session.");
                }
            }
        });
    }

    @Post("/homework")
    @ApiDoc("Create a homework")
    @SecuredAction(manage_resource)
    public void createFreeHomework(final HttpServerRequest request) {

        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if(user != null){
                    RequestUtils.bodyToJson(request, pathPrefix + "createHomework", new Handler<JsonObject>() {
                        @Override
                        public void handle(JsonObject json) {
                        if(user.getStructures().contains(json.getString("school_id",""))){
                            homeworkService.createHomework(json, user.getUserId(), user.getUsername(), notEmptyResponseHandler(request, 201));
                        } else {
                            badRequest(request,"Invalid school identifier.");
                        }
                        }
                    });
                } else {
                    unauthorized(request, "No user found in session.");
                }
            }
        });
    }

    @Post("/homework/:lessonId")
    @ApiDoc("Create a homework for a lesson")
    @SecuredAction(manage_resource)
    public void createHomeworkForLesson(final HttpServerRequest request) {
        final String lessonId = request.params().get("lessonId");

        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if(user != null) {
                    lessonService.retrieveLesson(lessonId, new Handler<Either<String, JsonObject>> () {
                        @Override
                        public void handle(Either<String, JsonObject> event) {
                        if (event.isRight()) {
                            RequestUtils.bodyToJson(request, pathPrefix + "createHomework", new Handler<JsonObject>() {
                                @Override
                                public void handle(JsonObject json) {
                                if(user.getStructures().contains(json.getString("school_id",""))){
                                    homeworkService.createHomework(json, user.getUserId(), user.getUsername(), notEmptyResponseHandler(request, 201));
                                } else {
                                    badRequest(request,"Invalid school identifier.");
                                }
                                }
                            });
                        } else {
                            badRequest(request, "Lesson identifier is unknown.");
                        }
                        }
                    });
                } else {
                    unauthorized(request, "No user found in session.");
                }
            }
        });
    }

    @Put("/homework/:homeworkId")
    @ApiDoc("Modify a homework")
    @SecuredAction(value = manage_resource, type = ActionType.RESOURCE)
    @ResourceFilter(HomeworkAccessFilter.class)
    public void modifyHomework(final HttpServerRequest request) {

        final String homeworkId = request.params().get("homeworkId");

        if (isValidHomeworkId(homeworkId)) {
            UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
                @Override
                public void handle(final UserInfos user) {
                    if (user != null) {
                        RequestUtils.bodyToJson(request, pathPrefix + "updateHomework",  new Handler<JsonObject>() {
                            @Override
                            public void handle(JsonObject json) {
                                homeworkService.updateHomework(homeworkId, json, notEmptyResponseHandler(request, 201));
                            }
                        });
                    } else {
                        log.debug("User not found in session.");
                        unauthorized(request, "No user found in session.");
                    }
                }
            });
        }else {
            badRequest(request,"Invalid homework identifier.");
        }
    }

    @Delete("/homework/:id")
    @ApiDoc("Delete a homework")
    @SecuredAction(value = manage_resource, type = ActionType.RESOURCE)
    @ResourceFilter(HomeworkAccessFilter.class)
    public void deleteHomework(final HttpServerRequest request) {

        final String homeworkId = request.params().get("id");

        if (isValidHomeworkId(homeworkId)) {
            UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
                @Override
                public void handle(final UserInfos user) {
                    if (user != null) {
                        homeworkService.deleteHomework(homeworkId, notEmptyResponseHandler(request, 201));
                    } else {
                        log.debug("User not found in session.");
                        unauthorized(request, "No user found in session.");
                    }
                }
            });
        } else {
            badRequest(request,"Invalid homework identifier.");
        }
    }

    @Post("/unPublishHomeworks")
    @ApiDoc("Unpublishes homeworks")
    @SecuredAction(value = publish_resource, type = ActionType.RESOURCE)
    public void unPublishHomeworks(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    RequestUtils.bodyToJson(request, pathPrefix + "unPublishHomeworks", new Handler<JsonObject>() {
                        public void handle(JsonObject data) {
                            final List<Integer> ids = data.getArray("ids").toList();

                            homeworkService.unPublishHomeworks(ids, new Handler<Either<String, JsonObject>>() {
                                @Override
                                public void handle(Either<String, JsonObject> event) {
                                    if (event.isRight()) {
                                        request.response().setStatusCode(200).end();
                                    } else {
                                        leftToResponse(request, event.left());
                                    }
                                }
                            });
                        }
                    });
                } else {
                    if (log.isDebugEnabled()) {
                        log.debug("User not found in session.");
                    }
                    unauthorized(request, "No user found in session.");
                }
            }
        });
    }

    @Post("/publishHomeworks")
    @ApiDoc("Publishes homeworks")
    @SecuredAction(value = publish_resource, type = ActionType.RESOURCE)
    public void publishHomeworks(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    RequestUtils.bodyToJson(request, pathPrefix + "publishHomeworks", new Handler<JsonObject>() {
                        public void handle(JsonObject data) {
                            final List<Integer> ids = data.getArray("ids").toList();

                            homeworkService.publishHomeworks(ids, new Handler<Either<String, JsonObject>>() {
                                @Override
                                public void handle(Either<String, JsonObject> event) {
                                    if (event.isRight()) {
                                        request.response().setStatusCode(200).end();
                                    } else {
                                        leftToResponse(request, event.left());
                                    }
                                }
                            });
                        }
                    });
                } else {
                    if (log.isDebugEnabled()) {
                        log.debug("User not found in session.");
                    }
                    unauthorized(request, "No user found in session.");
                }
            }
        });
    }

    @Get("/homework/share/json/:id")
    @ApiDoc("List rights for a given resource")
    @SecuredAction(value = manage_resource, type = ActionType.RESOURCE)
    @ResourceFilter(HomeworkAccessFilter.class)
    public void share(final HttpServerRequest request) {
        super.shareJson(request, false);
    }

    @Put("/homework/share/json/:id")
    @ApiDoc("Add rights for a given resource")
    @SecuredAction(value = manage_resource, type = ActionType.RESOURCE)
    @ResourceFilter(HomeworkAccessFilter.class)
    public void shareSubmit(final HttpServerRequest request) {
        super.shareJsonSubmit(request, null, false);
    }

    @Put("/homework/share/remove/:id")
    @ApiDoc("Remove rights for a given resource")
    @SecuredAction(value = manage_resource, type = ActionType.RESOURCE)
    @ResourceFilter(HomeworkAccessFilter.class)
    public void shareRemove(final HttpServerRequest request) {
        super.removeShare(request, false);
    }

    /**
     * Controls that the homeworkId is a not null number entry.
     */
    private boolean isValidHomeworkId(String homeworkId) {
        return homeworkId != null && homeworkId.matches("\\d+");
    }

    @Delete("/deleteHomeworks")
    @SecuredAction(value = manage_resource, type = ActionType.RESOURCE)
    public void deletes(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    RequestUtils.bodyToJson(request, pathPrefix + "deleteHomeworks", new Handler<JsonObject>() {
                        public void handle(JsonObject data) {
                            final List<String> ids = data.getArray("ids").toList();

                            homeworkService.deleteHomeworks(ids, notEmptyResponseHandler(request, 201));
                        }
                    });
                } else {
                    if (log.isDebugEnabled()) {
                        log.debug("User not found in session.");
                    }
                    unauthorized(request, "No user found in session.");
                }
            }
        });
    }

    protected List<String> getActionsForAutomaticSharing() {
        return this.actionsForAutomaticSharing;
    }
}
