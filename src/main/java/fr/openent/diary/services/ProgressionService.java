package fr.openent.diary.services;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

public interface ProgressionService {
    /**
     * Get all progressions of an owner
     * @param ownerId
     * @param handler
     */
    void getProgressions(String ownerId, Handler<Either<String, JsonArray>> handler);

    /**
     * Delete progression
     * @param progression
     * @param handler
     */
    void deleteProgressions(JsonObject progression, Handler<Either<String, JsonArray>> handler);

    /**
     * Update progression
     * @param ownerId
     * @param handler
     */
    void updateProgressions(JsonObject progression, String ownerId, Handler<Either<String, JsonObject>> handler);

    /**
     * Apply a progression to a session of a course
     *   @param idProgression
     * @param idSession
     * @param progression
     * @param handler
     */
    void progressionToSession(JsonObject progression, String idProgression, String idSession, Handler<Either<String, JsonObject>> handler);

    /***
     * Create a progression session
     * @param progression
     * @param handler
     */

    void createSessionProgression(JsonObject progression, Handler<Either<String, JsonArray>> handler);


    /**
     * Delete an homework from progression
     * @param progressionHomeworkId
     * @param handler
     */
    void deleteHomeworkProgression(String progressionHomeworkId, Handler<Either<String, JsonArray>> handler);

    /**
     * Create an homework for a progression
     * @param progression
     * @param handler
     */
    void createHomeworkProgression(JsonObject progression, Handler<Either<String, JsonArray>> handler);

    /**
     * Create a progression with homeworks
     * @param progression
     * @param handler
     */
    void createFullProgression(JsonObject progression, Handler<Either<String, JsonObject>> handler);

    /**
     * Get a unique progressionById
     * @param progressionId
     * @param handler
     */
    void getProgression(String progressionId, Handler<Either<String, JsonArray>> handler);

    void createFolder(HttpServerRequest request, JsonObject json, UserInfos user, Handler<Either<String, JsonObject>> handler);

    void deleteProgressionFolders(JsonObject progression, Handler<Either<String, JsonArray>> arrayResponseHandler);

    void updateProgressionFolder(JsonObject progression, String folderId, Handler<Either<String, JsonObject>> defaultResponseHandler);
}
