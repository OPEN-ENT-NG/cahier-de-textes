package fr.openent.diary.controllers;

import fr.openent.diary.model.GenericHandlerResponse;
import fr.openent.diary.model.HandlerResponse;
import fr.openent.diary.model.progression.LessonProgression;
import fr.openent.diary.model.progression.OrderLesson;
import fr.openent.diary.model.progression.Progression;
import fr.openent.diary.services.ProgressionServiceImpl;
import fr.openent.diary.utils.SqlMapper;
import fr.openent.diary.utils.StringUtils;
import fr.wseduc.rs.Delete;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.http.Renders;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonObject;

import java.util.List;

public class ProgressionController extends ControllerHelper {
    private ProgressionServiceImpl progressionService;

    public ProgressionController(ProgressionServiceImpl progressionService) {
        this.progressionService = progressionService;
    }

    @Get("/progression")
    public void getProgression(final HttpServerRequest request) {

        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if(user != null && user.getType().equals("Teacher")){
                    progressionService.getProgressions(user.getUserId(), new Handler<HandlerResponse<List<Progression>>>() {
                        @Override
                        public void handle(HandlerResponse<List<Progression>> progressions) {
                            if (!progressions.hasError()){
                                request.response()
                                        .putHeader("content-type", "application/json; charset=utf-8")
                                        .end(StringUtils.encodeJson(progressions.getResult()));
                            }else{
                                badRequest(request,progressions.getMessage());
                            }
                        }
                    });
                } else {
                    unauthorized(request, "No user found in session.");
                }
            }
        });
    }

    @Post("/progression")
    @SecuredAction("diary.manageProgression")
    public void postProgression(final HttpServerRequest request) {
        try {
            UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
                @Override
                public void handle(final UserInfos user) {
                    if (user != null && user.getType().equals("Teacher")) {

                        SqlMapper.mappRequest(request, Progression.class, new Handler<HandlerResponse<Progression>>() {
                            @Override
                            public void handle(HandlerResponse<Progression> event) {
                                if (event.hasError()) {
                                    badRequest(request, event.getMessage());
                                } else {
                                    Progression progression =event.getResult();
                                    progression.setTeacherId(user.getUserId());
                                    progressionService.createOrUpdateProgression(progression, new Handler<HandlerResponse<Progression>>() {
                                        @Override
                                        public void handle(HandlerResponse<Progression> event) {
                                            if (event.hasError()) {
                                                badRequest(request, event.getMessage());
                                            } else {
                                                request.response()
                                                        .putHeader("content-type", "application/json; charset=utf-8")
                                                        .end(StringUtils.encodeJson(event.getResult()));
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    } else {
                        unauthorized(request, "No user found in session.");
                    }
                }
            });
        } catch (Exception e) {
            badRequest(request, e.getMessage());
        }
    }

    @Delete("/progression/:progressionId")
    public void deleteProgression(final HttpServerRequest request) {

        final Long progressionId = Long.parseLong(request.params().get("progressionId"));

        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if(user != null && user.getType().equals("Teacher")){
                    progressionService.deleteProgression(progressionId, new Handler<GenericHandlerResponse>() {
                        @Override
                        public void handle(GenericHandlerResponse event) {
                            if (!event.hasError()){
                                request.response()
                                        .putHeader("content-type", "application/json; charset=utf-8")
                                        .end("ok");
                            }else{
                                badRequest(request,event.getMessage());
                            }
                        }
                    });
                } else {
                    unauthorized(request, "No user found in session.");
                }
            }
        });
    }

    @Delete("/progression/lessons")
    public void deleteLesson(final HttpServerRequest request) {

        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if(user != null && user.getType().equals("Teacher")){

                    SqlMapper.mappListRequest(request, Long.class, new Handler<HandlerResponse<List<Long>>>() {
                        @Override
                        public void handle(HandlerResponse<List<Long>> event) {
                            if (event.hasError()){
                                badRequest(request,event.getMessage());
                                return;
                            }
                            progressionService.deleteLessonProgression(event.getResult(), new Handler<GenericHandlerResponse>() {
                                @Override
                                public void handle(GenericHandlerResponse event) {
                                    if (!event.hasError()){
                                        request.response()
                                                .putHeader("content-type", "application/json; charset=utf-8")
                                                .end("ok");
                                    }else{
                                        badRequest(request,event.getMessage());
                                    }
                                }
                            });
                        }
                    });

                } else {
                    unauthorized(request, "No user found in session.");
                }
            }
        });
    }

    @Get("/progression/:progressionId/lessons")
    public void getLessonProgression(final HttpServerRequest request) {

        final Long progressionId = Long.parseLong(request.params().get("progressionId"));

        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if(user != null && user.getType().equals("Teacher")){
                    progressionService.getLessonProgression(user.getUserId(),progressionId, new Handler<HandlerResponse<List<LessonProgression>>>() {
                        @Override
                        public void handle(HandlerResponse<List<LessonProgression>> progressions) {
                            if (!progressions.hasError()){
                                request.response()
                                        .putHeader("content-type", "application/json; charset=utf-8")
                                        .end(StringUtils.encodeJson(progressions.getResult()));
                            }else{
                                badRequest(request,progressions.getMessage());
                            }
                        }
                    });
                } else {
                    unauthorized(request, "No user found in session.");
                }
            }
        });
    }


    @Get("/progression/lesson/:lessonId")
    public void getLesson(final HttpServerRequest request) {

        final Long lessonId = Long.parseLong(request.params().get("lessonId"));

        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if(user != null && user.getType().equals("Teacher")){
                    progressionService.getLesson(user.getUserId(),lessonId, new Handler<HandlerResponse<LessonProgression>>() {
                        @Override
                        public void handle(HandlerResponse<LessonProgression> progressions) {
                            if (!progressions.hasError()){
                                request.response()
                                        .putHeader("content-type", "application/json; charset=utf-8")
                                        .end(StringUtils.encodeJson(progressions.getResult()));
                            }else{
                                badRequest(request,progressions.getMessage());
                            }
                        }
                    });
                } else {
                    unauthorized(request, "No user found in session.");
                }
            }
        });
    }

    @Post("/progression/lesson")
    public void postLessonProgression(final HttpServerRequest request) {
        try {
            UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
                @Override
                public void handle(final UserInfos user) {
                    if (user != null && user.getType().equals("Teacher")) {

                        SqlMapper.mappRequest(request, LessonProgression.class, new Handler<HandlerResponse<LessonProgression>>() {
                            @Override
                            public void handle(HandlerResponse<LessonProgression> event) {
                                if (event.hasError()) {
                                    badRequest(request, event.getMessage());
                                } else {
                                    LessonProgression lessonProgression = event.getResult();
                                    lessonProgression.setTeacherId(user.getUserId());
                                    progressionService.createOrUpdateLessonProgression(event.getResult(), new Handler<HandlerResponse<LessonProgression>>() {
                                        @Override
                                        public void handle(HandlerResponse<LessonProgression> event) {
                                            if (event.hasError()) {
                                                badRequest(request, event.getMessage());
                                            } else {
                                                request.response()
                                                        .putHeader("content-type", "application/json; charset=utf-8")
                                                        .end(StringUtils.encodeJson(event.getResult()));
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    } else {
                        unauthorized(request, "No user found in session.");
                    }
                }
            });
        } catch (Exception e) {
            badRequest(request, e.getMessage());
        }
    }


    @Post("/progression/order")
    public void changerOrder(final HttpServerRequest request) {
        try {
            UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
                @Override
                public void handle(final UserInfos user) {
                    if (user != null && user.getType().equals("Teacher")) {

                        SqlMapper.mappListRequest(request, OrderLesson.class, new Handler<HandlerResponse<List<OrderLesson>>>() {
                            @Override
                            public void handle(HandlerResponse<List<OrderLesson>> event) {
                                if (event.hasError()) {
                                    badRequest(request, event.getMessage());
                                } else {
                                    List<OrderLesson> orders = event.getResult();
                                    progressionService.updateOrderLessonProgression(orders, new Handler<GenericHandlerResponse>() {
                                        @Override
                                        public void handle(GenericHandlerResponse event) {
                                            if (event.hasError()){
                                                badRequest(request,event.getMessage());
                                            }else{
                                                Renders.renderJson(request, new JsonObject().putString("status","ok"));
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    } else {
                        unauthorized(request, "No user found in session.");
                    }
                }
            });
        } catch (Exception e) {
            badRequest(request, e.getMessage());
        }
    }
}
