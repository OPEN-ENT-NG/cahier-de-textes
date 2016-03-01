package fr.openent.diary;

import fr.openent.diary.controllers.DiaryController;
import fr.openent.diary.controllers.LessonController;
import fr.openent.diary.services.DiaryService;
import fr.openent.diary.services.DiaryServiceImpl;
import fr.openent.diary.services.HomeworkService;
import fr.openent.diary.services.HomeworkServiceImpl;
import fr.openent.diary.services.LessonService;
import fr.openent.diary.services.LessonServiceImpl;
import org.entcore.common.http.BaseServer;


public class Diary extends BaseServer {

	@Override
	public void start() {
		super.start();

        final DiaryService diaryService = new DiaryServiceImpl();
        final LessonService lessonService = new LessonServiceImpl();
        final HomeworkService homeworkService = new HomeworkServiceImpl();

        addController(new DiaryController(diaryService, lessonService, homeworkService));
        addController(new LessonController(lessonService));
	}

}
