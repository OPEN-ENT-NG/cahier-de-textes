package fr.openent.diary.controllers;

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

    @Get("/homeworks/own/:startDate/:endDate")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(AccessOwnData.class)
    public void getOwnHomeworks(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            String startDate = request.getParam("startDate");
            String endDate = request.getParam("endDate");

            homeworkService.getOwnHomeworks(startDate, endDate, user, DefaultResponseHandler.arrayResponseHandler(request));
        });
    }

    @Get("/homeworks/external/:startDate/:endDate/:type/:typeId")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(AccessExternalData.class)
    public void getExternalHomeworks(final HttpServerRequest request) {
        String startDate = request.getParam("startDate");
        String endDate = request.getParam("endDate");
        String type = request.getParam("type");
        String typeId = request.getParam("typeId");

        homeworkService.getExternalHomeworks(startDate, endDate, type, typeId, DefaultResponseHandler.arrayResponseHandler(request));
    }

    @Get("/homeworks/child/:startDate/:endDate/:childId")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(AccessChildData.class)
    public void getChildHomeworks(final HttpServerRequest request) {
        String startDate = request.getParam("startDate");
        String endDate = request.getParam("endDate");
        String childId = request.getParam("childId");

        homeworkService.getChildHomeworks(startDate, endDate, childId, DefaultResponseHandler.arrayResponseHandler(request));
    }

    @Get("/homework/:id")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(HomeworkRead.class)
    public void getHomework(final HttpServerRequest request) {
        long homeworkId = Long.parseLong(request.getParam("id"));
        homeworkService.getHomework(homeworkId, DefaultResponseHandler.defaultResponseHandler(request));
    }

    @Post("/homework")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(HomeworkManage.class)
    public void createHomework(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> RequestUtils.bodyToJson(request, pathPrefix + "homework", homework -> {
            homeworkService.createHomework(homework, user, DefaultResponseHandler.defaultResponseHandler(request));
        }));
    }

    @Put("/homework/:id")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(HomeworkManage.class)
    public void updateHomework(final HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "homework", homework -> {
            long homeworkId = Long.parseLong(request.getParam("id"));
            homeworkService.updateHomework(homeworkId, homework, DefaultResponseHandler.defaultResponseHandler(request));
        });
    }

    @Delete("/homework/:id")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
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
    @SecuredAction(value = "", type = ActionType.AUTHENTICATED)
    @ResourceFilter(HomeworkTypeSetting.class)
    public void getHomeworkTypes(final HttpServerRequest request) {
        final String structure_id = request.params().get("idStructure");
        homeworkService.getHomeworkTypes(structure_id, DefaultResponseHandler.arrayResponseHandler(request));
    }

    @Post("/homework-type")
    @SecuredAction(value = WorkflowUtils.CDT_ACCESS_SETTING, type = ActionType.WORKFLOW)
    @ResourceFilter(HomeworkTypeSetting.class)
    public void createHomeworkType(final HttpServerRequest request) {
        RequestUtils.bodyToJson(request,
                homeworkType -> {
                    homeworkService.createHomeworkType(homeworkType, DefaultResponseHandler.defaultResponseHandler(request));
                });
    }

    @Put("/homework-type/:id")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(HomeworkTypeSetting.class)
    public void updateHomeworkType(final HttpServerRequest request) {
        RequestUtils.bodyToJson(request,
                homeworkType -> {
                    Integer homework_typeId = Integer.parseInt(request.getParam("id"));
                    homeworkService.updateHomeworkType(homework_typeId, homeworkType, DefaultResponseHandler.defaultResponseHandler(request));
                });
    }

    @Delete("/homework-type/:id")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(HomeworkTypeSetting.class)
    public void deleteHomeworkType(final HttpServerRequest request) {
        Integer homeworkTypeId = Integer.parseInt(request.getParam("id"));
        homeworkService.deleteHomeworkType(homeworkTypeId, DefaultResponseHandler.defaultResponseHandler(request));
    }

    @Get("/workload-week/:date/:audienceId")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(HomeworkRead.class)
    public void getWorkloadWeek(final HttpServerRequest request) {
        String date = request.getParam("date");
        String audienceId = request.getParam("audienceId");

        homeworkService.getWorkloadWeek(date, audienceId, DefaultResponseHandler.arrayResponseHandler(request));
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
