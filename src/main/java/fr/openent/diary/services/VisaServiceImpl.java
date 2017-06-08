package fr.openent.diary.services;

import fr.openent.diary.controllers.DiaryController;
import fr.openent.diary.model.GenericHandlerResponse;
import fr.openent.diary.model.HandlerResponse;
import fr.openent.diary.model.progression.LessonProgression;
import fr.openent.diary.model.progression.OrderLesson;
import fr.openent.diary.model.progression.Progression;
import fr.openent.diary.model.util.CountModel;
import fr.openent.diary.model.util.KeyValueModel;
import fr.openent.diary.model.visa.VisaFilters;
import fr.openent.diary.utils.SqlMapper;
import fr.openent.diary.utils.SqlQuery;
import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.sql.Sql;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;

import java.util.ArrayList;
import java.util.List;


public class VisaServiceImpl extends SqlCrudService {
    private final static String PROGRESION_DATABASE_TABLE ="lesson";
    //private final static String PROGRESION_DATABASE_TABLE_SC ="diary.lesson";

    //private final SqlMapper<String> progressionMapper = new SqlMapper<>(Progression.class,PROGRESION_DATABASE_TABLE_SC,sql);


    public VisaServiceImpl() {
        super(DiaryController.DATABASE_SCHEMA, PROGRESION_DATABASE_TABLE);
    }

    public void getFilters(final String structureId,final Handler<HandlerResponse<VisaFilters>> handler){
        final VisaFilters visaFilters = new VisaFilters();
        visaFilters.setStructureId(structureId);

        final HandlerResponse<VisaFilters> result = new HandlerResponse<>();
        result.setResult(visaFilters);

        final StringBuilder count = new StringBuilder();


        //get teachers
        this.getTeachers(structureId, new Handler<HandlerResponse<List<KeyValueModel>>>() {
            @Override
            public void handle(HandlerResponse<List<KeyValueModel>> event) {

                if (event.hasError()){
                    result.setMessage(event.getMessage());
                }else{
                    visaFilters.setTeachers(event.getResult());
                }

                count.append("+");
                if (count.length() == 3){
                    handler.handle(result);
                }
            }
        });

        //get subjects
        this.getSubjects(structureId, new Handler<HandlerResponse<List<KeyValueModel>>>() {
            @Override
            public void handle(HandlerResponse<List<KeyValueModel>> event) {

                if (event.hasError()){
                    result.setMessage(event.getMessage());
                }else{
                    visaFilters.setSubjects(event.getResult());
                }

                count.append("+");
                if (count.length() == 3){
                    handler.handle(result);
                }
            }
        });

        //get audiences
        this.getAudiences(structureId, new Handler<HandlerResponse<List<KeyValueModel>>>() {
            @Override
            public void handle(HandlerResponse<List<KeyValueModel>> event) {

                if (event.hasError()){
                    result.setMessage(event.getMessage());
                }else{
                    visaFilters.setAudiences(event.getResult());
                }

                count.append("+");
                if (count.length() == 3){
                    handler.handle(result);
                }
            }
        });

    }


    public void getTeachers(String structureId,final Handler<HandlerResponse<List<KeyValueModel>>> handler){
        StringBuilder query = new StringBuilder();

        query.append("  select distinct t.id as key, t.teacher_display_name as value")
                .append("  from diary.teacher t ")
                .append(" join  diary.lesson l ON t.id = l.teacher_id ")
                .append(" WHERE l.school_id = ?");

        JsonArray parameters = new JsonArray().addString(structureId);

        sql.prepared(query.toString(), parameters,SqlMapper.listMapper(handler,KeyValueModel.class));
    }

    public void getSubjects(String structureId,final Handler<HandlerResponse<List<KeyValueModel>>> handler){
        StringBuilder query = new StringBuilder();


        query.append("  select distinct s.id as key, s.subject_label as value ")
                .append(" from diary.subject s ")
                .append(" where s.school_id = ?");

        JsonArray parameters = new JsonArray().addString(structureId);

        sql.prepared(query.toString(), parameters,SqlMapper.listMapper(handler,KeyValueModel.class));
    }

    public void getAudiences(String structureId,final Handler<HandlerResponse<List<KeyValueModel>>> handler){
        StringBuilder query = new StringBuilder();


        query.append("  select distinct a.id as key, a.audience_label as value ")
                .append(" from diary.audience a ")
                .append(" where a.school_id =  ?");

        JsonArray parameters = new JsonArray().addString(structureId);

        sql.prepared(query.toString(), parameters,SqlMapper.listMapper(handler,KeyValueModel.class));
    }

}
