package fr.openent.diary;

import fr.openent.diary.controllers.DiaryController;
import fr.openent.diary.controllers.HomeworkController;
import fr.openent.diary.controllers.LessonController;
import fr.openent.diary.controllers.ModelWeekController;
import fr.openent.diary.services.*;
import org.entcore.common.http.BaseServer;
import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.share.impl.SqlShareService;
import org.entcore.common.sql.SqlConf;
import org.entcore.common.sql.SqlConfs;
import org.vertx.java.core.eventbus.EventBus;
import org.vertx.java.core.json.JsonArray;


public class Diary extends BaseServer {

    public static final String DATABASE_SCHEMA = "diary";
    public final static String LESSON_TABLE = "lesson";
    public final static String LESSON_SHARE_TABLE = "lesson_shares";
    public final static String HOMEWORK_TABLE = "homework";
    public final static String HOMEWORK_SHARE_TABLE = "homework_shares";

	@Override
	public void start() {
		super.start();
        final EventBus eb = getEventBus(vertx);

        final DiaryService diaryService = new DiaryServiceImpl();
        final AudienceService audienceService = new AudienceServiceImpl();
        final LessonService lessonService = new LessonServiceImpl(diaryService, audienceService);
        final HomeworkService homeworkService = new HomeworkServiceImpl(diaryService, audienceService);
        final ModelWeekServiceImpl modelWeekService = new ModelWeekServiceImpl(lessonService);

        addController(new DiaryController(diaryService, lessonService, homeworkService));
        addController(new ModelWeekController(modelWeekService));
        SqlConf confLesson = SqlConfs.createConf(LessonController.class.getName());
        confLesson.setTable(LESSON_TABLE);
        confLesson.setShareTable(LESSON_SHARE_TABLE);
        confLesson.setSchema(DATABASE_SCHEMA);
        LessonController lessonController = new LessonController(lessonService, homeworkService, diaryService, audienceService);

        SqlCrudService lessonSqlCrudService = new SqlCrudService(DATABASE_SCHEMA, LESSON_TABLE, LESSON_SHARE_TABLE,
                new JsonArray().addString("*"), new JsonArray().add("*"), true);
        lessonController.setCrudService(lessonSqlCrudService);
        lessonController.setShareService(new SqlShareService(DATABASE_SCHEMA, LESSON_SHARE_TABLE, eb,
                securedActions, null));

        addController(lessonController);

        SqlConf confHomework = SqlConfs.createConf(HomeworkController.class.getName());
        confHomework.setTable(HOMEWORK_TABLE);
        confHomework.setShareTable(HOMEWORK_SHARE_TABLE);
        confHomework.setSchema(DATABASE_SCHEMA);
        HomeworkController homeworkController = new HomeworkController(homeworkService, lessonService, audienceService);

        SqlCrudService homeworkSqlCrudService = new SqlCrudService(DATABASE_SCHEMA, HOMEWORK_TABLE, HOMEWORK_SHARE_TABLE,
                new JsonArray().addString("*"), new JsonArray().add("*"), true);
        homeworkController.setCrudService(homeworkSqlCrudService);
        homeworkController.setShareService(new SqlShareService(DATABASE_SCHEMA, HOMEWORK_SHARE_TABLE, eb,
                securedActions, null));

        addController(homeworkController);
	}

}
