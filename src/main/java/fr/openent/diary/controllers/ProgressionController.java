package fr.openent.diary.controllers;

import fr.openent.diary.model.GenericHandlerResponse;
import fr.openent.diary.model.HandlerResponse;
import fr.openent.diary.model.progression.LessonProgression;
import fr.openent.diary.model.progression.OrderLesson;
import fr.openent.diary.model.progression.Progression;
import fr.openent.diary.services.ProgressionServiceImpl;
import fr.openent.diary.utils.SqlMapper;
import fr.wseduc.rs.Delete;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.security.SecuredAction;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;

import java.util.List;

public class ProgressionController extends ControllerHelper {
    private ProgressionServiceImpl progressionService;


    public ProgressionController(ProgressionServiceImpl progressionService) {
        this.progressionService = progressionService;
    }

    @Get("/progression")
    @SecuredAction("diary.manageProgression.list.progression")
    public void getProgression(final HttpServerRequest request) {

        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if(user != null && user.getType().equals("Teacher")){
                    progressionService.getProgressions(user.getUserId(), GenericHandlerResponse.<List<Progression>>handler(request));
                } else {
                    unauthorized(request, "No user found in session.");
                }
            }
        });
    }

    @Post("/progression")
    @SecuredAction("diary.manageProgression.update.progression")
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
                                    progressionService.createOrUpdateProgression(progression, GenericHandlerResponse.<Progression>handler(request));
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
    @SecuredAction("diary.manageProgression.delete.progression")
    public void deleteProgression(final HttpServerRequest request) {

        final Long progressionId = Long.parseLong(request.params().get("progressionId"));

        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if(user != null && user.getType().equals("Teacher")){
                    progressionService.deleteProgression(progressionId, GenericHandlerResponse.genericHandle(request));
                } else {
                    unauthorized(request, "No user found in session.");
                }
            }
        });
    }

    @Delete("/progression/lessons")
    @SecuredAction("diary.manageProgression.delete.items")
    public void deleteLesson(final HttpServerRequest request) {

        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if(user != null && user.getType().equals("Teacher")) {

                    SqlMapper.mappListRequest(request, Long.class, new Handler<HandlerResponse<List<Long>>>() {
                        @Override
                        public void handle(HandlerResponse<List<Long>> event) {
                            if (event.hasError()) {
                                badRequest(request, event.getMessage());
                                return;
                            }
                            progressionService.deleteLessonProgression(event.getResult(), GenericHandlerResponse.genericHandle(request));
                        }
                    });

                } else {
                    unauthorized(request, "No user found in session.");
                }
            }
        });
    }

    @Get("/progression/:progressionId/lessons")
    @SecuredAction("diary.manageProgression.list.items")
    public void getLessonProgression(final HttpServerRequest request) {

        final Long progressionId = Long.parseLong(request.params().get("progressionId"));

        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null && user.getType().equals("Teacher")) {
                    progressionService.getLessonProgression(user.getUserId(), progressionId, GenericHandlerResponse.<List<LessonProgression>>handler(request));
                }
            }
        });
    }


    @Get("/progression/lesson/:lessonId")
    @SecuredAction("diary.manageProgression.detail.item")
    public void getLesson(final HttpServerRequest request) {

        final Long lessonId = Long.parseLong(request.params().get("lessonId"));

        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if(user != null && user.getType().equals("Teacher")){
                    progressionService.getLesson(user.getUserId(),lessonId, GenericHandlerResponse.<LessonProgression>handler(request));
                } else {
                    unauthorized(request, "No user found in session.");
                }
            }
        });
    }

    @Post("/progression/lesson")
    @SecuredAction("diary.manageProgression.update.item")
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
                                    progressionService.createOrUpdateLessonProgression(event.getResult(), GenericHandlerResponse.<LessonProgression>handler(request));
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
    @SecuredAction("diary.manageProgression.order")
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
                                    progressionService.updateOrderLessonProgression(orders, GenericHandlerResponse.genericHandle(request));
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
