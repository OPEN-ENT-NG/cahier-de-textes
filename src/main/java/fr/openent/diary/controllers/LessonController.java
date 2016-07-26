package fr.openent.diary.controllers;

import fr.openent.diary.filters.LessonAccessFilter;
import fr.openent.diary.services.*;
import fr.openent.diary.utils.Audience;
import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.http.Renders;
import fr.wseduc.webutils.request.RequestUtils;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.entcore.common.utils.StringUtils;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.entcore.common.http.response.DefaultResponseHandler.*;

/**
 * Created by a457593 on 23/02/2016.
 */
public class LessonController extends ControllerHelper {

    private LessonService lessonService;
    private DiaryService diaryService;
    /**
     * Might be used to auto-create audiences on lesson create/update
     */
    private AudienceService audienceService;
    private SharedService sharedService;

    private List<String> actionsForAutomaticSharing;

    //Permissions
    private static final String view_resource = "diary.read";
    private static final String manage_resource = "diary.manager";
    private static final String publish_resource = "diary.publish";
    private static final String list_lessons = "diary.list.lessons";

    private static final String sharing_action_read = "fr-openent-diary-controllers-LessonController|getLesson";
    private static final String sharing_action_list = "fr-openent-diary-controllers-LessonController|listLessons";

    private final static Logger log = LoggerFactory.getLogger(LessonController.class);

    public LessonController(LessonService lessonService, DiaryService diaryService, AudienceService audienceSercice) {
        this.lessonService = lessonService;
        this.diaryService = diaryService;
        this.audienceService = audienceSercice;
        this.sharedService = new SharedServiceImpl(LessonController.class.getName());

        //init automatic sharing actionsForAutomaticSharing
        actionsForAutomaticSharing = new ArrayList<String>(Arrays.asList(sharing_action_read, sharing_action_list));
    }

    @Get("/lesson/:id")
    @ApiDoc("Get a lesson using its identifier")
    @SecuredAction(value = view_resource, type = ActionType.RESOURCE)
    @ResourceFilter(LessonAccessFilter.class)
    public void getLesson(final HttpServerRequest request) {
        final String lessonId = request.params().get("id");

        if (isValidLessonId(lessonId)) {
            UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
                @Override
                public void handle(final UserInfos user) {
                    if (user != null) {
                        lessonService.retrieveLesson(lessonId, notEmptyResponseHandler(request, 201));
                    } else {
                        log.debug("User not found in session.");
                        unauthorized(request, "No user found in session.");
                    }
                }
            });
        } else {
            badRequest(request,"Invalid lesson identifier.");
        }
    }


    @Get("/lesson/:etabIds/:startDate/:endDate/:classId")
    @ApiDoc("Get all lessons for etab")
    @SecuredAction(value = list_lessons, type = ActionType.AUTHENTICATED)
    public void listLessons(final HttpServerRequest request) {
        final String[] schoolIds = request.params().get("etabIds").split(":");
        final String startDate = request.params().get("startDate");
        final String endDate = request.params().get("endDate");
        final String classId = request.params().get("classId");

        log.debug("listLessons on schools : " + schoolIds);

        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(UserInfos user) {

                if(user != null){
                    // see UserInfoAdapterV1_0Json.java from entcore for user types
                    switch (user.getType()) {
                        case "Teacher":
                            lessonService.getAllLessonsForTeacher(Arrays.asList(schoolIds), user, startDate, endDate, arrayResponseHandler(request));
                            break;
                        case "Student":
                            lessonService.getAllLessonsForStudent(Arrays.asList(schoolIds), user.getClasses(), user, startDate, endDate, arrayResponseHandler(request));
                            break;
                        case "Relative":
                            List<String> childClasses = new ArrayList<>();
                            childClasses.add(classId);
                            lessonService.getAllLessonsForParent(Arrays.asList(schoolIds), childClasses, user, startDate, endDate, arrayResponseHandler(request));
                            break;
                        default:
                            lessonService.getAllLessonsForStudent(Arrays.asList(schoolIds), user.getClasses(), user, startDate, endDate, arrayResponseHandler(request));
                            break;
                    }

                } else {
                    unauthorized(request,"No user found in session.");
                }
            }
        });
    }

    @Post("/lesson")
    @ApiDoc("Create a lesson")
    @SecuredAction("diary.createLesson")
    public void createLesson(final HttpServerRequest request) {

        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if(user != null){
                    RequestUtils.bodyToJson(request, pathPrefix + "createLesson", new Handler<JsonObject>() {
                        @Override
                        public void handle(final JsonObject json) {
                            if(user.getStructures().contains(json.getString("school_id",""))){
                                final Audience audience = new Audience(json);
                                lessonService.createLesson(json, user.getUserId(), user.getUsername(), audience, new Handler<Either<String, JsonObject>>() {
                                    @Override
                                    public void handle(Either<String, JsonObject> event) {
                                        if (event.isRight()) {
                                            final JsonObject result = event.right().getValue();
                                            //create automatic sharing
                                            final String resourceId = String.valueOf(result.getLong("id"));

                                            if(!StringUtils.isEmpty(audience.getId())) {
                                                sharedService.shareResource(user.getUserId(), audience.getId(), resourceId, audience.isGroup(),
                                                        actionsForAutomaticSharing, new Handler<Either<String, JsonObject>>() {
                                                            @Override
                                                            public void handle(Either<String, JsonObject> event) {
                                                                if (event.isRight()) {
                                                                    Renders.renderJson(request, result);
                                                                } else {
                                                                    Renders.renderError(request);
                                                                }
                                                            }
                                                        });
                                            } else {
                                                log.error("Sharing Lesson has encountered a problem.");
                                                badRequest(request, "Sharing Lesson has encountered a problem.");
                                            }

                                        } else {
                                            log.error("Lesson could not be created.");
                                            leftToResponse(request, event.left());
                                        }
                                    }
                                });
                            } else {
                                log.warn("Invalid school identifier.");
                                badRequest(request,"Invalid school identifier.");
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

    /**
     * Publishes a lesson
     * @param request
     */
    @Post("/lesson/publish")
    @ApiDoc("Publishes a lesson")
    @SecuredAction(value = publish_resource, type = ActionType.RESOURCE)
    @ResourceFilter(LessonAccessFilter.class)
    public void publishLesson(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    RequestUtils.bodyToJson(request, pathPrefix + "lesson", new Handler<JsonObject>() {
                        @Override
                        public void handle(final JsonObject json) {
                            if(user.getStructures().contains(json.getString("school_id",""))){
                                String lessonId = String.valueOf(json.getInteger("lesson_id"));
                                if (isValidLessonId(lessonId)) {
                                    lessonService.publishLesson(lessonId, new Handler<Either<String, JsonObject>>() {
                                        @Override
                                        public void handle(Either<String, JsonObject> event) {
                                            if (event.isRight()) {
                                                request.response().setStatusCode(200).end();
                                            } else {
                                                leftToResponse(request, event.left());
                                            }
                                        }
                                    });
                                } else {
                                    badRequest(request, "Invalid lesson identifier.");
                                }
                            } else {
                                badRequest(request,"Invalid school identifier.");
                            }
                        }
                    });
                } else {
                    log.debug("User not found in session.");
                    unauthorized(request, "No user found in session.");
                }
            }
        });

    }

    //TODO : change action.type to resource + add filter
    @Post("/publishLessons")
    @ApiDoc("Publishes lessons")
    @SecuredAction(value = publish_resource, type = ActionType.AUTHENTICATED)
    public void publishLessons(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    RequestUtils.bodyToJson(request, pathPrefix + "publishLessons", new Handler<JsonObject>() {
                        public void handle(JsonObject data) {
                            final List<String> ids = data.getArray("ids").toList();

                            lessonService.publishLessons(ids, new Handler<Either<String, JsonObject>>() {
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

    //TODO : change action.type to resource + add filter
    @Post("/unPublishLessons")
    @ApiDoc("Unpublishes lessons")
    @SecuredAction(value = publish_resource, type = ActionType.AUTHENTICATED)
    public void unPublishLessons(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    RequestUtils.bodyToJson(request, pathPrefix + "unPublishLessons", new Handler<JsonObject>() {
                        public void handle(JsonObject data) {
                            final List<String> ids = data.getArray("ids").toList();

                            lessonService.unPublishLessons(ids, new Handler<Either<String, JsonObject>>() {
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

    @Put("/lesson/:id")
    @ApiDoc("Modify a lesson")
    @SecuredAction(value = manage_resource, type = ActionType.RESOURCE)
    @ResourceFilter(LessonAccessFilter.class)
    public void modifyLesson(final HttpServerRequest request) {

        final String lessonId = request.params().get("id");

        if (isValidLessonId(lessonId)) {
            UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
                @Override
                public void handle(final UserInfos user) {
                    if (user != null) {
                        RequestUtils.bodyToJson(request, pathPrefix + "updateLesson",  new Handler<JsonObject>() {
                            @Override
                            public void handle(final JsonObject json) {
                                final Audience newAudience = new Audience(json);

                                //old lesson for audience type and audience id
                                lessonService.retrieveLesson(lessonId, new Handler<Either<String, JsonObject>>() {
                                    @Override
                                    public void handle(Either<String, JsonObject> eOldLesson) {
                                        if (eOldLesson.isRight()) {
                                            final Audience oldAudience = new Audience(eOldLesson.right().getValue());
                                            // auto-create missing audiences if needeed
                                            audienceService.getOrCreateAudience(newAudience, new Handler<Either<String, JsonObject>>() {
                                                @Override
                                                public void handle(Either<String, JsonObject> event) {
                                                    if (event.isRight()) {
                                                        lessonService.updateLesson(lessonId, json, new Handler<Either<String, JsonObject>>() {
                                                            @Override
                                                            public void handle(Either<String, JsonObject> event) {
                                                                if (event.isRight()) {
                                                                    final JsonObject result = event.right().getValue();

                                                                    if(!StringUtils.isEmpty(newAudience.getId())) {
                                                                        sharedService.updateShareResource(oldAudience.getId(), newAudience.getId(), lessonId,
                                                                                oldAudience.isGroup(), newAudience.isGroup(), actionsForAutomaticSharing, new Handler<Either<String, JsonObject>>() {
                                                                                    @Override
                                                                                    public void handle(Either<String, JsonObject> event) {
                                                                                        if (event.isRight()) {
                                                                                            Renders.renderJson(request, result);
                                                                                        } else {
                                                                                            Renders.renderError(request);
                                                                                        }
                                                                                    }
                                                                                });
                                                                    } else {
                                                                        log.error("Sharing Lesson has encountered a problem.");
                                                                        badRequest(request, "Sharing Lesson has encountered a problem.");
                                                                    }
                                                                } else {
                                                                    log.error("Lesson could not be created.");
                                                                    leftToResponse(request, event.left());
                                                                }
                                                            }
                                                        });
                                                    } else {
                                                        leftToResponse(request, event.left());
                                                    }
                                                }
                                            });
                                        } else {
                                            leftToResponse(request, eOldLesson.left());
                                        }
                                    }
                                });
                            }
                        });
                    } else {
                        log.debug("User not found in session.");
                        unauthorized(request, "No user found in session.");
                    }
                }
            });
        }else {
            badRequest(request,"Invalid lesson identifier.");
        }
    }


    @Delete("/lesson/:id")
    @ApiDoc("Delete a lesson")
    @SecuredAction(value = manage_resource, type = ActionType.RESOURCE)
    @ResourceFilter(LessonAccessFilter.class)
    public void deleteLesson(final HttpServerRequest request) {

        final String lessonId = request.params().get("id");

        if (isValidLessonId(lessonId)) {
            UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
                @Override
                public void handle(final UserInfos user) {
                    if (user != null) {
                        //Drop cascading, nothing to do for automatic share
                        lessonService.deleteLesson(lessonId, notEmptyResponseHandler(request, 201));
                    } else {
                        if (log.isDebugEnabled()) {
                            log.debug("User not found in session.");
                        }
                        unauthorized(request, "No user found in session.");
                    }
                }
            });
        } else {
            badRequest(request,"Invalid lesson identifier.");
        }
    }

    //TODO : change action.type to resource + add filter
    @Delete("/deleteLessons")
    @SecuredAction(value = manage_resource, type = ActionType.AUTHENTICATED)
    public void deletes(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    RequestUtils.bodyToJson(request, pathPrefix + "deleteLessons", new Handler<JsonObject>() {
                        public void handle(JsonObject data) {
                            final List<String> ids = data.getArray("ids").toList();

                            lessonService.deleteLessons(ids, notEmptyResponseHandler(request, 201));
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

    @Get("/lesson/share/json/:id")
    @ApiDoc("List rights for a given resource")
    @SecuredAction(value = manage_resource, type = ActionType.RESOURCE)
    @ResourceFilter(LessonAccessFilter.class)
    public void share(final HttpServerRequest request) {
        super.shareJson(request, false);
    }

    @Put("/lesson/share/json/:id")
    @ApiDoc("Add rights for a given resource")
    @SecuredAction(value = manage_resource, type = ActionType.RESOURCE)
    @ResourceFilter(LessonAccessFilter.class)
    public void shareSubmit(final HttpServerRequest request) {
        super.shareJsonSubmit(request, null, false);
    }

    @Put("/lesson/share/remove/:id")
    @ApiDoc("Remove rights for a given resource")
    @SecuredAction(value = manage_resource, type = ActionType.RESOURCE)
    @ResourceFilter(LessonAccessFilter.class)
    public void shareRemove(final HttpServerRequest request) {
        super.removeShare(request, false);
    }

    /**
     * Controls that the lessonId is a not null number entry.
     */
    private boolean isValidLessonId(String lessonId) {
        return lessonId != null && lessonId.matches("\\d+");
    }
}
