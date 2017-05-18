package fr.openent.diary.controllers;

import fr.wseduc.rs.*;
import fr.wseduc.security.SecuredAction;

import org.entcore.common.controller.ControllerHelper;

import org.vertx.java.core.http.HttpServerRequest;

import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;



public class VisaController extends ControllerHelper {


    private final static Logger log = LoggerFactory.getLogger(VisaController.class);

    public VisaController() {

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

}
