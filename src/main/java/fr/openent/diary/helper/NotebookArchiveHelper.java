package fr.openent.diary.helper;

import fr.openent.diary.models.NotebookArchive;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.List;
import java.util.stream.Collectors;

public class NotebookArchiveHelper {

    private NotebookArchiveHelper() {
        throw new IllegalStateException("Utility class");
    }

    /**
     * Convert JsonArray into NotebookArchive model list
     *
     * @param archives jsonArray containing list of archives json
     * @return new list of model
     */
    public static List<NotebookArchive> notebookArchives(JsonArray archives) {
        return (archives != null) ? archives.stream().map(audience -> new NotebookArchive((JsonObject) audience)).collect(Collectors.toList()) : null;
    }
}

