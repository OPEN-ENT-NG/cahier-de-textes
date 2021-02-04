package fr.openent.diary.controllers;

import fr.openent.diary.core.constants.Actions;
import fr.openent.diary.security.WorkflowUtils;
import fr.openent.diary.security.workflow.*;
import fr.openent.diary.services.HomeworkService;
import fr.wseduc.rs.Delete;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.rs.Put;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.http.HttpServerRequest;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.filter.Trace;
import org.entcore.common.http.response.DefaultResponseHandler;
import org.entcore.common.user.UserUtils;

public class HomeworkController extends ControllerHelper {

    private HomeworkService homeworkService;


    public HomeworkController(HomeworkService homeworkService) {
        this.homeworkService = homeworkService;
    }

    @SecuredAction(value = WorkflowUtils.HOMEWORK_READ, type = ActionType.WORKFLOW)
    public void workflow1(final HttpServerRequest request) { }

    @SecuredAction(value = WorkflowUtils.HOMEWORK_MANAGE, type = ActionType.WORKFLOW)
    public void workflow2(final HttpServerRequest request) { }

    @SecuredAction(value = WorkflowUtils.HOMEWORK_PUBLISH, type = ActionType.WORKFLOW)
    public void workflow3(final HttpServerRequest request) { }

    @SecuredAction(value = WorkflowUtils.VIESCO_SETTING_HOMEWORK_AND_SESSION_TYPE_READ, type = ActionType.WORKFLOW)
    public void workflow4(final HttpServerRequest request) { }

    @SecuredAction(value = WorkflowUtils.VIESCO_SETTING_HOMEWORK_AND_SESSION_TYPE_MANAGE, type = ActionType.WORKFLOW)
    public void workflow5(final HttpServerRequest request) { }

    @Get("/homeworks/own/:startDate/:endDate/:structureId")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(AccessOwnData.class)
    public void getOwnHomeworks(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            String startDate = request.getParam("startDate");
            String endDate = request.getParam("endDate");
            String structureId = request.getParam("structureId");
            String subjectId = request.getParam("subjectId");

            homeworkService.getOwnHomeworks(structureId, startDate, endDate, user, subjectId, DefaultResponseHandler.arrayResponseHandler(request));
        });
    }


    @Get("/homeworks/external/:startDate/:endDate")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(AccessExternalData.class)
    public void getExternalHomeworks(final HttpServerRequest request) {
        String startDate = request.getParam("startDate");
        String endDate = request.getParam("endDate");
        String teacherId = request.getParam("teacherId");
        String audienceId = request.getParam("audienceId");
        String subjectId = request.getParam("subjectId");

        homeworkService.getExternalHomeworks(startDate, endDate, teacherId, audienceId, subjectId, DefaultResponseHandler.arrayResponseHandler(request));
    }

    @Get("/homeworks/child/:startDate/:endDate/:childId/:structureId")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(AccessChildData.class)
    public void getChildHomeworks(final HttpServerRequest request) {
        String startDate = request.getParam("startDate");
        String endDate = request.getParam("endDate");
        String childId = request.getParam("childId");
        String structureId = request.getParam("structureId");
        String subjectId = request.getParam("subjectId");

        homeworkService.getChildHomeworks(structureId, startDate, endDate, childId, subjectId, DefaultResponseHandler.arrayResponseHandler(request));
    }

    @Get("/homework/:id")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(HomeworkRead.class)
    public void getHomework(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            long homeworkId = Long.parseLong(request.getParam("id"));
            homeworkService.getHomework(homeworkId, user, DefaultResponseHandler.defaultResponseHandler(request));

        });
    }

    @Get("/homework/:id/:studentId")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(HomeworkRead.class)
    public void getHomeworkStudent(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            long homeworkId = Long.parseLong(request.getParam("id"));
            String studentId = (request.getParam("studentId"));
            homeworkService.getHomeworkStudent(homeworkId,studentId, user, DefaultResponseHandler.defaultResponseHandler(request));

        });
    }


    @Post("/homework")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @Trace(value = Actions.CREATE_HOMEWORK)
    @ResourceFilter(HomeworkManage.class)
    public void createHomework(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> RequestUtils.bodyToJson(request, pathPrefix + "homework", homework -> {
            homeworkService.createHomework(homework, user, DefaultResponseHandler.defaultResponseHandler(request));
        }));
    }

    @Put("/homework/:id/:publicationStateChanged")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @Trace(value = Actions.UPDATE_HOMEWORK)
    @ResourceFilter(HomeworkManage.class)
    public void updateHomework(final HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "homework", homework -> {
            long homeworkId = Long.parseLong(request.getParam("id"));
            boolean publishChanged = Boolean.parseBoolean(request.getParam("publicationStateChanged"));
            homeworkService.updateHomework(homeworkId, publishChanged, homework, DefaultResponseHandler.defaultResponseHandler(request));
        });
    }

    @Delete("/homework/:id")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @Trace(value = Actions.DELETE_HOMEWORK)
    @ResourceFilter(HomeworkManage.class)
    public void deleteHomework(final HttpServerRequest request) {
        long homeworkId = Long.parseLong(request.getParam("id"));
        homeworkService.deleteHomework(homeworkId, DefaultResponseHandler.defaultResponseHandler(request));
    }

    @Post("/homework/publish/:id")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(HomeworkPublish.class)
    public void publishHomework(final HttpServerRequest request) {
        long homeworkId = Long.parseLong(request.getParam("id"));
        homeworkService.publishHomework(homeworkId, DefaultResponseHandler.defaultResponseHandler(request));
    }

    @Post("/homework/unpublish/:id")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(HomeworkPublish.class)
    public void unpublishHomework(final HttpServerRequest request) {
        long homeworkId = Long.parseLong(request.getParam("id"));
        homeworkService.unpublishHomework(homeworkId, DefaultResponseHandler.defaultResponseHandler(request));
    }

    @Get("/homework-types/:idStructure")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(ViescoSettingHomeworkSessionTypeRead.class)
    public void getHomeworkTypes(final HttpServerRequest request) {
        final String structure_id = request.params().get("idStructure");
        homeworkService.getHomeworkTypes(structure_id, DefaultResponseHandler.arrayResponseHandler(request));
    }

    @Post("/homework-type")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(ViescoSettingHomeworkSessionTypeManage.class)
    public void createHomeworkType(final HttpServerRequest request) {
        RequestUtils.bodyToJson(request,
                homeworkType -> {
                    homeworkService.createHomeworkType(homeworkType, DefaultResponseHandler.defaultResponseHandler(request));
                });
    }

    @Put("/homework-type/:id")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(ViescoSettingHomeworkSessionTypeManage.class)
    public void updateHomeworkType(final HttpServerRequest request) {
        RequestUtils.bodyToJson(request,
                homeworkType -> {
                    Integer homework_typeId = Integer.parseInt(request.getParam("id"));
                    homeworkService.updateHomeworkType(homework_typeId, homeworkType, DefaultResponseHandler.defaultResponseHandler(request));
                });
    }

    @Delete("/homework-type/:id/:idStructure")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(ViescoSettingHomeworkSessionTypeManage.class)
    public void deleteHomeworkType(final HttpServerRequest request) {
        Integer homeworkTypeId = Integer.parseInt(request.getParam("id"));
        final String structure_id = request.params().get("idStructure");
        homeworkService.deleteHomeworkType(homeworkTypeId, structure_id, DefaultResponseHandler.defaultResponseHandler(request));
    }

    @Get("/workload/:structureId/:audienceId/:dueDate/:isPublished")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(HomeworkRead.class)
    public void getWorkload(final HttpServerRequest request) {
        if(!request.params().contains("dueDate") || !request.params().contains("isPublished")) {
            badRequest(request);
            return;
        }

        String structureId = request.getParam("structureId");
        String audienceId = request.getParam("audienceId");
        String dueDate = request.getParam("dueDate");
        Boolean isPublished = Boolean.parseBoolean(request.getParam("isPublished"));

        homeworkService.getWorkload(structureId, audienceId, dueDate, isPublished, DefaultResponseHandler.arrayResponseHandler(request));
    }

    @Post("/homework/progress/:id/:state")
    @SecuredAction(value = WorkflowUtils.HOMEWORK_SET_PROGRESS, type = ActionType.WORKFLOW)
    public void setProgressHomework(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            long homeworkId = Long.parseLong(request.getParam("id"));
            String state = request.getParam("state");
            homeworkService.setProgressHomework(homeworkId, state, user, DefaultResponseHandler.defaultResponseHandler(request));
        });
    }
}
