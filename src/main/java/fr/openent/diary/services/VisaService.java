package fr.openent.diary.services;

import fr.openent.diary.model.GenericHandlerResponse;
import fr.openent.diary.model.HandlerResponse;
import fr.openent.diary.model.lessonview.LessonModel;
import fr.openent.diary.model.util.KeyValueModel;
import fr.openent.diary.model.visa.*;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

import java.util.List;
import java.util.Map;

public interface VisaService {
    void getFilters(String structureId, String inspectorId, Handler<HandlerResponse<VisaFilters>> handler);

    void getTeachers(String structureId, String inspectorId, Handler<HandlerResponse<List<KeyValueModel>>> handler);

    void getSubjects(String structureId, Handler<HandlerResponse<List<KeyValueModel>>> handler);

    void getAudiences(String structureId, Handler<HandlerResponse<List<KeyValueModel>>> handler);

    void getAllAgregatedVisas(String structureId, String teacherId, String audienceId, String subjectId, String statut, Handler<HandlerResponse<List<ResultVisaList>>> handler);

    void applyVisas(ApplyVisaModel applyVisa, Boolean lock, Handler<GenericHandlerResponse> handler);

    void getVisaModel(String structureId, String teacherId, String audienceId, String subjectId, Handler<HandlerResponse<List<VisaModel>>> handler);

    void getLessons(List<VisaModel> visaModels, Handler<HandlerResponse<List<LessonModel>>> handler);

    List<LessonModel> attachHomeworkLesson(Map<String, Object> promisesResult);

    Map<String,String> getVisaSelectLessonStats(List<LessonModel> lessonModels);

    void getAllInspector(Handler<HandlerResponse<List<KeyValueModel>>> handler);

    void getTeacherForManageInspectors(String inspectorId, String structureId, Handler<HandlerResponse<TeacherToInspectorManagement>> handler);

    void getTeachersOnInspector(String inspectorId, String structureId, Handler<HandlerResponse<List<KeyValueModel>>> handler);

    void updateInspector(String structureId, String inspectorId, List<KeyValueModel> teachers, Handler<GenericHandlerResponse> handler);

    void createVisa(JsonObject visa, UserInfos user, Handler<Either<String, JsonArray>> handler);
}
