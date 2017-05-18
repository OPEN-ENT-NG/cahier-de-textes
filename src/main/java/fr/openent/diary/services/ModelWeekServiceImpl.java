package fr.openent.diary.services;

import fr.openent.diary.controllers.DiaryController;
import fr.openent.diary.model.GenericHandlerResponse;
import fr.openent.diary.model.HandlerResponse;
import fr.openent.diary.model.LessonAsModel;
import fr.openent.diary.model.ModelWeek;
import fr.openent.diary.utils.DateUtils;
import fr.openent.diary.utils.SqlMapper;
import fr.openent.diary.utils.SqlQuery;
import fr.wseduc.webutils.Either;
import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.sql.Sql;
import org.entcore.common.user.UserInfos;
import org.joda.time.*;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import java.util.*;



public class ModelWeekServiceImpl extends SqlCrudService {
    private final static String DATABASE_TABLE ="modelweek";
    private final static String DATABASE_TABLE_SC ="diary.modelweek";
    private final SqlMapper<ModelWeek> modelWeekMapper = new SqlMapper<>(ModelWeek.class,DATABASE_TABLE_SC,sql);
    private LessonService lessonService;
    public ModelWeekServiceImpl(LessonService lessonService) {
        super(DiaryController.DATABASE_SCHEMA, DATABASE_TABLE);
        this.lessonService = lessonService;

    }


    public void getModelWeeks(String teacherId, Handler<HandlerResponse<List<ModelWeek>>> handler) {

        StringBuilder query = new StringBuilder();
        query.append("SELECT")
                .append(" m.id as id,")
                .append(" m.weekAlias as weekAlias,")
                .append(" m.teacherId as teacherId,")
                .append(" m.pair as pair,")
                .append(" m.beginDate as beginDate,")
                .append(" m.endDate as endDate")
                .append(" FROM diary.modelweek as m")
                .append(" WHERE m.teacherId = ?");

        JsonArray parameters = new JsonArray().add(Sql.parseId(teacherId));

        sql.prepared(query.toString(), parameters,modelWeekMapper.listMapper(handler));

    }

    public void createOrUpdateModelWeek(final String teacherId, final String weekAlias, final Date date, final Handler<HandlerResponse<ModelWeek>> handler) {
        getModelWeeks(teacherId, new Handler<HandlerResponse<List<ModelWeek>>>() {
            @Override
            public void handle(HandlerResponse<List<ModelWeek>> event) {
                HandlerResponse<Boolean> result = new HandlerResponse<Boolean>();
                if (event.hasError()){
                    handler.handle(new HandlerResponse<ModelWeek>(result.getMessage()));
                }else{
                    List<ModelWeek> modelWeeks = event.getResult();

                    if (modelWeeks == null || modelWeeks.isEmpty()){
                        createModelWeek(teacherId,weekAlias,date,handler);
                    }else{
                        ModelWeek selectedModelWeek = null;
                        for (ModelWeek modelWeek : modelWeeks ){
                            if (modelWeek.getWeekAlias().equals(weekAlias)){
                                selectedModelWeek = modelWeek;
                                break;
                            }
                        }
                        if (selectedModelWeek == null){
                            createModelWeek(teacherId,weekAlias,date, handler);
                        }else{
                            updateModelWeek(selectedModelWeek,teacherId,weekAlias,date,handler);
                        }
                    }
                }
            }
        });
    }

    private void updateModelWeek(ModelWeek modelWeek, String teacherId, String weekAlias, Date date,Handler<HandlerResponse<ModelWeek>> handler) {
        try{
            modelWeek.setTeacherId(teacherId);
            modelWeek.setBeginDate(date);
            //end date
            MutableDateTime endDate = new MutableDateTime(date);
            endDate.addDays(6);
            modelWeek.setEndDate(endDate.toDate());
            modelWeekMapper.update(modelWeek,handler);

        }catch(Throwable e){
            handler.handle(new HandlerResponse<ModelWeek>(e.getMessage()));
        }
    }

    private void createModelWeek(String teacherId, String weekAlias, Date date, final Handler<HandlerResponse<ModelWeek>> handler) {
        try{
            ModelWeek modelWeek = new ModelWeek();
            modelWeek.setTeacherId(teacherId);
            modelWeek.setWeekAlias(weekAlias);
            modelWeek.setBeginDate(date);
            //end daate
            MutableDateTime endDate = new MutableDateTime(date);
            endDate.addDays(6);
            modelWeek.setEndDate(endDate.toDate());

            Boolean isPair = (new DateTime(date).getWeekyear() % 2) == 0;
            modelWeek.setPair(isPair);

            modelWeekMapper.insert(modelWeek,handler);

        }catch(Throwable e){
            handler.handle(new HandlerResponse<ModelWeek>(e.getMessage()));
        }
    }

    public void invertModelWeek(String teacherId, final Handler<GenericHandlerResponse> handler) {
        getModelWeeks(teacherId, new Handler<HandlerResponse<List<ModelWeek>>>() {
            @Override
            public void handle(HandlerResponse<List<ModelWeek>> event) {
                GenericHandlerResponse response = new GenericHandlerResponse(event.getMessage());
                if (!event.hasError()){
                    try{
                        List<ModelWeek> modelWeeks = event.getResult();
                        //to inverse we need to have 2 model set
                        if (modelWeeks.size() == 2) {
                            List<SqlQuery> queries = new ArrayList<SqlQuery>();
                            for (ModelWeek modelWeek : event.getResult()) {
                                if (modelWeek.getWeekAlias().equals("A")) {
                                    modelWeek.setWeekAlias("B");
                                } else {
                                    modelWeek.setWeekAlias("A");
                                }
                                queries.add(modelWeekMapper.prepareUpdateStatement(modelWeek));
                            }
                            modelWeekMapper.executeTransactionnalQueries(queries, handler);
                            return;
                        }
                    }catch (Exception e){
                        response.setMessage(e.getMessage());
                    }
                }
                handler.handle(response);
            }
        });
    }

    public void getAllsItemsModel(final UserInfos user, final Date date, final Handler<HandlerResponse<List<LessonAsModel>>> handler) {
        getModelWeeks(user.getUserId(), new Handler<HandlerResponse<List<ModelWeek>>>() {
            @Override
            public void handle(HandlerResponse<List<ModelWeek>> event) {
                final HandlerResponse<List<LessonAsModel>> response = new HandlerResponse<List<LessonAsModel>>();
                ModelWeek refWeek = null;

                //if the week is pair take A alias, else the B
                String aliasRef = (new DateTime(date).getWeekOfWeekyear() % 2) == 0 ? "A" :"B";

                for (ModelWeek modelWeek : event.getResult()){
                    if (modelWeek.getWeekAlias().equals(aliasRef)){
                        refWeek = modelWeek;
                        break;
                    }
                }

                if (refWeek == null){
                    handler.handle(response);
                }else{

                }
                lessonService.getAllLessonsForTeacher(user.getUserId(),
                        user.getStructures(),
                        user.getGroupsIds(),
                        DateUtils.formatDate(refWeek.getBeginDate()),
                        DateUtils.formatDate(refWeek.getEndDate()),
                        new Handler<Either<String, JsonArray>>() {
                            @Override
                            public void handle(Either<String, JsonArray> event) {
                                if (event.isRight()){
                                    mapLessonItems(event.right().getValue(),date,handler);
                                }else{
                                    handler.handle(response);
                                }
                            }
                        });
            }
        });
    }

    private void mapLessonItems(JsonArray value, Date date, Handler<HandlerResponse<List<LessonAsModel>>> handler) {
        HandlerResponse<List<LessonAsModel>> result = new HandlerResponse<List<LessonAsModel>>();
        try {


            List<LessonAsModel> map = new ArrayList<>();
            for (Object jsonEl : value) {

                JsonObject json = (JsonObject) jsonEl;
                LessonAsModel lesson = new LessonAsModel();
                lesson.setClasses(Arrays.asList(json.getString("audience_label")));


                String beginHour = json.getString("lesson_start_time");
                String endHour = json.getString("lesson_end_time");

                DateTimeFormatter fmt = DateTimeFormat.forPattern("HH:mm:ss");
                LocalTime beginJodaTime = LocalTime.parse(beginHour, fmt);
                LocalTime endJodaTime = LocalTime.parse(endHour, fmt);
                MutableDateTime lessonDate = new MutableDateTime(DateUtils.parseDateSql(json.getString("lesson_date")));

                //get nb days between to calc actual date begin and end
                LocalDate firstMondayOfLessonWeek = new LocalDate(lessonDate).withDayOfWeek(DateTimeConstants.MONDAY);
                int nbDaysBetween = Days.daysBetween(firstMondayOfLessonWeek, new LocalDate(date)).getDays();
                lessonDate.addDays(nbDaysBetween);

                MutableDateTime beginDate = new MutableDateTime(lessonDate);
                beginDate.setHourOfDay(beginJodaTime.getHourOfDay());
                beginDate.setMinuteOfHour(beginJodaTime.getMinuteOfHour());
                beginDate.setSecondOfMinute(beginJodaTime.getSecondOfMinute());

                MutableDateTime endDate = new MutableDateTime(lessonDate);
                endDate.setHourOfDay(endJodaTime.getHourOfDay());
                endDate.setMinuteOfHour(endJodaTime.getMinuteOfHour());
                endDate.setSecondOfMinute(endJodaTime.getSecondOfMinute());

                lesson.setStartDate(beginDate.toDate());
                lesson.setEndDate(endDate.toDate());
                String lessonroom = json.getString("lesson_room");
                if (lessonroom != null){
                    lesson.setRoomLabels(Arrays.asList(lessonroom));
                }else{
                    lesson.setRoomLabels(Collections.<String>emptyList());
                }

                lesson.setSubjectId(json.getString("subject_id"));
                lesson.setSubjectLabel(json.getString("subject_label"));

                map.add(lesson);
            }

            result.setResult(map);

        }catch (Exception e){
            result.setMessage(e.getMessage());

        }
        handler.handle(result);
    }
}
