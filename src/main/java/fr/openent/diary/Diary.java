package fr.openent.diary;

import fr.openent.diary.controllers.*;
import fr.openent.diary.db.DB;
import fr.openent.diary.eventbus.Viescolaire;
import fr.openent.diary.helper.NodePdfHelper;
import fr.openent.diary.repository.event.DiaryRepositoryEvents;
import fr.openent.diary.services.DiaryService;
import fr.openent.diary.services.impl.*;
import fr.openent.diary.worker.NotebookArchiveWorker;
import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.webutils.collections.SharedDataHelper;
import io.netty.util.concurrent.SucceededFuture;
import io.vertx.core.DeploymentOptions;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.eventbus.*;
import io.vertx.core.json.*;
import org.apache.commons.lang3.tuple.Pair;
import org.entcore.common.events.EventStore;
import org.entcore.common.events.EventStoreFactory;
import org.entcore.common.http.BaseServer;
import org.entcore.common.neo4j.Neo4j;
import org.entcore.common.notification.TimelineHelper;
import org.entcore.common.sql.Sql;
import org.entcore.common.storage.Storage;
import org.entcore.common.storage.StorageFactory;

import java.util.Map;

import static fr.wseduc.webutils.Utils.handlerToAsyncHandler;


public class Diary extends BaseServer {
    public final static String DIARY_SCHEMA = "diary";
    public final static String VIESCO_SCHEMA = "viesco";
    public final static String SEARCH = "diary.search";

    public static int PAGE_SIZE = 20;

	@Override
	public void start(Promise<Void> startPromise) throws Exception {
        final Promise<Void> promise = Promise.promise();
        super.start(promise);
        promise.future()
                .compose(init -> StorageFactory.build(vertx, config))
                .compose(storageFactory -> initDiary(storageFactory))
                .onComplete(startPromise);
    }

    private Future<Void> initDiary(StorageFactory storageFactory) {
        DB.getInstance().init(Neo4j.getInstance(), Sql.getInstance(), MongoDb.getInstance());

        final EventBus eb = getEventBus(vertx);
        Storage storage = storageFactory.getStorage();

        TimelineHelper timeline = new TimelineHelper(vertx, eb, config);
        final DiaryService diaryService = new DiaryServiceImpl();

        final NotifyServiceImpl notifyService = new NotifyServiceImpl(timeline,eb,getPathPrefix(config));
        final VisaServiceImpl visaService = new VisaServiceImpl(storage, eb, vertx, config);

        EventStore eventStore = EventStoreFactory.getFactory().getEventStore(Diary.class.getSimpleName());


        NodePdfHelper.getInstance().init(vertx, config);

        addController(new DiaryController(diaryService, eventStore));

        /* diary controller named as Notebook */
        addController(new NotebookController(eb, vertx, storage, config));

        addController(new InitController(new DefautlInitService("diary", eb)));
        addController(new VisaController(visaService, storage));
        addController(new SessionController(new SessionServiceImpl(eb, eventStore)));
        addController(new HomeworkController(new HomeworkServiceImpl("diary", eb, eventStore)));
        addController(new SessionsHomeworkController(new DefaultSessionsHomeworkService(eb, eventStore)));
        addController(new InspectorController(new InspectorServiceImpl()));
        addController(new ProgressionController(new ProgessionServiceImpl("diary")));
        addController(new SearchController(eb));
        addController(new SubjectController(new DefaultSubjectService(eb)));
        addController(new ConfigController());
        addController(new NotebookArchiveController(eb, vertx, storage));

        // add right controller
        addController(new FakeRight());

        // Repository Events
        setRepositoryEvents(new DiaryRepositoryEvents(eb));

        // Event Bus
        Viescolaire.getInstance().init(eb);

        // Worker
        vertx.deployVerticle(NotebookArchiveWorker.class, new DeploymentOptions().setConfig(config).setWorker(true));
        return Future.succeededFuture();
    }

    public static void launchNotebookArchiveWorker(EventBus eb, JsonObject params) {
	    eb.request(NotebookArchiveWorker.class.getName(), params,
                new DeliveryOptions().setSendTimeout(1000 * 1000L), handlerToAsyncHandler(eventExport -> {
                        if(!eventExport.body().getString("status").equals("ok")) {
                            launchNotebookArchiveWorker(eb, params);
                        }
                    }
                ));
    }
}
