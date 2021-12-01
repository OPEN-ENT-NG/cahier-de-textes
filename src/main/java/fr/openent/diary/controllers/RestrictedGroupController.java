package fr.openent.diary.controllers;


import fr.openent.diary.models.RestrictedGroup;

import fr.openent.diary.services.RestrictedGroupService;
import fr.openent.diary.services.impl.DefaultRestrictedGroupService;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Post;
import fr.wseduc.webutils.http.BaseController;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserUtils;

public class RestrictedGroupController extends BaseController {

    private final RestrictedGroupService restrictedGroupService;

    public RestrictedGroupController() {
        super();
        this.restrictedGroupService = new DefaultRestrictedGroupService();
    }

    @Post("/structures/:structureId/restricted/group")
    @ApiDoc("Generate notebook archives")
    public void generateNotebookArchives(final HttpServerRequest request) {
        // todo jsonschema
        RequestUtils.bodyToJson(request, body -> UserUtils.getUserInfos(eb, request, user -> {
            body.put("structure_id", request.getParam("structureId"));
            RestrictedGroup restrictedGroup = new RestrictedGroup(body);
            restrictedGroupService.save(restrictedGroup, body.getBoolean("is_legacy_saved", false))
                    .onFailure(err -> badRequest(request))
                    .onSuccess(res -> renderJson(request, new JsonObject()));
        }));
    }
}
