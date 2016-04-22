package fr.openent.diary.controllers;

import fr.openent.diary.services.AudienceService;
import fr.openent.diary.services.DiaryService;
import fr.openent.diary.services.LessonService;
import fr.openent.diary.utils.Audience;
import fr.wseduc.rs.*;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.http.BaseController;
import fr.wseduc.webutils.request.RequestUtils;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.leftToResponse;
import static org.entcore.common.http.response.DefaultResponseHandler.notEmptyResponseHandler;

/**
 * Created by a457593 on 23/02/2016.
 */
public class LessonController extends BaseController {

    LessonService lessonService;
    DiaryService diaryService;
    /**
     * Might be used to auto-create audiences on lesson create/update
     */
    AudienceService audienceService;

    private final static Logger log = LoggerFactory.getLogger(LessonController.class);

    public LessonController(LessonService lessonService, DiaryService diaryService, AudienceService audienceSercice) {
        this.lessonService = lessonService;
        this.diaryService = diaryService;
        this.audienceService = audienceSercice;
    }

    @Get("/lesson/:id")
    @ApiDoc("Get a lesson using its identifier")
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


    @Get("/lesson/:etabId/:startDate/:endDate")
    @ApiDoc("Get all lessons for etab")
    public void listLessons(final HttpServerRequest request) {
        final String idSchool = request.params().get("etabId");
        final String startDate = request.params().get("startDate");
        final String endDate = request.params().get("endDate");

        log.debug("listLessons on school : " + idSchool);

        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(UserInfos user) {

                if(user != null){
                    if("Teacher".equals(user.getType())){
                        lessonService.getAllLessonsForTeacher(idSchool, user.getUserId(), startDate, endDate, arrayResponseHandler(request));
                    } else { //if student
                        lessonService.getAllLessonsForStudent(idSchool, user.getGroupsIds(), startDate, endDate, arrayResponseHandler(request));
                    } //TODO manage more type of users?

                } else {
                    unauthorized(request,"No user found in session.");
                }
            }
        });
    }

    @Post("/lesson")
    @ApiDoc("Create a lesson")
//    @SecuredAction("diary.lesson.create")
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

    /**
     * Publishes a lesson
     * @param request
     */
    @Put("/lesson/publish/:id")
    @ApiDoc("Publishes a lesson")
    public void publishLesson(final HttpServerRequest request) {

        final String lessonId = request.params().get("id");

        if (isValidLessonId(lessonId)) {
            UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
                @Override
                public void handle(final UserInfos user) {
                    if (user != null) {
                        lessonService.publishLesson(lessonId, new Handler<Either<String, JsonObject>>() {
                            @Override
                            public void handle(Either<String, JsonObject> event) {
                                if (event.isRight()) {

                                } else {
                                    leftToResponse(request, event.left());
                                }
                            }
                        });
                    } else {
                        log.debug("User not found in session.");
                        unauthorized(request, "No user found in session.");
                    }
                }
            });
        } else {
            badRequest(request, "Invalid lesson identifier.");
        }
    }

    @Put("/lesson/:id")
    @ApiDoc("Modify a lesson")
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
    public void deleteLesson(final HttpServerRequest request) {

        final String lessonId = request.params().get("id");

        if (isValidLessonId(lessonId)) {
            UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
                @Override
                public void handle(final UserInfos user) {
                    if (user != null) {
                        lessonService.deleteLesson(lessonId, notEmptyResponseHandler(request, 201));
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

    /**
     * Controls that the lessonId is a not null number entry.
     */
    private boolean isValidLessonId(String lessonId) {
        return lessonId != null && lessonId.matches("\\d+");
    }

}
