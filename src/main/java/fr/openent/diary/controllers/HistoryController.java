package fr.openent.diary.controllers;

import fr.openent.diary.model.GenericHandlerResponse;
import fr.openent.diary.model.HandlerResponse;
import fr.openent.diary.model.history.HistoryModel;
import fr.openent.diary.model.progression.LessonProgression;
import fr.openent.diary.model.progression.OrderLesson;
import fr.openent.diary.model.progression.Progression;
import fr.openent.diary.services.HistoryServiceImpl;
import fr.openent.diary.services.PdfServiceImpl;
import fr.openent.diary.services.ProgressionServiceImpl;
import fr.openent.diary.utils.DiaryLambda;
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
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;

import java.util.List;
import java.util.Map;

public class HistoryController extends ControllerHelper {
    private HistoryServiceImpl historyService;
    private PdfServiceImpl pdfService;

    public HistoryController(HistoryServiceImpl historyService,PdfServiceImpl pdfService) {
        this.historyService = historyService;
        this.pdfService = pdfService;
    }

    @Override
    protected void setLambdaTemplateRequest(final HttpServerRequest request, final Map<String, Object> ctx) {
        super.setLambdaTemplateRequest(request, ctx);
        DiaryLambda.setLambdaTemplateRequest(request, ctx);
    }

    @Get("/history/create")
    @SecuredAction("diary.manageHistory.apply")
    public void createHistory(final HttpServerRequest request) {
        try {
            final String yearLabel = request.params().get("yearLabel");
            final String structureId = request.params().get("structureId");
            UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
                @Override
                public void handle(final UserInfos user) {
                    if (user != null) {
                        historyService.archiveAndClean(yearLabel, GenericHandlerResponse.genericHandle(request));
                    } else {
                        unauthorized(request, "No user found in session.");
                    }
                }
            });
        } catch (Exception e) {
            badRequest(request, e.getMessage());
        }
    }

    @Get("/history/filters")
    @SecuredAction("diary.showHistory.filters")
    public void getFiltersHistory(final HttpServerRequest request) {
        try {

            final String structureId = request.params().get("structureId");

            UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
                @Override
                public void handle(final UserInfos user) {
                    if (user != null ) {
                        String teacherId = user.getType().equals("Teacher") ? user.getUserId() : null;
                        historyService.getFilters(structureId,teacherId,GenericHandlerResponse.<List<HistoryModel>>handler(request));
                    } else {
                        unauthorized(request, "No user found in session.");
                    }
                }
            });
        } catch (Exception e) {
            badRequest(request, e.getMessage());
        }
    }


    @Get("/history/pdf")
    @SecuredAction("diary.showHistory.pdf")
    public void getHistory(final HttpServerRequest request) {
        try {

            final String yearLabel = request.params().get("yearLabel");
            final String teacherId = request.params().get("teacherId");
            final String audienceId = request.params().get("audienceId");

            /*if (teacherId == null && audienceId == null || (teacherId != null && audienceId != null)){
                badRequest(request, "required teacherId or audienceId, not both");
            }*/

            JsonObject specificDatas = new JsonObject();

            specificDatas.put("yearLabel",yearLabel);

            historyService.getLessons(yearLabel,teacherId,audienceId,pdfService.lessonPdfGenerator(this,specificDatas,request,vertx,eb));


        } catch (Exception e) {
            badRequest(request, e.getMessage());
        }
    }

}
