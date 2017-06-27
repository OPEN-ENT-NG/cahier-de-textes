package fr.openent.diary.services;

import fr.openent.diary.controllers.DiaryController;
import fr.openent.diary.model.GenericHandlerResponse;
import fr.openent.diary.model.HandlerResponse;
import fr.openent.diary.model.lessonview.HomeworkModel;
import fr.openent.diary.model.lessonview.LessonModel;
import fr.openent.diary.model.progression.Progression;
import fr.openent.diary.model.util.KeyValueModel;
import fr.openent.diary.model.visa.*;
import fr.openent.diary.utils.*;
import fr.wseduc.webutils.Either;
import org.entcore.common.neo4j.Neo4j;
import org.entcore.common.service.impl.SqlCrudService;
import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import java.util.*;

import static org.entcore.common.sql.SqlResult.validUniqueResultHandler;


public class VisaServiceImpl extends SqlCrudService {
    private final static String PROGRESION_DATABASE_TABLE = "lesson";
    //private final static String PROGRESION_DATABASE_TABLE_SC ="diary.lesson";

    private final SqlMapper<VisaModel> visaMapper = new SqlMapper<>(Progression.class,"diary.visa",sql);

    private final Neo4j neo = Neo4j.getInstance();
    public VisaServiceImpl() {
        super(DiaryController.DATABASE_SCHEMA, PROGRESION_DATABASE_TABLE);
    }

    public void getFilters(final String structureId,final String inspectorId, final Handler<HandlerResponse<VisaFilters>> handler) {
        final VisaFilters visaFilters = new VisaFilters();
        visaFilters.setStructureId(structureId);


        final StringBuilder count = new StringBuilder();


        //get teachers
        this.getTeachers(structureId,inspectorId, new Handler<HandlerResponse<List<KeyValueModel>>>() {
            @Override
            public void handle(HandlerResponse<List<KeyValueModel>> event) {

                HandlerUtils.checkError(event,handler);
                visaFilters.setTeachers(event.getResult());

                count.append("+");
                if (count.length() == 3) {
                    HandlerUtils.renderResponse(handler,visaFilters);
                }
            }
        });

        //get subjects
        this.getSubjects(structureId, new Handler<HandlerResponse<List<KeyValueModel>>>() {
            @Override
            public void handle(HandlerResponse<List<KeyValueModel>> event) {

                HandlerUtils.checkError(event,handler);

                visaFilters.setSubjects(event.getResult());


                count.append("+");
                if (count.length() == 3) {
                    HandlerUtils.renderResponse(handler,visaFilters);
                }
            }
        });

        //get audiences
        this.getAudiences(structureId, new Handler<HandlerResponse<List<KeyValueModel>>>() {
            @Override
            public void handle(HandlerResponse<List<KeyValueModel>> event) {

                HandlerUtils.checkError(event,handler);

                visaFilters.setAudiences(event.getResult());


                count.append("+");
                if (count.length() == 3) {
                    HandlerUtils.renderResponse(handler,visaFilters);
                }
            }
        });

    }


    public void getTeachers(String structureId, String inspectorId, final Handler<HandlerResponse<List<KeyValueModel>>> handler) {
        StringBuilder query = new StringBuilder();
        JsonArray parameters = new JsonArray();
        query.append("  select distinct t.id as key, t.teacher_display_name as value")
                .append("  from diary.teacher t ")
                .append(" join  diary.lesson l ON t.id = l.teacher_id ");

        if (inspectorId!=null){
            query.append(" join diary.inspector_habilitation ih on ih.teacherId = t.id ");
            query.append(" WHERE ih.inspectorId = ? ");
            parameters.addString(inspectorId);
        }else{
            query.append(" WHERE 1 = 1 ");
        }

        query.append(" AND l.school_id = ?");

        parameters.addString(structureId);

        sql.prepared(query.toString(), parameters, SqlMapper.listMapper(handler, KeyValueModel.class));
    }

    public void getSubjects(String structureId, final Handler<HandlerResponse<List<KeyValueModel>>> handler) {
        StringBuilder query = new StringBuilder();


        query.append("  select distinct s.id as key, s.subject_label as value ")
                .append(" from diary.subject s ")
                .append(" where s.school_id = ?");

        JsonArray parameters = new JsonArray().addString(structureId);

        sql.prepared(query.toString(), parameters, SqlMapper.listMapper(handler, KeyValueModel.class));
    }

    public void getAudiences(String structureId, final Handler<HandlerResponse<List<KeyValueModel>>> handler) {
        StringBuilder query = new StringBuilder();


        query.append("  select distinct a.id as key, a.audience_label as value ")
                .append(" from diary.audience a ")
                .append(" where a.school_id =  ?");

        JsonArray parameters = new JsonArray().addString(structureId);

        sql.prepared(query.toString(), parameters, SqlMapper.listMapper(handler, KeyValueModel.class));
    }

    public void getAllAgregatedVisas(final String structureId,String teacherId, String audienceId, String subjectId, final Boolean todoOnly, final Handler<HandlerResponse<List<ResultVisaList>>> handler) {

        StringBuilder query = new StringBuilder();
        JsonArray parameters = new JsonArray().addString(structureId);
        query.append(" select * from ( ")
                .append(" select  t.id as teacherId,")
                .append("  s.school_id as structureId, ")
                .append("  t.teacher_display_name as teacherName, ")
                .append("  s.id as subjectId, ")
                .append("  s.subject_label as subjectName,")
                .append("  a.id as audienceId,")
                .append("   a.audience_label as audienceName,")
                .append("  count(l.id) as nbTotal,")
                .append("  (select count (l2.id)")
                .append(" from diary.lesson l2 ")
                .append(" where not exists (select 1 from diary.visa_lesson v where v.lesson_id = l2.id) and l2.lesson_state = 'published'  ")
                .append(" and l2.audience_id = a.id ")
                .append(" and l2.subject_id = s.id ")
                .append(" and l2.teacher_id = t.id ")
                .append(" ) as nbNotVised, ")
                .append(" (select max(l2.modified)")
                .append(" from diary.lesson l2")
                .append(" where l2.audience_id = a.id")
                .append(" and l2.subject_id = s.id")
                .append(" and l2.teacher_id = t.id")
                .append(" and l2.lesson_state = 'published' ")
                .append(" ) as lastDateUpdate")
                .append(" from diary.teacher t ")
                .append(" join  diary.lesson l ON t.id = l.teacher_id ")
                .append(" join  diary.audience a ON a.id = l.audience_id ")
                .append(" join  diary.subject s ON s.id = l.subject_id ")
                .append(" WHERE l.school_id = ? ")
                .append(" and l.lesson_state = 'published' ")
                .append(" group by t.id, t.teacher_display_name,a.id ,a.audience_label,s.id,s.subject_label ")
                .append("  ) agvisas ")
                .append("  where 1 = 1 ");

        if (teacherId != null && !teacherId.isEmpty()){
            query.append(" AND agvisas.teacherId = ?");
            parameters.addString(teacherId);
        }
        if (audienceId != null && !audienceId.isEmpty()){
            query.append(" AND agvisas.audienceId = ?");
            parameters.addString(audienceId);
        }

        if (subjectId != null && !subjectId.isEmpty()){
            query.append(" AND agvisas.subjectId = ?");
            parameters.addString(subjectId);
        }


        sql.prepared(query.toString(), parameters, SqlMapper.listMapper(new Handler<HandlerResponse<List<ResultVisaList>>>() {
            @Override
            public void handle(final HandlerResponse<List<ResultVisaList>> eventListVisa) {

                HandlerUtils.checkError(eventListVisa,handler);

                final StringBuilder counter = new StringBuilder();
                final List<ResultVisaList> listResultVisas = eventListVisa.getResult();
                if (listResultVisas.size() == 0){
                    handler.handle(eventListVisa);
                }else{
                    for (final ResultVisaList visaList : listResultVisas){
                        getVisaModel(structureId, visaList.getTeacherId(), visaList.getAudienceId(), visaList.getSubjectId(), new Handler<HandlerResponse<List<VisaModel>>>() {
                            @Override
                            public void handle(HandlerResponse<List<VisaModel>> event) {
                                HandlerUtils.checkError(event,handler);
                                visaList.setVisas(event.getResult());
                                counter.append("+");
                                if(counter.length() == listResultVisas.size()){
                                    if (todoOnly){
                                        eventListVisa.setResult(filterTodoOnly(eventListVisa.getResult()));
                                    }
                                    handler.handle(eventListVisa);
                                }
                            }
                        });
                    }
                }


            }
        }, ResultVisaList.class));
    }
    private List<ResultVisaList> filterTodoOnly(List<ResultVisaList> listResultVisas){
        List<ResultVisaList> result = new ArrayList<>();
        for (ResultVisaList resultVisaList : listResultVisas){
            Long nbToDo = resultVisaList.getNbNotVised();
            if (resultVisaList.getVisas()!=null && resultVisaList.getVisas().size()>0){
                nbToDo = resultVisaList.getVisas().get(0).getNbDirty();
            }
            if (nbToDo>0){
                result.add(resultVisaList);
            }
        }

        return result;
    }

    public void applyVisas(final ApplyVisaModel applyVisa, final Boolean lock, final Handler<GenericHandlerResponse> handler) {
        try {
            final Integer nbQueries = lock ? 3 : 2;
            final List<SqlQuery> queries = new ArrayList<>();
            for (final VisaModel visa : applyVisa.getResultVisaList()){
                //queries.addAll(applyVisaPrepareQuery(visa));

                visa.setComment(applyVisa.getComment());
                visa.setOwnerId(applyVisa.getOwnerId());
                visa.setOwnerName(applyVisa.getOwnerName());
                visa.setOwnerType(applyVisa.getOwnerType());

                visaMapper.prepareInsertStatementWithSequence(visa, new Handler<HandlerResponse<SqlQuery>>() {
                    @Override
                    public void handle(HandlerResponse<SqlQuery> event) {
                        try {
                            queries.add(event.getResult());
                            queries.add(createInsertLessonVisa(visa));
                            if (lock){
                                queries.add(createLockQuery(visa));
                            }
                        }catch(Exception e){
                            HandlerUtils.genericError(e,handler);
                        }

                        //all queries are created
                        if (queries.size() == (applyVisa.getResultVisaList().size() * nbQueries)){
                            visaMapper.executeTransactionnalQueries(queries,handler);
                        }
                    }
                });

            }
        }
        catch (Exception e) {
            e.printStackTrace();
        }
    }

    private SqlQuery createLockQuery(VisaModel visa){
        validateVisa(visa);
        StringBuilder query = new StringBuilder();
        JsonArray parameters = new JsonArray();
        query.append("update diary.lesson  set locked = TRUE  where id in (select v.lesson_id from diary.visa_lesson v where v.visa_id = ?) ");
        parameters.addNumber(visa.getId());
        return new SqlQuery(query.toString(),parameters);
    }

    private SqlQuery createInsertLessonVisa(VisaModel visa) {
        validateVisa(visa);

        StringBuilder query = new StringBuilder();
        JsonArray parameters = new JsonArray();


        parameters.addNumber(visa.getId());
        parameters.addString(visa.getStructureId());
        parameters.addString(visa.getAudienceId());
        parameters.addString(visa.getSubjectId());
        parameters.addString(visa.getTeacherId());

        parameters.addNumber(visa.getId());
        parameters.addString(visa.getStructureId());
        parameters.addString(visa.getAudienceId());
        parameters.addString(visa.getSubjectId());
        parameters.addString(visa.getTeacherId());

        query.append(" INSERT INTO diary.visa_lesson ")
                .append(" select distinct ? as visa_id , l2.id as lesson_id ")
                .append(" from diary.lesson l2 ")
                .append("  where not exists (select 1 from diary.visa_lesson v where v.lesson_id = l2.id) ")
                .append(" and l2.school_id = ? ")
                .append(" and l2.audience_id = ? ")
                .append(" and l2.subject_id = ? ")
                .append(" and l2.lesson_state = 'published' ")
                .append(" and l2.teacher_id = ? ")
                .append(" union ")
                .append(" select distinct ? as visa_id , l2.id as lesson_id ")
                .append(" from diary.lesson l2 ")
                .append(" join diary.visa_lesson vl on vl.lesson_id = l2.id ")
                .append(" join diary.visa v on v.id = vl.visa_id ")
                .append(" where l2.modified > v.dateCreate ")
                .append(" and v.id = (select max(vl2.visa_id) from diary.visa_lesson vl2 where vl.lesson_id = vl2.lesson_id) ")
                .append(" and l2.school_id = ? ")
                .append(" and l2.audience_id = ? ")
                .append(" and l2.subject_id = ? ")
                .append(" and l2.lesson_state = 'published' ")
                .append(" and l2.teacher_id = ? ");
        return new SqlQuery(query.toString(),parameters);
    }

    private void validateVisa (VisaModel visa){
        if (visa.getStructureId()==null || visa.getStructureId().isEmpty()){
            throw new RuntimeException("tructureId cant be null");
        }
        if (visa.getAudienceId()==null || visa.getAudienceId().isEmpty()){
            throw new RuntimeException("audienceId cant be null");
        }
        if (visa.getAudienceName()==null || visa.getAudienceName().isEmpty()){
            throw new RuntimeException("audienceName cant be null");
        }
        if (visa.getTeacherId()==null || visa.getTeacherId().isEmpty()){
            throw new RuntimeException("teacherId cant be null");
        }
        if (visa.getTeacherName()==null || visa.getTeacherName().isEmpty()){
            throw new RuntimeException("teacherName cant be null");
        }
        if (visa.getSubjectId()==null || visa.getSubjectId().isEmpty()){
            throw new RuntimeException("subjectId cant be null");
        }
        if (visa.getSubjectName()==null || visa.getSubjectName().isEmpty()){
            throw new RuntimeException("subjectName cant be null");
        }
        if (visa.getOwnerId()==null || visa.getOwnerId().isEmpty()){
            throw new RuntimeException("ownerId cant be null");
        }
        if (visa.getOwnerName()==null || visa.getOwnerName().isEmpty()){
            throw new RuntimeException("ownerName cant be null");
        }
    }

        public void getVisaModel(String structureId,String teacherId, String audienceId, String subjectId,final Handler<HandlerResponse<List<VisaModel>>> handler){
            StringBuilder query = new StringBuilder();
            JsonArray parameters = new JsonArray();

            query.append(" select v.id,v.comment,v.dateCreate,v.structureId,v.teacherId,v.teacherName,v.subjectId,v.subjectName,v.audienceId,v.audienceName,v.ownerId,v.ownerName,v.ownerType , ")
                    .append(" max(l.modified) as lastModifiedLesson , ")
                    .append(" ( ")
                    .append(" select count( distinct l2.id ) ")
                    .append(" from diary.lesson l2 ")
                    .append(" join diary.visa_lesson vl2 on l2.id = vl2.lesson_id ")
                    .append(" join diary.visa v2 on vl2.visa_id = v2.id ")
                    .append(" where 1 = 1 ")
                    .append(" and  v2.id  = v.id")
                    .append(" and l2.modified > v2.datecreate ")
                    .append(" and l2.lesson_state = 'published' ")
                    .append(" ) as nbDirty ")
                    .append(" from diary.visa v ")
                    .append("  join diary.visa_lesson vl on vl.visa_id = v.id ")
                    .append(" join diary.lesson l on l.id = vl.lesson_id ")
                    .append(" where v.structureId = ? ")
                    .append(" and v.teacherId = ? ")
                    .append(" and v.audienceId = ? ")
                    .append(" and l.lesson_state = 'published' ")
                    .append(" and v.subjectId = ? ")
                    .append("  group by v.id,v.comment,v.dateCreate,v.structureId,v.teacherId,v.teacherName,v.subjectId,v.subjectName,v.audienceId,v.audienceName,v.ownerId,v.ownerName,v.ownerType")
                    .append("  order by v.dateCreate desc");

            parameters.addString(structureId);
            parameters.addString(teacherId);
            parameters.addString(audienceId);
            parameters.addString(subjectId);

            sql.prepared(query.toString(), parameters, SqlMapper.listMapper(handler, VisaModel.class));
        }



    public void getLessons(List<VisaModel> visaModels, final Handler<HandlerResponse<List<LessonModel>>> handler) {
        final Map<String,Object> promisesResult = new HashMap<>();

        getVisaSelectLesson(visaModels, new Handler<HandlerResponse<List<LessonModel>>>() {
            @Override
            public void handle(HandlerResponse<List<LessonModel>> event) {
                HandlerUtils.checkError(event,handler);
                promisesResult.put("LESSON",event.getResult());
                if (promisesResult.size() == 2){
                    HandlerUtils.renderResponse(handler,attachHomeworkLesson(promisesResult));
                }
            }
        });

        getVisaSelectHomework(visaModels, new Handler<HandlerResponse<Map<String, List<HomeworkModel>>>>() {
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

    private void getVisaSelectHomework(List<VisaModel> visaModels, final Handler<HandlerResponse<Map<String,List<HomeworkModel>>>> handler){
        StringBuilder query = new StringBuilder();
        JsonArray parameters = new JsonArray();

        for (VisaModel visaModel : visaModels){
            if (query.length()!=0){
                query.append(" UNION ");
            }
            query.append(" select ")
                    .append(" h.lesson_id as lessonId, ")
                    .append(" h.id as homeworkId, ")
                    .append(" h.homework_description as  description, ")
                    .append(" h.homework_due_date as  date ")
                    .append(" from ( ")
                    .append(" select distinct ")
                    .append(" l2.id as lessonId ")
                    .append(" from diary.lesson l2 ")
                    .append(" where not exists (select 1 from diary.visa_lesson v where v.lesson_id = l2.id) ")
                    .append(" and l2.audience_id = ? ")
                    .append(" and l2.subject_id = ? ")
                    .append(" and l2.teacher_id = ? ")
                    .append(" and l2.lesson_state = 'published' ")
                    .append(" union ")
                    .append(" select ")
                    .append(" l2.id as lessonId ")
                    .append("  from diary.lesson l2 ")
                    .append(" join diary.visa_lesson vl on vl.lesson_id = l2.id ")
                    .append(" join diary.visa v on v.id = vl.visa_id ")
                    .append(" where l2.modified > v.dateCreate ")
                    .append(" and v.id = (select max(vl2.visa_id) from diary.visa_lesson vl2 where vl.lesson_id = vl2.lesson_id) ")
                    .append(" and l2.audience_id = ? ")
                    .append(" and l2.subject_id = ? ")
                    .append(" and l2.teacher_id = ? ")
                    .append(" and l2.lesson_state = 'published' ")
                    .append(" ) tovise ")
                    .append(" join diary.homework h on tovise.lessonId = h.lesson_id ");

            parameters.addString(visaModel.getAudienceId());
            parameters.addString(visaModel.getSubjectId());
            parameters.addString(visaModel.getTeacherId());

            parameters.addString(visaModel.getAudienceId());
            parameters.addString(visaModel.getSubjectId());
            parameters.addString(visaModel.getTeacherId());
        }

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


    private void getVisaSelectLesson(List<VisaModel> visaModels, final Handler<HandlerResponse<List<LessonModel>>> handler){
        StringBuilder query = new StringBuilder();
        JsonArray parameters = new JsonArray();
        for (VisaModel visaModel : visaModels){
            if (query.length()!=0){
                query.append(" UNION ");
            }

            query.append(" select ")
                .append(" tovise.lessonId as lessonId, ")
                .append(" a.audience_label as audienceLabel, ")
                .append(" t.teacher_display_name as teacherName, ")
                .append(" s.subject_label as subject, ")
                .append(" l.lesson_date as date, ")
                .append(" to_char(l.lesson_start_time, 'HH12:MI') as startTime, ")
                .append(" to_char(l.lesson_end_time, 'HH12:MI') as endTime, ")
                .append(" l.lesson_title as title, ")
                .append(" l.lesson_description as description ")
                .append(" from ( ")
                .append(" select distinct ")
                .append(" l2.id as lessonId, l2.subject_id as subjectId, l2.teacher_id as teacherId, l2.audience_id as audienceId ")
                .append(" from diary.lesson l2 ")
                .append(" where not exists (select 1 from diary.visa_lesson v where v.lesson_id = l2.id) ")
                .append(" and l2.audience_id = ? ")
                .append(" and l2.subject_id = ? ")
                .append(" and l2.teacher_id = ? ")
                .append(" and l2.lesson_state = 'published' ")
                .append(" union ")
                .append(" select ")
                .append(" l2.id as lessonId, l2.subject_id as subjectId, l2.teacher_id as teacherId, l2.audience_id as audienceId ")
                .append("  from diary.lesson l2 ")
                .append(" join diary.visa_lesson vl on vl.lesson_id = l2.id ")
                .append(" join diary.visa v on v.id = vl.visa_id ")
                .append(" where l2.modified > v.dateCreate ")
                .append(" and v.id = (select max(vl2.visa_id) from diary.visa_lesson vl2 where vl.lesson_id = vl2.lesson_id) ")
                .append(" and l2.audience_id = ? ")
                .append(" and l2.subject_id = ? ")
                .append(" and l2.teacher_id = ? ")
                .append(" and l2.lesson_state = 'published' ")
                .append(" ) tovise ")
                .append(" join diary.subject s on tovise.subjectId = s.id ")
                .append(" join diary.teacher t on tovise.teacherId = t.id ")
                .append(" join diary.audience a on tovise.audienceId = a.id ")
                .append(" join diary.lesson l on tovise.lessonId = l.id ")
                    .append(" order by date desc");


            parameters.addString(visaModel.getAudienceId());
            parameters.addString(visaModel.getSubjectId());
            parameters.addString(visaModel.getTeacherId());

            parameters.addString(visaModel.getAudienceId());
            parameters.addString(visaModel.getSubjectId());
            parameters.addString(visaModel.getTeacherId());
        }

        sql.prepared(query.toString(), parameters, SqlMapper.listMapper(handler, LessonModel.class));
    }


    public Map<String,String> getVisaSelectLessonStats(List<LessonModel> lessonModels){
        Map<String,String> result = new HashMap<>();

        result.put("currentDate", DateUtils.formatDate(new Date()));

        HashSet<String> uniqueAudience = new HashSet<>();
        HashSet<String> uniqueTeacher = new HashSet<>();
        HashSet<String> uniqueSubject = new HashSet<>();

        for (LessonModel lessonModel : lessonModels){
            uniqueAudience.add(lessonModel.getAudienceLabel());
            uniqueTeacher.add(lessonModel.getTeacherName());
            uniqueSubject.add(lessonModel.getSubject());
        }

        result.put("audienceNb",""+uniqueAudience.size());
        result.put("teacherNb",""+uniqueTeacher.size());
        result.put("subjectNb",""+uniqueSubject.size());

        return result;
    }


    public void getAllInspector(final Handler<HandlerResponse<List<KeyValueModel>>> handler){
        StringBuilder sb = new StringBuilder("");
        sb.append(" match (u:User)-[IN]->(g:Group)-[AUTHORIZED]->(r:Role)-[AUTHORIZE]->(a:Action)\n" +
                " where a.displayName = 'diary.visa.inspect.filters' \n" +
                " return u.id, u.displayName;");
        final List<KeyValueModel>resultHandler = new ArrayList<>();
        JsonObject params = new JsonObject();
        neo.execute(sb.toString(), params, new Handler<Message<JsonObject>>() {
            @Override
            public void handle(Message<JsonObject> event) {
                if ("ok".equals(event.body().getString("status"))) {
                    final JsonArray result = event.body().getArray("result", new JsonArray());

                    if (result.size() > 0) {
                        for (int i = 0; i < result.size(); i++) {
                            JsonObject jo = result.get(i);
                            final String id = jo.getString("u.id");
                            final String name = jo.getString("u.displayName");
                            resultHandler.add(new KeyValueModel(id,name));
                        }
                    }
                    HandlerResponse<List<KeyValueModel>> response = new HandlerResponse<List<KeyValueModel>>();
                    response.setResult(resultHandler);
                    handler.handle(response);
                } else {
                    handler.handle(new HandlerResponse<List<KeyValueModel>>(event.body().getString("message")));
                }
            }
        });
    }


    public void getTeacherForManageInspectors(String inspectorId, String structureId, final Handler<HandlerResponse<TeacherToInspectorManagement>> handler){

        final TeacherToInspectorManagement teacherToInspectorManagement = new TeacherToInspectorManagement();
        final HandlerResponse response = new HandlerResponse();
        final StringBuilder count = new StringBuilder();
        response.setResult(teacherToInspectorManagement);
        getTeachersOnInspector(inspectorId, structureId, new Handler<HandlerResponse<List<KeyValueModel>>>() {
            @Override
            public void handle(HandlerResponse<List<KeyValueModel>> event) {
                HandlerUtils.checkError(event,handler);
                teacherToInspectorManagement.setOnInspectorTeachers(event.getResult());
                count.append("+");
                if (count.length()==2){
                    handler.handle(response);
                }
            }
        });

        getTeachers(structureId, null, new Handler<HandlerResponse<List<KeyValueModel>>>() {
            @Override
            public void handle(HandlerResponse<List<KeyValueModel>> event) {
                HandlerUtils.checkError(event,handler);
                teacherToInspectorManagement.setAvailableTeachers(event.getResult());

                count.append("+");
                if (count.length()==2){
                    handler.handle(response);
                }
            }
        });


    }

    public void getTeachersOnInspector(String inspectorId, String structureId, final Handler<HandlerResponse<List<KeyValueModel>>> handler){
        StringBuilder query = new StringBuilder();
        JsonArray parameters = new JsonArray();

        query.append(" select i.teacherId as key, i.teacherName as value ")
                .append(" from diary.inspector_habilitation i ")
                .append(" where i.inspectorid = ? ")
                .append(" and structureid = ? ");

        parameters.addString(inspectorId);
        parameters.addString(structureId);

        sql.prepared(query.toString(), parameters, SqlMapper.listMapper(handler, KeyValueModel.class));
    }

    public void updateInspector(String structureId, String inspectorId, List<KeyValueModel> teachers, final Handler<GenericHandlerResponse> handler){
        List<SqlQuery> queries = new ArrayList<>();

        {
            //delete all
            StringBuilder query = new StringBuilder()
                    .append(" DELETE from diary.inspector_habilitation ")
                    .append(" where structureId = ? ")
                    .append(" and inspectorId = ? ");
            JsonArray parameters = new JsonArray()
                    .addString(structureId)
                    .addString(inspectorId);

            queries.add(new SqlQuery(query.toString(),parameters));
        }

        for (KeyValueModel teacher : teachers){
            //insert
            StringBuilder query = new StringBuilder()
                    .append(" INSERT INTO diary.inspector_habilitation ")
                    .append ( " ( inspectorId,teacherId,teacherName,structureId ) " )
                    .append(" values ( ?,?,?,? ) ");

            JsonArray parameters = new JsonArray()
                    .addString(inspectorId)
                    .addString(teacher.getKey())
                    .addString(teacher.getValue())
                    .addString(structureId);

            queries.add(new SqlQuery(query.toString(),parameters));
        }

        visaMapper.executeTransactionnalQueries(queries,handler);

    }
}
