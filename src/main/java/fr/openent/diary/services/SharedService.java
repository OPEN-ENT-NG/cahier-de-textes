package fr.openent.diary.services;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;

import java.util.List;

/**
 * Created by dbreyton on 18/07/2016.
 */
public interface SharedService {

    void shareResource(String ownerId, String classGroupId, final String resourceId, Boolean isGroup, final List<String> actions,
                              final Handler<Either<String, JsonObject>> handler);

    void removeShareResource(String classGroupId, final String resourceId, Boolean isGroup,
                                   final Handler<Either<String, JsonObject>> handler);

    /**
     * Updates the sharing properties of an already shared resource.
     * @param oldClassGroupId identifier of the previous group or class
     * @param newClassGroupId identifier of the current group or class
     * @param resourceId identifier of the resource to share
     * @param isOldGroup true if previous group or class was shared to a group of users
     * @param isNewGroup true if current group or class is to be shared to a group of users
     * @param actions sharing actions
     * @param handler
     */
    void updateShareResource(final String oldClassGroupId, final String newClassGroupId, final String resourceId, final Boolean isOldGroup, final Boolean isNewGroup,
                                    final List<String> actions, final Handler<Either<String, JsonObject>> handler);

    /**
     * Performs sharing on homeworks linked to a lesson to be shared.
     * @param resourceIds identifiers of every homework that need to be shared.
     * @param userId identifier of target user for the sharing (null if the target is a group of users).
     * @param groupId identifier of target group of users for the sharing (null if the target is a single user).
     * @param actions actions to be shared.
     * @param handler
     */
    void shareOrUpdateLinkedResources(final List<Long> resourceIds, final String userId, final String groupId, final List<String> actions,
                                             final Handler<Either<String, JsonObject>> handler);

    /**
     * Removes sharing data for the given homeworks, member and actions.
     * @param homeworkIds identifiers of every homework that need to be modified.
     * @param memberId identifier of target member (group or user) for the sharing modification.
     * @param actions actions concerned by the delete.
     * @param handler
     */
    void removeLinkedHomeworks(final List<Long> homeworkIds, final String memberId, List<String> actions,
                               final Handler<Either<String, JsonObject>> handler);
}
