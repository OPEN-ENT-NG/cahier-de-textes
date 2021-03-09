package fr.openent.diary.eventbus;


import fr.openent.diary.helper.FutureHelper;
import fr.openent.diary.message.MessageResponseHandler;
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

public class Viescolaire {

    private String address = "viescolaire";
    private EventBus eb;

    private Viescolaire() {}

    public static Viescolaire getInstance() {
        return ViescolaireHolder.instance;
    }

    public void init(EventBus eb) {
        this.eb = eb;
    }


    public void getSchoolYearPeriod(String structureId, Handler<AsyncResult<JsonObject>> handler) {
        JsonObject action = new JsonObject()
                .put("structureId", structureId)
                .put("action", "periode.getSchoolYearPeriod");

        eb.send(address, action, MessageResponseHandler.messageJsonObjectHandler(FutureHelper.handlerJsonObject(handler)));
    }


    private static class ViescolaireHolder {
        private static final Viescolaire instance = new Viescolaire();

        private ViescolaireHolder() {}
    }
}
