package fr.openent.diary.services;

import fr.openent.diary.controllers.DiaryController;
import fr.openent.diary.model.GenericHandlerResponse;
import fr.openent.diary.model.HandlerResponse;
import fr.openent.diary.model.progression.LessonProgression;
import fr.openent.diary.model.progression.OrderLesson;
import fr.openent.diary.model.progression.Progression;
import fr.openent.diary.model.util.CountModel;
import fr.openent.diary.model.util.KeyValueModel;
import fr.openent.diary.model.visa.ResultVisaList;
import fr.openent.diary.model.visa.VisaFilters;
import fr.openent.diary.model.visa.VisaModel;
import fr.openent.diary.utils.SqlMapper;
import fr.openent.diary.utils.SqlQuery;
import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.sql.Sql;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;

import java.util.ArrayList;
import java.util.List;


public class VisaServiceImpl extends SqlCrudService {
    private final static String PROGRESION_DATABASE_TABLE = "lesson";
    //private final static String PROGRESION_DATABASE_TABLE_SC ="diary.lesson";

    private final SqlMapper<VisaModel> visaMapper = new SqlMapper<>(Progression.class,"diary.visa",sql);


    public VisaServiceImpl() {
        super(DiaryController.DATABASE_SCHEMA, PROGRESION_DATABASE_TABLE);
    }

    public void getFilters(final String structureId, final Handler<HandlerResponse<VisaFilters>> handler) {
        final VisaFilters visaFilters = new VisaFilters();
        visaFilters.setStructureId(structureId);

        final HandlerResponse<VisaFilters> result = new HandlerResponse<>();
        result.setResult(visaFilters);

        final StringBuilder count = new StringBuilder();


        //get teachers
        this.getTeachers(structureId, new Handler<HandlerResponse<List<KeyValueModel>>>() {
            @Override
            public void handle(HandlerResponse<List<KeyValueModel>> event) {

                if (event.hasError()) {
                    result.setMessage(event.getMessage());
                } else {
                    visaFilters.setTeachers(event.getResult());
                }

                count.append("+");
                if (count.length() == 3) {
                    handler.handle(result);
                }
            }
        });

        //get subjects
        this.getSubjects(structureId, new Handler<HandlerResponse<List<KeyValueModel>>>() {
            @Override
            public void handle(HandlerResponse<List<KeyValueModel>> event) {

                if (event.hasError()) {
                    result.setMessage(event.getMessage());
                } else {
                    visaFilters.setSubjects(event.getResult());
                }

                count.append("+");
                if (count.length() == 3) {
                    handler.handle(result);
                }
            }
        });

        //get audiences
        this.getAudiences(structureId, new Handler<HandlerResponse<List<KeyValueModel>>>() {
            @Override
            public void handle(HandlerResponse<List<KeyValueModel>> event) {

                if (event.hasError()) {
                    result.setMessage(event.getMessage());
                } else {
                    visaFilters.setAudiences(event.getResult());
                }

                count.append("+");
                if (count.length() == 3) {
                    handler.handle(result);
                }
            }
        });

    }


    public void getTeachers(String structureId, final Handler<HandlerResponse<List<KeyValueModel>>> handler) {
        StringBuilder query = new StringBuilder();

        query.append("  select distinct t.id as key, t.teacher_display_name as value")
                .append("  from diary.teacher t ")
                .append(" join  diary.lesson l ON t.id = l.teacher_id ")
                .append(" WHERE l.school_id = ?");

        JsonArray parameters = new JsonArray().addString(structureId);

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

    public void getAllAgregatedVisas(String structureId,String teacherId, String audienceId, String subjectId,Boolean showTodoOnly, final Handler<HandlerResponse<List<ResultVisaList>>> handler) {

        StringBuilder query = new StringBuilder();
        JsonArray parameters = new JsonArray().addString(structureId);
        query.append(" select * from ( ")
                .append(" select  t.id as teacherId,")
                .append("  t.teacher_display_name as teacherName, ")
                .append("  s.id as subjectId, ")
                .append("  s.subject_label as subjectName,")
                .append("  a.id as audienceId,")
                .append("   a.audience_label as audienceName,")
                .append("  count(l.id) as nbTotal,")
                .append("  (select count (l2.id)")
                .append(" from diary.lesson l2 ")
                .append(" where not exists (select 1 from diary.visa_lesson v where v.lesson_id = l2.id) ")
                .append(" and l2.audience_id = a.id ")
                .append(" and l2.subject_id = s.id ")
                .append(" and l2.teacher_id = t.id ")
                .append(" ) as nbNotVised, ")
                .append(" (select count (l2.id) ")
                .append(" from diary.lesson l2 ")
                .append(" join diary.visa_lesson vl on vl.lesson_id = l2.id ")
                .append(" join diary.visa v on v.id = vl.visa_id ")
                .append(" where l2.modified > v.dateCreate ")
                .append(" and l2.audience_id = a.id ")
                .append(" and l2.subject_id = s.id ")
                .append(" and l2.teacher_id = t.id ")
                .append(" ) as nbDirty ")
                .append(" from diary.teacher t ")
                .append(" join  diary.lesson l ON t.id = l.teacher_id ")
                .append(" join  diary.audience a ON a.id = l.audience_id ")
                .append(" join  diary.subject s ON s.id = l.subject_id ")
                .append(" WHERE l.school_id = ? ")
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

        if (showTodoOnly){
            query.append(" and nbNotVised + nbDirty > 0");
        }

        sql.prepared(query.toString(), parameters, SqlMapper.listMapper(handler, ResultVisaList.class));
    }

    public void applyVisas(final List<VisaModel> visas, final Handler<GenericHandlerResponse> handler) {
        try {
            final List<SqlQuery> queries = new ArrayList<>();
            for (final VisaModel visa : visas){
                //queries.addAll(applyVisaPrepareQuery(visa));

                visaMapper.prepareInsertStatementWithSequence(visa, new Handler<HandlerResponse<SqlQuery>>() {
                    @Override
                    public void handle(HandlerResponse<SqlQuery> event) {
                        queries.add(event.getResult());
                        queries.add(createInsertLessonVisa(visa));

                        //all queries are created
                        if (queries.size() == (visas.size() * 2)){
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

    private SqlQuery createInsertLessonVisa(VisaModel visa) {
        validateVisa(visa);

        StringBuilder query = new StringBuilder();
        JsonArray parameters = new JsonArray();
        //.addString(structureId);

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
                .append(" select distinct l2.id as lesson_id , ? as school_id ")
                .append(" from diary.lesson l2 ")
                .append("  where not exists (select 1 from diary.visa_lesson v where v.lesson_id = l2.id) ")
                .append(" and l2.school_id = ? ")
                .append(" and l2.audience_id = ? ")
                .append(" and l2.subject_id = ? ")
                .append(" and l2.teacher_id = ? ")
                .append(" union ")
                .append(" select l2.id ,  ? as school_id ")
                .append(" from diary.lesson l2 ")
                .append(" join diary.visa_lesson vl on vl.lesson_id = l2.id ")
                .append(" join diary.visa v on v.id = vl.visa_id ")
                .append(" where l2.modified > v.dateCreate ")
                .append(" and l2.school_id = ? ")
                .append(" and l2.audience_id = ? ")
                .append(" and l2.subject_id = ? ")
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



}
