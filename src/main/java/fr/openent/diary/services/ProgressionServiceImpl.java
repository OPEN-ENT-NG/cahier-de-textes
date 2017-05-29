package fr.openent.diary.services;

import fr.openent.diary.controllers.DiaryController;
import fr.openent.diary.model.GenericHandlerResponse;
import fr.openent.diary.model.HandlerResponse;
import fr.openent.diary.model.progression.LessonProgression;
import fr.openent.diary.model.progression.OrderLesson;
import fr.openent.diary.model.progression.Progression;
import fr.openent.diary.utils.SqlMapper;
import fr.openent.diary.utils.SqlQuery;
import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.sql.Sql;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;

import java.util.ArrayList;
import java.util.List;


public class ProgressionServiceImpl extends SqlCrudService {
    private final static String PROGRESION_DATABASE_TABLE ="progression";
    private final static String PROGRESION_DATABASE_TABLE_SC ="diary.progression";

    private final static String LESSON_PROGRESION_DATABASE_TABLE_SC ="diary.lessonprogression";

    private final SqlMapper<Progression> progressionMapper = new SqlMapper<>(Progression.class,PROGRESION_DATABASE_TABLE_SC,sql);
    private final SqlMapper<LessonProgression> lessonProgressionMapper = new SqlMapper<>(LessonProgression.class,LESSON_PROGRESION_DATABASE_TABLE_SC,sql);


    public ProgressionServiceImpl() {
        super(DiaryController.DATABASE_SCHEMA, PROGRESION_DATABASE_TABLE);

    }


    public void getProgressions(String teacherId, Handler<HandlerResponse<List<Progression>>> handler) {

        StringBuilder query = new StringBuilder();
        query.append("SELECT")
                .append(" p.id as id,")
                .append(" p.level as level,")
                .append(" p.title as title,")
                .append(" p.description as description,")
                .append(" p.teacherId as teacherId ")
                .append(" FROM diary.progression as p")
                .append(" WHERE p.teacherId = ?");

        JsonArray parameters = new JsonArray().add(Sql.parseId(teacherId));

        sql.prepared(query.toString(), parameters,progressionMapper.listMapper(handler));

    }

    public void createOrUpdateProgression(final Progression progression, final Handler<HandlerResponse<Progression>> handler) {
        try {
            if (progression.getId() == null) {
                progressionMapper.insert(progression, handler);
            } else {
                progressionMapper.update(progression, handler);
            }

        } catch (Throwable e) {
            handler.handle(new HandlerResponse<Progression>(e.getMessage()));
        }
    }


    public void getLessonProgression(String teacherId,Long progressionId, Handler<HandlerResponse<List<LessonProgression>>> handler) {

        StringBuilder query = new StringBuilder();
        query.append("SELECT")
                .append(" lp.id as id,")
                .append(" lp.type as type,")
                .append(" lp.title as title,")
                .append(" lp.description as description,")
                .append(" lp.subjectLabel as subjectLabel ,")
                .append(" lp.teacherName as teacherName ,")
                .append(" lp.color as color ,")
                .append(" lp.annotation as annotation ,")
                .append(" lp.orderIndex as orderIndex ,")
                .append(" lp.teacherId as teacherId ,")
                .append(" lp.homeworks as homeworks ,")
                .append(" lp.subject as subject ,")
                .append(" lp.attachments as attachments ,")
                .append(" lp.progressionId as progressionId ")
                .append(" FROM diary.lessonprogression as lp")
                .append(" WHERE lp.teacherId = ?" )
                .append(" and lp.progressionId = ? " );

        JsonArray parameters = new JsonArray().add(Sql.parseId(teacherId)).addNumber(progressionId);

        sql.prepared(query.toString(), parameters,lessonProgressionMapper.listMapper(handler));

    }


    public void createOrUpdateLessonProgression(final LessonProgression lessonProgression, final Handler<HandlerResponse<LessonProgression>> handler) {
        try {
            if (lessonProgression.getId() == null) {
                lessonProgressionMapper.insert(lessonProgression, handler);
            } else {
                lessonProgressionMapper.update(lessonProgression, handler);
            }

        } catch (Throwable e) {
            handler.handle(new HandlerResponse<LessonProgression>(e.getMessage()));
        }
    }


    public void updateOrderLessonProgression(final List<OrderLesson> orderLessons,final Handler<GenericHandlerResponse> handler){
        List<SqlQuery> queries = new ArrayList<>();

        for (OrderLesson orderLesson : orderLessons){
            JsonArray parameters = new JsonArray();
            parameters.add(orderLesson.getOrderIndex());
            parameters.add(orderLesson.getId());
            StringBuilder query = new StringBuilder();
            query.append("UPDATE  diary.lessonprogression ")
                    .append(" set orderIndex = ?")
                    .append("  where id = ?");

            queries.add(new SqlQuery(query.toString(),parameters));

        }

        lessonProgressionMapper.executeTransactionnalQueries(queries,handler);
    }
}
