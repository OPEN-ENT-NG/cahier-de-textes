package fr.openent.diary.controllers;

import fr.openent.diary.filters.LessonAccessFilter;
import fr.openent.diary.services.AudienceService;
import fr.openent.diary.services.DiaryService;
import fr.openent.diary.services.LessonService;
import fr.openent.diary.utils.Audience;
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
import java.util.Arrays;
import java.util.List;

import static org.entcore.common.http.response.DefaultResponseHandler.*;

/**
 * Created by a457593 on 23/02/2016.
 */
public class LessonController extends SharedResourceController {

    LessonService lessonService;
    DiaryService diaryService;
    /**
     * Might be used to auto-create audiences on lesson create/update
     */
    AudienceService audienceService;

    List<String> actionsForAutomaticSharing;

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

        //init automatic sharing actionsForAutomaticSharing
        actionsForAutomaticSharing = new ArrayList<String>();
        actionsForAutomaticSharing.add(sharing_action_read);
        actionsForAutomaticSharing.add(sharing_action_list);
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


    @Get("/lesson/:etabIds/:startDate/:endDate")
    @ApiDoc("Get all lessons for etab")
    @SecuredAction(value = list_lessons, type = ActionType.AUTHENTICATED)
    public void listLessons(final HttpServerRequest request) {
        final String[] schoolIds = request.params().get("etabIds").split(":");
        final String startDate = request.params().get("startDate");
        final String endDate = request.params().get("endDate");

        log.debug("listLessons on schools : " + schoolIds);

        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(UserInfos user) {

                if(user != null){
                    if("Teacher".equals(user.getType())){
                        lessonService.getAllLessonsForTeacher(Arrays.asList(schoolIds), user.getUserId(), startDate, endDate, arrayResponseHandler(request));
                    } else { //if student
                        lessonService.getAllLessonsForStudent(Arrays.asList(schoolIds), user.getGroupsIds(), startDate, endDate, arrayResponseHandler(request));
                    } //TODO manage more type of users?

                } else {
                    unauthorized(request,"No user found in session.");
                }
            }
        });
    }

    @Post("/lesson")
    @ApiDoc("Create a lesson")
    @SecuredAction(manage_resource)
    public void createLesson(final HttpServerRequest request) {

        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if(user != null){
                    RequestUtils.bodyToJson(request, pathPrefix + "createLesson", new Handler<JsonObject>() {
                        @Override
                        public void handle(final JsonObject json) {
                            if(user.getStructures().contains(json.getString("school_id",""))){
                                lessonService.createLesson(json, user.getUserId(), user.getUsername(), new Audience(json), notEmptyResponseHandler(request, 201));
                                // TODO uncomment when operational
                                /*
                                lessonService.createLesson(json, user.getUserId(), user.getUsername(), new Audience(json), new Handler<Either<String, JsonObject>>() {
                                    @Override
                                    public void handle(Either<String, JsonObject> event) {

                                        if (event.isRight()) {
                                            notEmptyResponseHandler(request, 201);
                                            request.response().setStatusCode(201).end();
                                            // disabled until working

                                            //create automatic sharing
                                            String resourceId = String.valueOf(event.right().getValue().getLong("id"));

                                            // Groups and users
                                            final List<String> groupsAndUserIds = new ArrayList<>();
                                            //875-1464101573455 TPS teachers
                                            groupsAndUserIds.add("875-1464101573455");
//                                            if (user.getGroupsIds() != null) {
//                                                groupsAndUserIds.addAll(user.getGroupsIds());
//                                            }

                                            if(groupsAndUserIds != null && groupsAndUserIds.size() != 0) {
                                                LessonController.this.shareResource(user.getUserId(), groupsAndUserIds, resourceId, getActionsForAutomaticSharing() , notEmptyResponseHandler(request, 201));
                                            } else {
                                                log.warn("Sharing Lesson has encountered a problem.");
                                                badRequest(request, "Sharing Lesson has encountered a problem.");
                                            }

                                        } else {
                                            log.warn("Lesson could not be created.");
                                            badRequest(request,"Lesson could not be created.");
                                        }
                                    }
                                });*/
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
                                // auto-create missing audiences if needeed
                                audienceService.getOrCreateAudience(new Audience(json), new Handler<Either<String, JsonObject>>() {
                                    @Override
                                    public void handle(Either<String, JsonObject> event) {
                                        if (event.isRight()) {
                                            lessonService.updateLesson(lessonId, json, notEmptyResponseHandler(request, 201));
                                        } else {
                                            leftToResponse(request, event.left());
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

    protected List<String> getActionsForAutomaticSharing() {
        return this.actionsForAutomaticSharing;
    }
}
