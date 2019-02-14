package fr.openent.diary;

import fr.openent.diary.controllers.*;
import fr.openent.diary.services.*;
import fr.openent.diary.services.impl.*;
import io.vertx.core.eventbus.EventBus;
import org.entcore.common.http.BaseServer;
import org.entcore.common.notification.TimelineHelper;
import org.entcore.common.storage.Storage;
import org.entcore.common.storage.StorageFactory;


public class Diary extends BaseServer {

	@Override
	public void start() throws Exception {
		super.start();
        final EventBus eb = getEventBus(vertx);
        Storage storage = new StorageFactory(vertx, config).getStorage();


        TimelineHelper timeline = new TimelineHelper(vertx, eb, config);
        final DiaryService diaryService = new DiaryServiceImpl();

        final NotifyServiceImpl notifyService = new NotifyServiceImpl(timeline,eb,getPathPrefix(config));
        final VisaServiceImpl visaService = new VisaServiceImpl(storage, eb, vertx, config);

        addController(new DiaryController(diaryService));
        addController(new VisaController(visaService, storage));
        addController(new SessionController(new SessionServiceImpl()));
        addController(new HomeworkController(new HomeworkServiceImpl("diary")));
        addController(new InspectorController(new InspectorServiceImpl()));
        addController(new ProgressionController(new ProgessionServiceImpl("diary")));
	}

}
