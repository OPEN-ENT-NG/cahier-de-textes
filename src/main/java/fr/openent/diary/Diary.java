package fr.openent.diary;

import fr.openent.diary.controllers.*;
import fr.openent.diary.services.*;
import io.vertx.core.eventbus.EventBus;
import org.entcore.common.http.BaseServer;
import org.entcore.common.notification.TimelineHelper;


public class Diary extends BaseServer {

	@Override
	public void start() throws Exception {
		super.start();
        final EventBus eb = getEventBus(vertx);

        TimelineHelper timeline = new TimelineHelper(vertx, eb, config);
        final DiaryService diaryService = new DiaryServiceImpl();

        final NotifyServiceImpl notifyService = new NotifyServiceImpl(timeline,eb,getPathPrefix(config));
        final VisaServiceImpl visaService = new VisaServiceImpl();

        addController(new DiaryController(diaryService));
        addController(new VisaController(visaService));
        addController(new SessionController(new SessionServiceImpl()));
        addController(new HomeworkController(new HomeworkServiceImpl()));
        addController(new InspectorController(new InspectorServiceImpl()));
	}

}
