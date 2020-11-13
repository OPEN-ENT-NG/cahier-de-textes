package fr.openent.diary.notebook;

import fr.openent.diary.models.Notebook;
import fr.openent.diary.models.Subject;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

import static org.mockito.Mockito.mock;

@RunWith(VertxUnitRunner.class)
public class NotebookModelTest {

    private final JsonObject notebookJsonObject_1 = new JsonObject()
            .put("notebook_id", "98494-1598284086148$6f4976e3-d7d5-" +
                    "44b5-b1ce-42f854f98e2b$0aa46c2a-274b-439b-afe4-688f33d6a4ae")
            .put("id", 51)
            .put("subject_id","51")
            .put("teacher_id","1598284086148$6f4976e3")
            .put("audience_id","15982148$6f4976e3")
            .put("sessions", 1)
            .put("annotation", "test annotation")
            .put("description", "test description")
            .put("title", "Séance du 30/10/2020")
            .put("type_id",619)
            .put("workload", 0)
            .put("date", "2020-10-30")
            .put("start_time", "10:35:00")
            .put("end_time", "11:30:00")
            .put("modified", "2020-10-30 11:37:44.948474")
            .put("is_published", true)
            .put("estimatedtime", 10)
            .put("session_id", 109)
            .put("visa", "test visa")
            .put("type", "HOMEWORK");

    @Test
    public void testNotebookNotNull(TestContext ctx) {
        JsonObject notebookObjectMock = mock(JsonObject.class);
        Notebook notebook = new Notebook(notebookObjectMock);
        ctx.assertNotNull(notebook);
    }

    @Test
    public void testNotebookHasContentWithObject(TestContext ctx) {
        Notebook notebook = new Notebook(notebookJsonObject_1);
        boolean isNotEmpty = !notebook.getNotebookId().isEmpty() &&
                !notebook.isPublished().toString().isEmpty() &&
                !notebook.getSessionId().toString().isEmpty() &&
                !notebook.getId().toString().isEmpty() &&
                !notebook.getSessions().toString().isEmpty() &&
                !notebook.getDescription().isEmpty() &&
                !notebook.getAnnotation().isEmpty() &&
                !notebook.getTitle().isEmpty() &&
                !notebook.getDate().isEmpty() &&
                !notebook.getStartTime().isEmpty() &&
                !notebook.getEndTime().isEmpty() &&
                !notebook.getModifiedAt().isEmpty() &&
                !notebook.getType().isEmpty() &&
                !notebook.getVisa().isEmpty() &&
                !notebook.getWorkload().toString().isEmpty() &&
                !notebook.getEstimatedTime().toString().isEmpty();
        ctx.assertTrue(isNotEmpty);
    }

    @Test
    public void testNotebookSubjectFieldCanUseJSONWithNull(TestContext ctx) {
        Notebook notebook = new Notebook(notebookJsonObject_1);
        notebook.setSubject(new Subject());
        notebook.getSubject().toJSON();

        ctx.assertEquals(new JsonObject()
                        .putNull("id")
                        .putNull("externalId")
                        .putNull("name")
                        .putNull("rank"),
                notebook.getSubject().toJSON());
    }
}
