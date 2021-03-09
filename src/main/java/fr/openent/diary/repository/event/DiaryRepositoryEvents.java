package fr.openent.diary.repository.event;


import fr.openent.diary.*;
import io.vertx.core.eventbus.*;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.user.RepositoryEvents;

public class DiaryRepositoryEvents implements RepositoryEvents {

    private static final Logger log = LoggerFactory.getLogger(DiaryRepositoryEvents.class);

    private EventBus eb;

    public DiaryRepositoryEvents(EventBus eb) {
        this.eb = eb;
    }

    @Override
    public void deleteGroups(JsonArray jsonArray) {
        log.info("[Diary@DiaryRepositoryEvents::deleteGroups] Delete groups event is not implemented");
    }

    @Override
    public void deleteUsers(JsonArray jsonArray) {
        log.info("[Diary@DiaryRepositoryEvents::deleteUsers] Delete users event is not implemented");
    }

    @Override
    public void transition(JsonObject structure) {
        Diary.launchNotebookArchiveWorker(eb, new JsonObject().put("structure", structure));
    }
}
