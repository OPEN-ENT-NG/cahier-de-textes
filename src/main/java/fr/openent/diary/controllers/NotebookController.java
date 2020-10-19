package fr.openent.diary.controllers;


import fr.openent.diary.services.NotebookService;
import fr.openent.diary.services.impl.DefaultNotebookService;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;

import fr.wseduc.webutils.http.BaseController;

import io.vertx.core.MultiMap;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.http.HttpServerRequest;

import org.entcore.common.http.response.DefaultResponseHandler;

import java.util.List;


public class NotebookController extends BaseController {
    private final NotebookService notebookService;

    public NotebookController(EventBus eb) {
        super();
        this.notebookService = new DefaultNotebookService(eb);
    }

    @Get("/notebooks")
    @ApiDoc("Get global notebooks")
    public void getNotebooks(final HttpServerRequest request) {
        MultiMap params = request.params();
        String structure_id = params.get("structure_id");

        String start_at = params.get("start_at");
        String end_at = params.get("end_at");

        List<String> teacher_id = params.getAll("teacher_id");
        List<String> audience_id = params.getAll("audience_id");

        Boolean isVisa = params.get("visa") != null ? Boolean.parseBoolean(params.get("visa")) : null;
        String visaOrder = params.get("orderVisa");
        Boolean isPublished = params.get("is_published") != null ? Boolean.parseBoolean(params.get("is_published")) : null;

        Integer page = params.get("page") != null ? Integer.parseInt(params.get("page")) : null;
        String limit = params.get("limit");
        String offset = params.get("offset");
        notebookService.getNotebooks(structure_id, start_at, end_at, teacher_id, audience_id, isVisa, visaOrder, isPublished, page,
                limit, offset, DefaultResponseHandler.defaultResponseHandler(request));
    }

    @Get("/notebooks/sessions/homeworks")
    @ApiDoc("fetch all sessions/homeworks from a notebook")
    public void getNotebooksSessions(final HttpServerRequest request) {
        MultiMap params = request.params();

        String structure_id = params.get("structure_id");

        String start_at = params.get("start_at");
        String end_at = params.get("end_at");

        String subject_id = params.get("subject_id");
        String teacher_id = params.get("teacher_id");
        String audience_id = params.get("audience_id");
        Boolean isVisa = params.get("visa") != null ? Boolean.parseBoolean(params.get("visa")) : null;
        Boolean isPublished = params.get("is_published") != null ? Boolean.parseBoolean(params.get("is_published")) : null;

        notebookService.getNotebookHomeworksSessions(structure_id, start_at, end_at, subject_id, teacher_id, audience_id,
                isVisa, isPublished, DefaultResponseHandler.arrayResponseHandler(request));
    }
}
