package fr.openent.diary;

import fr.openent.diary.controllers.DiaryController;
import fr.openent.diary.controllers.HomeworkController;
import fr.openent.diary.controllers.LessonController;
import fr.openent.diary.services.*;
import org.entcore.common.http.BaseServer;


public class Diary extends BaseServer {

	@Override
	public void start() {
		super.start();

        final DiaryService diaryService = new DiaryServiceImpl();
        final AudienceService audienceSercice = new AudienceServiceImpl();
        final LessonService lessonService = new LessonServiceImpl(diaryService, audienceSercice);
        final HomeworkService homeworkService = new HomeworkServiceImpl(diaryService);

        addController(new DiaryController(diaryService, lessonService, homeworkService));
        addController(new LessonController(lessonService, diaryService, audienceSercice));
        addController(new HomeworkController(homeworkService, lessonService));
	}

}
