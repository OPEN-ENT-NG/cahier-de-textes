package fr.openent.diary.helper;

import fr.openent.diary.models.Notebook;
import fr.openent.diary.models.NotebookPdf;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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


    public static List<NotebookPdf.SessionPdf> notebooksToSessionPdfs(List<Notebook> notebooks) {
        return notebooks
                .stream()
                .filter(notebook -> notebook.getType().equals(Notebook.SESSION_TYPE)
                        || (notebook.getType().equals(Notebook.HOMEWORK_TYPE) && notebook.getSessionId() == null))
                .map(notebook -> new NotebookPdf.SessionPdf(notebook,
                        notebook.getType().equals(Notebook.SESSION_TYPE)
                                ? notebooks.stream().filter(homework -> (homework.getSessionId() != null
                                && homework.getSessionId().equals(notebook.getId()))).collect(Collectors.toList())
                                : null
                ))
                .collect(Collectors.toList());
    }

    public static JsonArray sessionPdfstoJSON(List<NotebookPdf.SessionPdf> sessionPdfs) {
        return new JsonArray(sessionPdfs.stream().map(NotebookPdf.SessionPdf::toJSON).collect(Collectors.toList()));
    }

    public static List<NotebookPdf.SessionPdf.HomeworkPdf> notebooksToHomeworkPdfs(List<Notebook> notebooks) {
        return notebooks.stream()
                .map(NotebookPdf.SessionPdf.HomeworkPdf::new)
                .collect(Collectors.toList());
    }

    public static JsonArray homeworkPdfstoJSON(List<NotebookPdf.SessionPdf.HomeworkPdf> homeworkPdfs) {
        return new JsonArray(homeworkPdfs.stream().map(NotebookPdf.SessionPdf.HomeworkPdf::toJSON).collect(Collectors.toList()));
    }

}
