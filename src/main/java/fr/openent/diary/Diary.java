package fr.openent.diary;

import fr.openent.diary.controllers.*;
import fr.openent.diary.services.DiaryService;
import fr.openent.diary.services.impl.*;
import io.vertx.core.eventbus.EventBus;
import org.entcore.common.events.EventStore;
import org.entcore.common.events.EventStoreFactory;
import org.entcore.common.http.BaseServer;
import org.entcore.common.notification.TimelineHelper;
import org.entcore.common.storage.Storage;
import org.entcore.common.storage.StorageFactory;


public class Diary extends BaseServer {
    public final static String DIARY_SCHEMA = "diary";
    public final static String VIESCO_SCHEMA = "viesco";
    public final static String SEARCH = "diary.search";

    public static int PAGE_SIZE = 20;

	@Override
	public void start() throws Exception {
		super.start();
        final EventBus eb = getEventBus(vertx);
        Storage storage = new StorageFactory(vertx, config).getStorage();


        TimelineHelper timeline = new TimelineHelper(vertx, eb, config);
        final DiaryService diaryService = new DiaryServiceImpl();

        final NotifyServiceImpl notifyService = new NotifyServiceImpl(timeline,eb,getPathPrefix(config));
        final VisaServiceImpl visaService = new VisaServiceImpl(storage, eb, vertx, config);

        EventStore eventStore = EventStoreFactory.getFactory().getEventStore(Diary.class.getSimpleName());


        addController(new DiaryController(diaryService, eventStore));

        /* diary controller named as Notebook */
        addController(new NotebookController(eb));

        addController(new InitController(new DefautlInitService("diary", eb)));
        addController(new VisaController(visaService, storage));
        addController(new SessionController(new SessionServiceImpl(eb, eventStore)));
        addController(new HomeworkController(new HomeworkServiceImpl("diary", eb, eventStore)));
        addController(new SessionsHomeworkController(new DefaultSessionsHomeworkService(eb, eventStore)));
        addController(new InspectorController(new InspectorServiceImpl()));
        addController(new ProgressionController(new ProgessionServiceImpl("diary")));
        addController(new SearchController(eb));
        addController(new SubjectController(new DefaultSubjectService(eb)));

        // add right controller
        addController(new FakeRight());
    }

}
