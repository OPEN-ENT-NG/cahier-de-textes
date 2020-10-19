package fr.openent.diary.helper;

import fr.openent.diary.models.Notebook;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.ArrayList;
import java.util.List;

public class NotebookHelper {

    private NotebookHelper() {
    }

    /**
     * Convert JsonArray into notebook list
     *
     * @param notebookArray     JsonArray response
     * @return new list of events
     */
    public static List<Notebook> toNotebookList(JsonArray notebookArray) {
        List<Notebook> notebookList = new ArrayList<>();
        for (Object o : notebookArray) {
            if (!(o instanceof JsonObject)) continue;
            Notebook reason = new Notebook((JsonObject) o);
            notebookList.add(reason);
        }
        return notebookList;
    }

    /**
     * Convert List notebook into notebook JsonArray
     *
     * @param notebookList notebook list
     * @return new JsonArray of notebooks
     */
    public static JsonArray toJsonArray(List<Notebook> notebookList) {
        JsonArray notebookArray = new JsonArray();
        for (Notebook notebook : notebookList) {
            notebookArray.add(notebook.toJSON());
        }
        return notebookArray;
    }
}
