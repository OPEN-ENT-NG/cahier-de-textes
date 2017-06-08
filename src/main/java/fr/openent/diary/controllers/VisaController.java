package fr.openent.diary.controllers;

import com.sun.org.apache.xpath.internal.operations.Bool;
import fr.openent.diary.model.GenericHandlerResponse;
import fr.openent.diary.model.HandlerResponse;
import fr.openent.diary.model.ModelWeek;
import fr.openent.diary.model.visa.ResultVisaList;
import fr.openent.diary.model.visa.VisaFilters;
import fr.openent.diary.services.VisaServiceImpl;
import fr.openent.diary.utils.StringUtils;
import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;

import org.entcore.common.controller.ControllerHelper;

import org.entcore.common.http.filter.AdmlOfStructure;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;

import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;

import java.util.List;


public class VisaController extends ControllerHelper {


    private final static Logger log = LoggerFactory.getLogger(VisaController.class);
    private VisaServiceImpl visaService;

    public VisaController(VisaServiceImpl visaService) {
        this.visaService = visaService;
    }


    @Get("/visa")
    @SecuredAction("diary.manageVisa")
    public void view(final HttpServerRequest request) {
        renderView(request);
    }

    @Get("/otherTeachers")
    @SecuredAction("diary.showOtherTeachers")
    public void otherTeachers(final HttpServerRequest request) {
        renderView(request);
    }

    @Get("/inspect")
    @SecuredAction("diary.inspectTeacher")
    public void inspect(final HttpServerRequest request) {
        renderView(request);
    }


    @Get("/visa/filters/:structureId")
    @SecuredAction(value = "diary.manageVisa", type = ActionType.AUTHENTICATED)
    public void getFilters(final HttpServerRequest request) {

        String structureId = request.params().get("structureId");
        this.visaService.getFilters(structureId, GenericHandlerResponse.<VisaFilters>handler(request));

    }

    @Get("/visa/agregs")
    @SecuredAction(value = "diary.manageVisa", type = ActionType.AUTHENTICATED)
    public void modelweek(final HttpServerRequest request) {

        String structureId = request.params().get("structureId");
        String teacherId = request.params().get("teacherId");
        String audienceId = request.params().get("audienceId");
        String subjectId = request.params().get("subjectId");
        Boolean showTodoOnly=Boolean.TRUE;
        String showTodoOnlyTxt = request.params().get("showTodoOnly");
        if (showTodoOnlyTxt!=null && showTodoOnlyTxt.equals("false")){
            showTodoOnly = Boolean.FALSE;
        }
        this.visaService.getAllAgregatedVisas(structureId,teacherId,audienceId,subjectId,showTodoOnly,GenericHandlerResponse.<List<ResultVisaList>>handler(request));

    }
}
