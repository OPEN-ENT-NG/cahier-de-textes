package fr.openent.diary.controllers;

import fr.openent.diary.services.HomeworkService;
import fr.openent.diary.services.LessonService;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Delete;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.rs.Put;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.http.BaseController;
import fr.wseduc.webutils.request.RequestUtils;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonObject;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.notEmptyResponseHandler;

/**
 * Created by a457593 on 23/02/2016.
 */
public class HomeworkController extends BaseController {

    HomeworkService homeworkService;
    LessonService lessonService;

    public HomeworkController(HomeworkService homeworkService, LessonService lessonService) {
        this.homeworkService = homeworkService;
        this.lessonService = lessonService;
    }

    @Get("/homework/:id")
    @ApiDoc("Get a homework using its identifier")
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

    @Get("/homework/:lessonId")
    @ApiDoc("Get all homeworks for a lesson")
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
    public void createFreeHomework(final HttpServerRequest request) {

        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {

                if(user != null){
                    RequestUtils.bodyToJson(request, pathPrefix + "createHomework", new Handler<JsonObject>() {
                        @Override
                        public void handle(JsonObject json) {

                            if(user.getStructures().contains(json.getString("school_id",""))){
                                homeworkService.createHomework(json, notEmptyResponseHandler(request, 201));
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
                                            homeworkService.createHomework(json, notEmptyResponseHandler(request, 201));
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

    @Put("/homework/:id")
    @ApiDoc("Modify a homework")
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

    /**
     * Controls that the homeworkId is a not null number entry.
     */
    private boolean isValidHomeworkId(String homeworkId) {
        return homeworkId != null && homeworkId.matches("\\d+");
    }
}
