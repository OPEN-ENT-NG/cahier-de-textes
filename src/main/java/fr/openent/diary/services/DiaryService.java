package fr.openent.diary.services;

import fr.openent.diary.utils.SearchCriterion;
import fr.wseduc.webutils.Either;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import java.util.List;

/**
 * Created by a457593 on 18/02/2016.
 */
public interface DiaryService {

    void createTeacher(final String teacherId, final String teacherDisplayName, final Handler<Either<String, JsonObject>> handler);

    void retrieveTeacher(final String teacherId, final Handler<Either<String, JsonObject>> handler);

    void createSubject(final JsonObject subjectObject, final Handler<Either<String, JsonObject>> handler);

    void createSubjects(final List<JsonObject> subjectObjectList, final Handler<Either<String, JsonObject>> handler);

    void deleteSubject(final String subjectId, final Handler<Either<String, JsonObject>> handler);

    void listSubjects(final List<String> schoolIds, final String teacherId, final Handler<Either<String, JsonArray>> handler);

    void listAudiences(final String schoolId, final Handler<Either<String, JsonArray>> handler);

    void getOrCreateTeacher(final String teacherId, final String teacherDisplayName, final Handler<Either<String, JsonObject>> handler);

    /**
     * List all pedagogic items (lessons and homeworks) matching the given search criteria.
     */
    void listPedagogicItems(final UserInfos userInfos, final List<SearchCriterion> criteria, final List<String> groups, final Handler<Either<String, JsonArray>> handler);

    /**
     *
     * @param parentId
     * @param handler
     */
    void listChildren(final String parentId, final Handler<Either<String, JsonArray>> handler);
}
