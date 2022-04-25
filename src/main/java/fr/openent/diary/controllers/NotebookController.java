package fr.openent.diary.controllers;


import fr.openent.diary.core.constants.Field;
import fr.openent.diary.helper.FutureHelper;
import fr.openent.diary.security.workflow.HomeworkRead;
import fr.openent.diary.security.workflow.NotebookRead;
import fr.openent.diary.security.workflow.SessionRead;
import fr.openent.diary.services.NotebookService;
import fr.openent.diary.services.impl.DefaultNotebookService;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;

import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.http.BaseController;

import io.vertx.core.Future;
import io.vertx.core.MultiMap;
import io.vertx.core.Promise;
import io.vertx.core.Vertx;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.http.HttpServerRequest;

import io.vertx.core.json.JsonObject;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.response.DefaultResponseHandler;
import org.entcore.common.storage.Storage;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;

import java.util.Arrays;
import java.util.List;


public class NotebookController extends BaseController {
    private final NotebookService notebookService;

    public NotebookController(EventBus eb, Vertx vertx, Storage storage, JsonObject config) {
        super();
        this.notebookService = new DefaultNotebookService(eb, vertx, storage, config);
    }

    @Get("/notebooks")
    @ApiDoc("Get global notebooks")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(NotebookRead.class)
    public void getNotebooks(final HttpServerRequest request) {
        MultiMap params = request.params();
        String structure_id = params.get(Field.STRUCTURE_ID);

        String start_at = params.get(Field.START_AT);
        String end_at = params.get(Field.END_AT);

        List<String> teacher_id = params.getAll(Field.TEACHER_ID);
        List<String> audience_id = params.getAll(Field.AUDIENCE_ID);

        Boolean isVisa = params.get(Field.VISA) != null ? Boolean.parseBoolean(params.get(Field.VISA)) : null;
        String visaOrder = params.get(Field.ORDERVISA);
        Boolean isPublished = params.get(Field.IS_PUBLISHED) != null ? Boolean.parseBoolean(params.get(Field.IS_PUBLISHED)) : null;

        Integer page = params.get(Field.PAGE) != null ? Integer.parseInt(params.get(Field.PAGE)) : null;
        String limit = params.get(Field.LIMIT);
        String offset = params.get(Field.OFFSET);
        notebookService.get(structure_id, start_at, end_at, teacher_id, audience_id, isVisa, visaOrder, isPublished, page,
                limit, offset, DefaultResponseHandler.defaultResponseHandler(request));
    }

    @Get("/notebooks/sessions/homeworks")
    @ApiDoc("fetch all sessions/homeworks from a notebook")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(NotebookRead.class)
    public void getNotebooksSessions(final HttpServerRequest request) {
        MultiMap params = request.params();

        String structure_id = params.get(Field.STRUCTURE_ID);

        String start_at = params.get(Field.START_AT);
        String end_at = params.get(Field.END_AT);

        String subject_id = params.get(Field.SUBJECT_ID);
        String teacher_id = params.get(Field.TEACHER_ID);
        String audience_id = params.get(Field.AUDIENCE_ID);
        Boolean isVisa = params.get(Field.VISA) != null ? Boolean.parseBoolean(params.get(Field.VISA)) : null;
        Boolean isPublished = params.get(Field.IS_PUBLISHED) != null ? Boolean.parseBoolean(params.get(Field.IS_PUBLISHED)) : null;

        notebookService.getNotebookHomeworksSessions(structure_id, start_at, end_at, subject_id, teacher_id, audience_id,
                isVisa, isPublished, DefaultResponseHandler.arrayResponseHandler(request));
    }
}
