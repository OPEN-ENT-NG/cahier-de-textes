package fr.openent.diary.services;

import fr.wseduc.webutils.Either;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonObject;

import java.util.List;

/**
 * Created by dbreyton on 18/07/2016.
 */
public interface SharedService {

    public void shareResource(String ownerId, String classGroupId, final String resourceId, Boolean isGroup, final List<String> actions,
                              final Handler<Either<String, JsonObject>> handler);

    public void removeShareResource(String classGroupId, final String resourceId, Boolean isGroup,
                                   final Handler<Either<String, JsonObject>> handler);

    public void updateShareResource(final String oldClassGroupId, final String newClassGroupId, final String resourceId, final Boolean isOldGroup, final Boolean isNewGroup,
                                    final List<String> actions, final Handler<Either<String, JsonObject>> handler);
}
