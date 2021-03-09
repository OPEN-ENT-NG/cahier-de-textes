package fr.openent.diary.controllers;

import fr.openent.diary.models.ZIPFile;
import fr.openent.diary.security.*;
import fr.openent.diary.security.workflow.*;
import fr.openent.diary.services.ExportPDFService;
import fr.openent.diary.services.ExportZIPService;
import fr.openent.diary.services.NotebookArchiveService;
import fr.openent.diary.services.impl.DefaultNotebookArchiveService;
import fr.openent.diary.services.impl.ExportPDFServiceImpl;
import fr.openent.diary.services.impl.ExportZIPServiceImpl;
import fr.wseduc.rs.*;
import fr.wseduc.security.*;
import fr.wseduc.webutils.http.BaseController;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.*;
import io.vertx.core.eventbus.*;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.http.filter.*;
import org.entcore.common.http.response.*;
import org.entcore.common.storage.Storage;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


public class NotebookArchiveController extends BaseController {
    private final NotebookArchiveService archiveService;
    private final ExportPDFService exportPDFService;
    private final ExportZIPService exportZIPService;

    public NotebookArchiveController(EventBus eb, Vertx vertx, Storage storage) {
        super();
        this.vertx = vertx;
        this.eb = eb;
        this.archiveService = new DefaultNotebookArchiveService(eb, storage);
        this.exportPDFService = new ExportPDFServiceImpl(eb, vertx, storage, config);
        this.exportZIPService = new ExportZIPServiceImpl(vertx, storage);
    }

    @SecuredAction(value = WorkflowUtils.NOTEBOOK_ARCHIVE_READ, type = ActionType.WORKFLOW)
    public void readArchives(final HttpServerRequest request) {
    }

    @SecuredAction(value = WorkflowUtils.NOTEBOOK_ARCHIVE_SEARCH_TEACHERS, type = ActionType.WORKFLOW)
    public void searchTeachers(final HttpServerRequest request) {
    }

    @Get("/structures/:structureId/notebooks/archives")
    @ApiDoc("Get notebook archives")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(NotebookArchiveRead.class)
    public void getNotebookArchives(final HttpServerRequest request) {
        MultiMap params = request.params();
        String structureId = params.get("structureId");

        String schoolYear = params.get("schoolYear");

        List<String> teacherNames = params.getAll("teacherName");
        List<String> audienceLabels = params.getAll("audienceLabel");

        Integer page = params.get("page") != null ? Integer.parseInt(params.get("page")) : null;
        String limit = params.get("limit");
        String offset = params.get("offset");
        archiveService.get(structureId, schoolYear, teacherNames, audienceLabels, page,
                limit, offset, result -> {
                    if (result.failed()) {
                        log.error(result.cause().getMessage());
                        renderError(request);
                        return;
                    }
                    renderJson(request, result.result());
                });
    }


    @Get("/structures/:structureId/notebooks/archives/periods")
    @ApiDoc("Get notebook archive school years")
    @SuppressWarnings("unchecked")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(NotebookArchiveRead.class)
    public void getArchiveYears(final HttpServerRequest request) {
        MultiMap params = request.params();
        String structureId = params.get("structureId");

        archiveService.getArchiveYears(structureId, result -> {
            if (result.failed()) {
                log.error(result.cause().getMessage());
                renderError(request);
                return;
            }
            List<String> schoolYears = ((List<JsonObject>) result.result().getList()).stream()
                    .map(yearObject -> yearObject.getString("archive_school_year"))
                    .collect(Collectors.toList());
            renderJson(request, new JsonObject().put("archiveSchoolYears", schoolYears));
        });
    }

    @Get("/structures/:structureId/notebooks/archives/teachers/:teacherName")
    @ApiDoc("Get notebook archives")
    @SuppressWarnings("unchecked")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(NotebookArchiveSearchTeachers.class)
    public void searchTeacher(final HttpServerRequest request) {
        MultiMap params = request.params();
        String structureId = params.get("structureId");
        String teacherName = params.get("teacherName");

        archiveService.searchTeacher(structureId, teacherName, result -> {
            if (result.failed()) {
                log.error(result.cause().getMessage());
                renderError(request);
                return;
            }
            List<String> displayNames = ((List<JsonObject>) result.result().getList()).stream()
                    .map(nameObject -> nameObject.getString("displayname"))
                    .collect(Collectors.toList());
            renderJson(request, new JsonObject().put("teacherNames", displayNames));
        });
    }

    @Get("/structures/:structureId/notebooks/archives/audiences/:audienceName")
    @ApiDoc("Get notebook archives")
    @SuppressWarnings("unchecked")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(NotebookArchiveRead.class)
    public void searchAudience(final HttpServerRequest request) {
        MultiMap params = request.params();
        String structureId = params.get("structureId");
        String audienceName = params.get("audienceName");

        archiveService.searchAudience(structureId, audienceName, result -> {
            if (result.failed()) {
                log.error(result.cause().getMessage());
                renderError(request);
                return;
            }

            List<String> audienceLabels = ((List<JsonObject>) result.result().getList()).stream()
                    .map(labelObject -> labelObject.getString("audience_label"))
                    .collect(Collectors.toList());
            renderJson(request, new JsonObject().put("audienceNames", audienceLabels));
        });
    }


    @Get("/structures/:structureId/notebooks/archives/export")
    @ApiDoc("Download notebook archive(s)")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(NotebookArchiveRead.class)
    public void exportNotebookArchives(final HttpServerRequest request) {
        MultiMap params = request.params();
        String structureId = params.get("structureId");

        List<String> archiveIdStringList = params.getAll("archiveId");

        List<Integer> archiveId = new ArrayList<>();
        for (String id : archiveIdStringList) {
            archiveId.add(Integer.valueOf(id));
        }

        archiveService.getNotebookArchivePdfInfos(structureId, archiveId, res -> {
            if (res.failed()) {
                String message = "[Diary@NotebookArchiveController::exportNotebookArchives] Error fetching notebook archive PDF ids.";
                log.error(message);
            } else {
                JsonArray pdfInfos = res.result();

                if (pdfInfos.size() == 1) {
                    String fileId = pdfInfos.getJsonObject(0).getString("file_id", null);
                    this.exportPDFService.getPDF(fileId, pdf -> {
                        if (pdf != null) {
                            request.response()
                                    .putHeader("Content-type", "application/pdf; charset=utf-8")
                                    .putHeader("Content-Disposition", "attachment; filename=" +
                                            archiveService.getPDFName(pdfInfos.getJsonObject(0)) + ".pdf")
                                    .end(pdf);
                        } else {
                            String message = "[Diary@NotebookArchiveController::exportNotebookArchives] PDF file not found.";
                            log.error(message);
                        }
                    });
                } else {
                    List<String> fileIds = new ArrayList<>();
                    JsonObject fileNames = new JsonObject();

                    for (int i = 0; i < pdfInfos.size(); i++) {

                        String fileId = pdfInfos.getJsonObject(i).getString("file_id", null);
                        fileIds.add(fileId);
                        fileNames.put(fileId, archiveService.getPDFName(pdfInfos.getJsonObject(i)) + ".pdf");
                    }

                    ZIPFile zipFile = new ZIPFile(archiveService.getZIPName());

                    this.exportZIPService.getZIP(fileIds, fileNames, zipFile, zip -> {
                        request.response().putHeader("Content-Disposition", "attachment; filename="
                                + archiveService.getZIPName() + ".zip")
                                .putHeader("Content-Type", "application/octet-stream")
                                .putHeader("Content-Description", "File Transfer")
                                .putHeader("Content-Transfer-Encoding", "binary")
                                .sendFile(zip.result());

                        Future<Void> deleteZipFuture = Future.future();
                        this.exportZIPService.deleteZIP(zipFile, deleteZipFuture);
                    });
                }
            }
        });
    }

    @Post("/structures/:structureId/notebooks/archives")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(AdminAccess.class)
    @ApiDoc("Generate notebook archives")
    public void generateNotebookArchives(final HttpServerRequest request) {
        MultiMap params = request.params();
        String structureId = params.get("structureId");
        RequestUtils.bodyToJson(request, pathPrefix + "archiveProcess", body -> archiveService.launchArchivesWorker(structureId, body.getInteger("schoolYear"),
                DefaultResponseHandler.defaultResponseHandler(request)));
    }
}
