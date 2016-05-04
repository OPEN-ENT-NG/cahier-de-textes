package fr.openent.diary.controllers;

import fr.wseduc.webutils.Either;
import org.entcore.common.controller.ControllerHelper;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;

import java.util.List;


/**
 * Created by a457593 on 04/05/2016.
 */
public abstract class SharedResourceController extends ControllerHelper {

    private final static Logger log = LoggerFactory.getLogger(SharedResourceController.class);

    private int NUMBER_OF_CALLS = 0;

    protected void shareResource(String ownerId, List<String> membersId, String resourceId, List<String> actions,
                                 final Handler<Either<String, JsonObject>> handler) {
        NUMBER_OF_CALLS = membersId.size();

        for (String memberId: membersId) {
            SharedResourceController.this.shareService.groupShare(ownerId, memberId, resourceId, actions, new Handler<Either<String, JsonObject>>() {
                @Override
                public void handle(Either<String, JsonObject> event) {
                    if(event.isRight()) {
                        int remainingCalls = numberOfWaitingResponses();
                        if (remainingCalls == 0){
                            log.debug("Handle callback.");
                            handler.handle(event.right());
                        } else {
                            log.debug("Not the last call to complete.");
                            return;
                        }
                    } else {
                        //TODO handle only once if multiple calls are errors
                        log.debug("Handle error callback.");
                        handler.handle(event.left());
                    }
                }
            });
        }

    }

    private int numberOfWaitingResponses() {
        log.debug("Decrement number of calls, number was :" + String.valueOf(NUMBER_OF_CALLS));
        return NUMBER_OF_CALLS--;
    }
}
