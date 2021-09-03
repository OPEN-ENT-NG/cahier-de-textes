package fr.openent.diary.security.workflow;


import fr.openent.diary.security.WorkflowUtils;
import fr.wseduc.webutils.http.Binding;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import org.entcore.common.http.filter.ResourcesProvider;
import org.entcore.common.user.UserInfos;

import java.util.*;

public class SearchRight implements ResourcesProvider {
    @Override
    public void authorize(HttpServerRequest httpServerRequest, Binding binding, UserInfos user, Handler<Boolean> handler) {
        String structureId = httpServerRequest.params().get("structureId");
        List<String> structures = user.getStructures();
        handler.handle(structures.contains(structureId) && WorkflowUtils.hasRight(user, WorkflowUtils.DIARY_SEARCH));
    }
}
