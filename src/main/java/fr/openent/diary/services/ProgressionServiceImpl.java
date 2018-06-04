package fr.openent.diary.services;

import fr.openent.diary.controllers.DiaryController;
import fr.openent.diary.model.GenericHandlerResponse;
import fr.openent.diary.model.HandlerResponse;
import fr.openent.diary.model.progression.LessonProgression;
import fr.openent.diary.model.progression.OrderLesson;
import fr.openent.diary.model.progression.Progression;
import fr.openent.diary.model.util.CountModel;
import fr.openent.diary.utils.HandlerUtils;
import fr.openent.diary.utils.SqlMapper;
import fr.openent.diary.utils.SqlQuery;
import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.sql.Sql;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;

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
                .append(" p.teacherId as teacherId ,")
                .append(" (select count(*) from diary.lessonprogression where progressionId = p.id ) as nbLessons ")
                .append(" FROM diary.progression as p")
                .append(" WHERE p.teacherId = ?");

        JsonArray parameters = new fr.wseduc.webutils.collections.JsonArray().add(Sql.parseId(teacherId));

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
            HandlerUtils.error(e,handler);
        }
    }

    public void getLesson(String teacherId,Long lessonId, Handler<HandlerResponse<LessonProgression>> handler) {

        StringBuilder query = new StringBuilder();
        query.append("SELECT")
                .append(" lp.id as id,")
                .append(" lp.type as type,")
                .append(" lp.title as title,")
                .append(" lp.description as description,")
                .append(" lp.subjectLabel as subjectLabel ,")
                .append(" lp.teacherName as teacherName ,")
                .append(" lp.color as color ,")
                .append(" lp.annotations as annotations ,")
                .append(" lp.orderIndex as orderIndex ,")
                .append(" lp.teacherId as teacherId ,")
                .append(" lp.homeworks as homeworks ,")
                .append(" lp.subject as subject ,")
                .append(" lp.attachments as attachments ,")
                .append(" lp.progressionId as progressionId ")
                .append(" FROM diary.lessonprogression as lp")
                .append(" WHERE lp.teacherId = ?" )
                .append(" and lp.id = ? " );

        JsonArray parameters = new fr.wseduc.webutils.collections.JsonArray().add(Sql.parseId(teacherId)).add(lessonId);
        sql.prepared(query.toString(), parameters,lessonProgressionMapper.objectMapper(handler));
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
                .append(" lp.annotations as annotations ,")
                .append(" lp.orderIndex as orderIndex ,")
                .append(" lp.teacherId as teacherId ,")
                .append(" lp.homeworks as homeworks ,")
                .append(" lp.subject as subject ,")
                .append(" lp.attachments as attachments ,")
                .append(" lp.progressionId as progressionId ")
                .append(" FROM diary.lessonprogression as lp")
                .append(" WHERE lp.teacherId = ?" )
                .append(" and lp.progressionId = ? " );

        JsonArray parameters = new fr.wseduc.webutils.collections.JsonArray().add(Sql.parseId(teacherId)).add(progressionId);

        sql.prepared(query.toString(), parameters,lessonProgressionMapper.listMapper(handler));

    }


    public void createOrUpdateLessonProgression(final LessonProgression lessonProgression, final Handler<HandlerResponse<LessonProgression>> handler) {
        try {
            if (lessonProgression.getId() == null) {
                getOrderIndex(lessonProgression.getProgressionId(), new Handler<HandlerResponse<CountModel>>() {
                    @Override
                    public void handle(HandlerResponse<CountModel> event) {
                        try {
                            HandlerUtils.checkError(event,handler);
                            Long count = event.getResult().getNb();
                            if (count == null){
                                count = 0L;
                            }else{
                                count ++;
                            }
                            lessonProgression.setOrderIndex(count);
                            lessonProgressionMapper.insert(lessonProgression, handler);

                        } catch (Throwable e) {
                            HandlerUtils.error(e,handler);
                        }
                    }
                });

            } else {
                lessonProgressionMapper.update(lessonProgression, handler);
            }
        } catch (Throwable e) {
            HandlerUtils.error(e,handler);
        }

    }


    public void deleteProgression(final Long progressionId,final Handler<GenericHandlerResponse> handler){
        List<SqlQuery> queries = new ArrayList<>();

        // lessons part
        StringBuilder query = new StringBuilder();
        query.append("DELETE FROM diary.progression ")
                .append("  where id = ?");
        JsonArray parameters = new fr.wseduc.webutils.collections.JsonArray();
        parameters.add(progressionId);

        queries.add(new SqlQuery(query.toString(),parameters));

        // progression part
        StringBuilder queryProgression = new StringBuilder();
        queryProgression.append("DELETE FROM diary.lessonprogression ")
                .append("  where progressionid = ?");
        JsonArray parametersProgression = new fr.wseduc.webutils.collections.JsonArray();
        parametersProgression.add(progressionId);

        queries.add(new SqlQuery(queryProgression.toString(),parametersProgression));

        lessonProgressionMapper.executeTransactionnalQueries(queries,handler);
    }

    public void deleteLessonProgression(final List<Long> lessonsIds,final Handler<GenericHandlerResponse> handler){

        StringBuilder queryProgression = new StringBuilder();
        queryProgression.append("DELETE FROM diary.lessonprogression ")
                .append("  where id in ").append(Sql.listPrepared(lessonsIds.toArray()));

        JsonArray parameters = new fr.wseduc.webutils.collections.JsonArray();
        for (Long id : lessonsIds) {
            parameters.add(id);
        }

        lessonProgressionMapper.executeQuery(new SqlQuery(queryProgression.toString(),parameters),handler);
    }

    public void updateOrderLessonProgression(final List<OrderLesson> orderLessons,final Handler<GenericHandlerResponse> handler){
        List<SqlQuery> queries = new ArrayList<>();

        for (OrderLesson orderLesson : orderLessons){
            JsonArray parameters = new fr.wseduc.webutils.collections.JsonArray();
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



    public void getOrderIndex(final Long progressionId, final Handler<HandlerResponse<CountModel>> handler){
        StringBuilder query = new StringBuilder();


        query.append("SELECT")
                .append("  max(orderIndex) as nb ")
                .append(" FROM diary.lessonprogression ")
                .append(" WHERE progressionId = ?");


        JsonArray parameters = new fr.wseduc.webutils.collections.JsonArray().add(progressionId);

        sql.prepared(query.toString(), parameters,SqlMapper.objectMapper(handler,CountModel.class));
    }
}
