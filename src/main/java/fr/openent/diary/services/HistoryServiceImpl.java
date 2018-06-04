package fr.openent.diary.services;

import fr.openent.diary.controllers.DiaryController;
import fr.openent.diary.model.GenericHandlerResponse;
import fr.openent.diary.model.HandlerResponse;
import fr.openent.diary.model.history.HistoryFilterMapping;
import fr.openent.diary.model.history.HistoryModel;
import fr.openent.diary.model.lessonview.HomeworkModel;
import fr.openent.diary.model.lessonview.LessonModel;
import fr.openent.diary.model.progression.Progression;
import fr.openent.diary.model.util.KeyValueModel;
import fr.openent.diary.model.visa.VisaModel;
import fr.openent.diary.utils.HandlerUtils;
import fr.openent.diary.utils.SqlMapper;
import fr.openent.diary.utils.SqlQuery;
import fr.openent.diary.utils.StringUtils;
import org.entcore.common.service.impl.SqlCrudService;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;

import java.util.*;

/**
 * Created by A664240 on 20/06/2017.
 */
public class HistoryServiceImpl extends SqlCrudService {

    private final SqlMapper<VisaModel> histoMapper = new SqlMapper<>(Progression.class,"diary.histo_lesson",sql);
    private final static String PROGRESION_DATABASE_TABLE = "histo_lesson";

    public HistoryServiceImpl() {
        super(DiaryController.DATABASE_SCHEMA, PROGRESION_DATABASE_TABLE);
    }

    public void archive(String yearLabel,  final Handler<GenericHandlerResponse> handler){

        List<SqlQuery> queries = createArchiveQueries(yearLabel);
        histoMapper.executeTransactionnalQueries(queries,handler);
    }

    public void archiveAndClean(String yearLabel,  final Handler<GenericHandlerResponse> handler){

        List<SqlQuery> queries = createArchiveQueries(yearLabel);
        queries.add( createTuncateQueries());
        histoMapper.executeTransactionnalQueries(queries,handler);
    }

    public void cleanDatabase(final Handler<GenericHandlerResponse> handler){
        SqlQuery query = createTuncateQueries();
        histoMapper.executeTransactionnalQueries(Arrays.asList(query),handler);
    }


    private List<SqlQuery> createArchiveQueries(String yearLabel){
        final List<SqlQuery> queries = new ArrayList<>();

        StringBuilder queryLesson = new StringBuilder();
        JsonArray parametersLesson = new fr.wseduc.webutils.collections.JsonArray().add(yearLabel);
        /*
           Lesson part
        */
        queryLesson.append(" insert into diary.histo_lesson ")
                .append(" select ")
                .append(" ? as yearLabel, ")
                .append(" l.id as lessonId, ")
                .append(" l.lesson_title as title, ")
                .append(" l.lesson_room as room, ")
                .append(" l.lesson_date as date, ")
                .append(" l.lesson_start_time as start, ")
                .append(" l.lesson_end_time as end, ")
                .append(" l.lesson_description as description, ")
                .append(" l.lesson_annotation as annotation, ")
                .append(" t.id as teacherId, ")
                .append(" t.teacher_display_name as teacherName, ")
                .append(" s.id as subjectId, ")
                .append(" s.subject_label as subjectLabel, ")
                .append(" a.id as audienceId, ")
                .append(" a.audience_label as audienceLabel, ")
                .append(" l.school_id as structureId ")
                .append(" from diary.lesson l ")
                .append(" join diary.teacher t on t.id = l.teacher_id ")
                .append(" join diary.subject s on s.id = l.subject_id ")
                .append(" join diary.audience a on a.id = l.audience_id ")
                .append(" where l.lesson_state = 'published' ")
                .append(" and not exists (select 1 from diary.histo_lesson h where l.id = h.lessonId) ");

        queries.add(new SqlQuery(queryLesson.toString(),parametersLesson));


        StringBuilder queryHomework = new StringBuilder();
        JsonArray parametersHomework = new fr.wseduc.webutils.collections.JsonArray().add(yearLabel);
        /*
           Homework part
        */
        queryLesson.append(" insert into diary.histo_homework ")
                .append(" select ")
                .append(" ? as yearLabel, ")
                .append(" h.id as homeworkId, ")
                .append(" h.lesson_id as lesson_id, ")
                .append(" h.homework_title as title, ")
                .append(" h.homework_description as description, ")
                .append(" h.homework_due_date as date, ")
                .append(" type.id as typeId, ")
                .append(" type.homework_type_label as typeLabel, ")
                .append(" t.id as teacherId, ")
                .append(" t.teacher_display_name as teacherName, ")
                .append(" s.id as subjectId, ")
                .append(" s.subject_label as subjectLabel, ")
                .append(" a.id as audienceId, ")
                .append(" a.audience_label as audienceLabel, ")
                .append(" h.school_id as structureId ")
                .append(" from diary.homework h ")
                .append(" join diary.teacher t on t.id = h.teacher_id ")
                .append(" join diary.subject s on s.id = h.subject_id ")
                .append(" join diary.audience a on a.id = h.audience_id ")
                .append(" join diary.homework_type type on type.id = h.homework_type_id ")
                .append(" where h.homework_state = 'published' ")
                .append(" and not exists (select 1 from diary.histo_homework hh where h.id = hh.homeworkId) ");

        queries.add(new SqlQuery(queryHomework.toString(),parametersHomework));


        StringBuilder queryVisa = new StringBuilder();
        JsonArray parametersVisa = new fr.wseduc.webutils.collections.JsonArray().add(yearLabel);
        /*
           visa part
        */
        queryVisa.append(" insert into diary.histo_visa ")
                .append(" select ")
                .append(" ? as yearLabel, ")
                .append("* ")
                .append(" from diary.visa h ");


        queries.add(new SqlQuery(queryVisa.toString(),parametersVisa));


        StringBuilder queryVisaLesson = new StringBuilder();
        JsonArray parametersVisaLesson = new fr.wseduc.webutils.collections.JsonArray().add(yearLabel);
        /*
           visa lesson part
        */
        queryVisaLesson.append(" insert into diary.histo_visa_lesson ")
                .append(" select ")
                .append(" ? as yearLabel, ")
                .append("* ")
                .append(" from diary.visa_lesson h ");


        queries.add(new SqlQuery(queryVisaLesson.toString(),parametersVisaLesson));


        return queries;
    }

    private SqlQuery createTuncateQueries(){
        return new SqlQuery(new StringBuffer()
                .append("delete from  diary.modelweek;")
                .append("delete from  diary.lesson_has_attachment;")
                .append("delete from  diary.homework_has_attachment;")
                .append("delete from  diary.attachment;")
                .append("delete from  diary.lesson_shares;")
                .append("delete from  diary.homework_shares;")
                .append("delete from  diary.homework;")
                .append("delete from  diary.lesson;")
                //subject is use by progression mechanics
                //.append("delete from  diary.subject;")
                .append("delete from  diary.homework_type;")
                .append("delete from  diary.audience;")
                .append("delete from  diary.groups;")
                .append("delete from  diary.members;")
                .append("delete from  diary.users;")
                .append("delete from  diary.teacher;")
                .append("delete from  diary.visa_lesson;")
                .append("delete from  diary.visa;")
                .toString()
                ,new fr.wseduc.webutils.collections.JsonArray());
    }



    public void getFilters(String strucutreId,String teacherId, final Handler<HandlerResponse<List<HistoryModel>>> handler){
        queryFilters(strucutreId, teacherId,new Handler<HandlerResponse<List<HistoryFilterMapping>>>() {
            @Override
            public void handle(HandlerResponse<List<HistoryFilterMapping>> event) {
                HandlerUtils.checkError(event,handler);
                Map<String,HistoryModel> map = new HashMap<String, HistoryModel>();
                for (HistoryFilterMapping historyFilterMapping : event.getResult()){
                    if (map.get(historyFilterMapping.getYearLabel()) == null){
                        map.put(historyFilterMapping.getYearLabel(), new HistoryModel());
                    }

                    HistoryModel historyModel = map.get(historyFilterMapping.getYearLabel());
                    historyModel.setYearLabel(historyFilterMapping.getYearLabel());
                    List<KeyValueModel> toAdd;
                    if (historyFilterMapping.getType().equals("teacher")){
                        toAdd =historyModel.getTeachers();
                    }else{
                        toAdd =historyModel.getAudiences();
                    }

                    toAdd.add(new KeyValueModel(historyFilterMapping.getId(),historyFilterMapping.getLabel()));
                }

                HandlerUtils.renderResponse(handler,new ArrayList<HistoryModel>(map.values()));
            }
        });
    }

    private void queryFilters(String structureId,String teacherId,final Handler<HandlerResponse<List<HistoryFilterMapping>>> handler){

        StringBuffer query = new StringBuffer();
        JsonArray parameters = new fr.wseduc.webutils.collections.JsonArray();
        query.append("select distinct yearLabel as yearLabel ,'teacher' as type, teacherId as id, teacherName as label from diary.histo_lesson where structureId = ? ");
        parameters.add(structureId);
        if (teacherId!=null){
            query.append(" and teacherId = ? ");
            parameters.add(teacherId);
        }

        query.append(" union ");
        query.append(" select distinct yearLabel as yearLabel,'teacher' as type, teacherId as id,  teacherName as label from diary.histo_homework where structureId = ? ");
        parameters.add(structureId);
        if (teacherId!=null){
            query.append(" and teacherId = ? ");
            parameters.add(teacherId);
        }

        query.append(" union ");
        query.append(" select distinct yearLabel as yearLabel ,'audience' as type, audienceId as id,  audienceLabel as label from diary.histo_lesson where structureId = ? ");
        parameters.add(structureId);
        if (teacherId!=null){
            query.append(" and teacherId = ? ");
            parameters.add(teacherId);
        }

        query.append(" union ");
        query.append(" select distinct yearLabel as yearLabel,'audience' as type,  audienceId as id,  audienceLabel as label from diary.histo_homework where structureId = ? ");
        parameters.add(structureId);
        if (teacherId!=null){
            query.append(" and teacherId = ? ");
            parameters.add(teacherId);
        }

        query.append(" order by yearLabel ");

        sql.prepared(query.toString(), parameters ,SqlMapper.listMapper(handler,HistoryFilterMapping.class));
    }





    public void getLessons(String yearLabel, String teacherId, String audienceId, final Handler<HandlerResponse<List<LessonModel>>> handler) {
        final Map<String,Object> promisesResult = new HashMap<>();

        getVisaSelectLesson( yearLabel,  teacherId,  audienceId, new Handler<HandlerResponse<List<LessonModel>>>() {
            @Override
            public void handle(HandlerResponse<List<LessonModel>> event) {
                HandlerUtils.checkError(event,handler);
                promisesResult.put("LESSON",event.getResult());
                if (promisesResult.size() == 2){
                    HandlerUtils.renderResponse(handler,attachHomeworkLesson(promisesResult));
                }
            }
        });

        getVisaSelectHomework( yearLabel,  teacherId,  audienceId, new Handler<HandlerResponse<Map<String, List<HomeworkModel>>>>() {
            @Override
            public void handle(HandlerResponse<Map<String, List<HomeworkModel>>> event) {
                HandlerUtils.checkError(event,handler);
                promisesResult.put("HOMEWORK",event.getResult());
                if (promisesResult.size() == 2){
                    HandlerUtils.renderResponse(handler,attachHomeworkLesson(promisesResult));
                }
            }
        });
    }

    public List<LessonModel> attachHomeworkLesson(Map<String,Object> promisesResult ){
        List<LessonModel> lessons =  (List<LessonModel>)promisesResult.get("LESSON");
        Map<String, List<HomeworkModel>> homeWorks =  (Map<String, List<HomeworkModel>>)promisesResult.get("HOMEWORK");

        for (LessonModel lesson : lessons){
            lesson.setDescription(StringUtils.cleanHtml(lesson.getDescription()));
            if (homeWorks.get(lesson.getLessonId())!=null){
                lesson.setHomeworks(homeWorks.get(lesson.getLessonId()));
            }
        }

        return lessons;
    }

    private void getVisaSelectHomework(String yearLabel, String teacherId, String audienceId, final Handler<HandlerResponse<Map<String,List<HomeworkModel>>>> handler){
        StringBuilder query = new StringBuilder();
        JsonArray parameters = new fr.wseduc.webutils.collections.JsonArray();


        query.append(" select ")
                .append(" lessonId as lessonId, ")
                .append(" homeWorkId as homeworkId, ")
                .append(" description as description, ")
                .append(" date as date ")
                .append(" from diary.histo_homework ")
                .append(" where lessonId is not null ")
                .append(" and  yearLabel = ?  ");

        parameters.add(yearLabel);


        if (teacherId != null ){
            query.append(" and teacherId= ? ");
            parameters.add(teacherId);
        }

        if (audienceId != null ){
            query.append(" and audienceId= ? ");
            parameters.add(audienceId);
        }

        query.append(" order by date desc");

        sql.prepared(query.toString(), parameters, SqlMapper.listMapper(new Handler<HandlerResponse<List<HomeworkModel>>>() {
            @Override
            public void handle(HandlerResponse<List<HomeworkModel>> event) {

                HandlerUtils.checkError(event,handler);

                Map<String,List<HomeworkModel>> homeworkMap =new HashMap<String, List<HomeworkModel>>();
                for (HomeworkModel homeworkModel : event.getResult()){
                    homeworkModel.setDescription(StringUtils.cleanHtml(homeworkModel.getDescription()));
                    if (homeworkMap.get(homeworkModel.getLessonId()) == null){
                        homeworkMap.put(homeworkModel.getLessonId(), new ArrayList<HomeworkModel>());
                    }
                    homeworkMap.get(homeworkModel.getLessonId()).add(homeworkModel);
                }

                HandlerUtils.renderResponse(handler,homeworkMap);

            }
        }, HomeworkModel.class));
    }


    private void getVisaSelectLesson(String yearLabel, String teacherId, String audienceId, final Handler<HandlerResponse<List<LessonModel>>> handler){
        StringBuilder query = new StringBuilder();
        JsonArray parameters = new fr.wseduc.webutils.collections.JsonArray();

        query.append(" select l.lessonId , ")
                .append(" l.audienceLabel as audienceLabel, ")
                .append(" l.teacherName as teacherName, ")
                .append(" l.subjectLabel as subject, ")
                .append(" l.date as date, ")
                .append(" to_char(l.startTime, 'HH12:MI') as startTime, ")
                .append(" to_char(l.endTime, 'HH12:MI') as endTime, ")
                .append(" l.title as title, ")
                .append(" l.description as description , ")
                .append(" v.comment as visaComment, ")
                .append(" v.ownername as visaOwnerName, ")
                .append(" v.ownertype as visaOwnerType, ")
                .append(" v.datecreate as visaDate ")
                .append(" from diary.histo_lesson l ")
                .append(" left outer join diary.histo_visa_lesson vl on vl.lesson_id = l.lessonId ")
                .append(" left outer join diary.histo_visa v on v.id = ( select max(vl2.visa_id) from diary.histo_visa_lesson vl2 where vl2.lesson_id = l.lessonId) ")
                .append(" where l.yearLabel = ? ");


        parameters.add(yearLabel);


        if (teacherId != null ){
            query.append(" and l.teacherId= ? ");
            parameters.add(teacherId);
        }

        if (audienceId != null ){
            query.append(" and l.audienceId= ? ");
            parameters.add(audienceId);
        }

        query.append(" order by date desc");

        sql.prepared(query.toString(), parameters, SqlMapper.listMapper(handler, LessonModel.class));
    }

}
