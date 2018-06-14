package fr.openent.diary.controllers;

import fr.openent.diary.model.GenericHandlerResponse;
import fr.openent.diary.model.LessonAsModel;
import fr.openent.diary.model.ModelWeek;
import fr.openent.diary.services.ModelWeekServiceImpl;
import fr.openent.diary.utils.DateUtils;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.security.SecuredAction;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;

import java.util.Date;
import java.util.List;

public class ModelWeekController extends ControllerHelper {
    private ModelWeekServiceImpl modelWeekService;

    public ModelWeekController(ModelWeekServiceImpl modelWeekService) {
        this.modelWeekService = modelWeekService;
    }

    @Get("/modelweek/list")
    @SecuredAction("diary.manageModelWeek.list")
    public void modelweek(final HttpServerRequest request) {

        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if(user != null && user.getType().equals("Teacher")){
                    modelWeekService.getModelWeeks(user.getUserId(), GenericHandlerResponse.<List<ModelWeek>>handler(request));
                } else {
                    unauthorized(request, "No user found in session.");
                }
            }
        });

    }

    @Get("/modelweek/items/:date")
    @SecuredAction("diary.manageModelWeek.getItems")
    public void getWeekItems(final HttpServerRequest request) {

        try {
            final Date date = DateUtils.parseDate(request.params().get("date"));

            UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
                @Override
                public void handle(final UserInfos user) {
                    if(user != null && user.getType().equals("Teacher")){
                        modelWeekService.getAllsItemsModel(user,date, GenericHandlerResponse.<List<LessonAsModel>>handler(request));
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
    @SecuredAction("diary.manageModelWeek.invert")
    public void invertModelWeek(final HttpServerRequest request) {

        try{

            UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
                @Override
                public void handle(final UserInfos user) {
                    if(user != null && user.getType().equals("Teacher")){
                        modelWeekService.invertModelWeek(user.getUserId(),GenericHandlerResponse.genericHandle(request) );
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
    @SecuredAction("diary.manageModelWeek.update")
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
                        modelWeekService.createOrUpdateModelWeek(user.getUserId(), weekAlias, date,GenericHandlerResponse.<ModelWeek>handler(request));
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
