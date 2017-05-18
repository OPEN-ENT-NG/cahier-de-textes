package fr.openent.diary.controllers;

import fr.openent.diary.model.GenericHandlerResponse;
import fr.openent.diary.model.HandlerResponse;
import fr.openent.diary.model.LessonAsModel;
import fr.openent.diary.model.ModelWeek;
import fr.openent.diary.services.ModelWeekServiceImpl;
import fr.openent.diary.utils.DateUtils;
import fr.openent.diary.utils.StringUtils;
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
import org.vertx.java.core.json.impl.Json;

import java.util.Date;
import java.util.List;

public class ModelWeekController extends ControllerHelper {
    private ModelWeekServiceImpl modelWeekService;

    public ModelWeekController(ModelWeekServiceImpl modelWeekService) {
        this.modelWeekService = modelWeekService;
    }

    @Get("/modelweek/list")
    public void modelweek(final HttpServerRequest request) {

        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if(user != null && user.getType().equals("Teacher")){
                    modelWeekService.getModelWeeks(user.getUserId(), new Handler<HandlerResponse<List<ModelWeek>>>() {
                        @Override
                        public void handle(HandlerResponse<List<ModelWeek>> modelWeeks) {
                            if (!modelWeeks.hasError()){
                                request.response()
                                        .putHeader("content-type", "application/json; charset=utf-8")
                                        .end(StringUtils.encodeJson(modelWeeks.getResult()));
                            }else{
                                badRequest(request,"modelweek request validation error");
                            }
                        }
                    });
                } else {
                    unauthorized(request, "No user found in session.");
                }
            }
        });

    }

    @Get("/modelweek/items/:date")
    public void getWeekItems(final HttpServerRequest request) {

        try {
            final Date date = DateUtils.parseDate(request.params().get("date"));

            UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
                @Override
                public void handle(final UserInfos user) {
                    if(user != null && user.getType().equals("Teacher")){
                        modelWeekService.getAllsItemsModel(user,date, new Handler<HandlerResponse<List<LessonAsModel>>>() {
                            @Override
                            public void handle(HandlerResponse<List<LessonAsModel>> lessonAsModels) {
                                if (!lessonAsModels.hasError()){
                                    request.response()
                                            .putHeader("content-type", "application/json; charset=utf-8")
                                            .end(StringUtils.encodeJson(lessonAsModels.getResult()));
                                }else{
                                    badRequest(request,"modelweek request validation error");
                                }
                            }
                        });
                    } else {
                        unauthorized(request, "No user found in session.");
                    }
                }
            });
        }catch(Exception e){
            badRequest(request,e.getMessage());
        }
    }

    @Post("/modelweek/invert")
    @SecuredAction("diary.manageModelWeek")
    public void invertModelWeek(final HttpServerRequest request) {

        try{

            UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
                @Override
                public void handle(final UserInfos user) {
                    if(user != null && user.getType().equals("Teacher")){
                        modelWeekService.invertModelWeek(user.getUserId(), new Handler<GenericHandlerResponse>() {
                            @Override
                            public void handle(GenericHandlerResponse event) {
                                if (event.hasError()){
                                    badRequest(request,event.getMessage());
                                }else{
                                    Renders.renderJson(request, new JsonObject().putString("status","ok"));
                                }
                            }
                        });
                    } else {
                        unauthorized(request, "No user found in session.");
                    }
                }
            });
        }catch(Exception e){
            badRequest(request,e.getMessage());
        }
    }

    @Post("/modelweek/:weekAlias/:date")
    public void setModelWeek(final HttpServerRequest request) {

        try{
            final Date date = DateUtils.parseDate(request.params().get("date"));
            final String weekAlias = request.params().get("weekAlias");

            if(!weekAlias.equals("A") && !weekAlias.equals("B")){
                badRequest(request,"weekAlias missing [A,B]");
                return;
            }

            UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
                @Override
                public void handle(final UserInfos user) {
                    if(user != null && user.getType().equals("Teacher")){
                        modelWeekService.createOrUpdateModelWeek(user.getUserId(), weekAlias, date, new Handler<HandlerResponse<ModelWeek>>() {
                            @Override
                            public void handle(HandlerResponse<ModelWeek> event) {
                                if (event.hasError()){
                                    badRequest(request,event.getMessage());
                                }else{
                                    request.response()
                                            .putHeader("content-type", "application/json; charset=utf-8")
                                            .end(StringUtils.encodeJson(event.getResult()));
                                }
                            }
                        });
                    } else {
                        unauthorized(request, "No user found in session.");
                    }
                }
            });
        }catch(Exception e){
            badRequest(request,e.getMessage());
        }
    }



}
