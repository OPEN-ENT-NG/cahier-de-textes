package fr.openent.diary.controllers;

import fr.openent.diary.utils.StringUtils;
import fr.wseduc.rs.Get;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.AdminFilter;
import org.entcore.common.http.filter.ResourceFilter;

public class ConfigController extends ControllerHelper {

    @Get("/config")
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @ResourceFilter(AdminFilter.class)
    public void getExceptionalLabels(final HttpServerRequest request) {
        JsonObject pdfGenerator = config.getJsonObject("pdf-generator", new JsonObject());
        JsonObject nodePdfGenerator = config.getJsonObject("node-pdf-generator", new JsonObject());
        pdfGenerator.put("auth", StringUtils.repeat("*", pdfGenerator.getString("auth", "").length()));
        nodePdfGenerator.put("auth", StringUtils.repeat("*", nodePdfGenerator.getString("auth", "").length()));
        renderJson(request, config);
    }
}
