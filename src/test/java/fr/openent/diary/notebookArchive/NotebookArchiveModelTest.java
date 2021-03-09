package fr.openent.diary.notebookArchive;
import fr.openent.diary.models.*;
import io.vertx.core.json.*;
import io.vertx.ext.unit.*;
import io.vertx.ext.unit.junit.*;
import org.junit.*;
import org.junit.runner.*;

import static org.mockito.Mockito.mock;

@RunWith(VertxUnitRunner.class)
public class NotebookArchiveModelTest {

    private final JsonObject archiveJsonObject_1 = new JsonObject()
            .put("id", 1)
            .put("structure_id", "structureIdTest")
            .put("structure_label", "structureNameTest")
            .put("teacher_id", "teacherIdTest")
            .put("teacher_first_name", "Matt")
            .put("teacher_last_name", "Smith")
            .put("audience_label", "3A")
            .put("subject_label","MATHS")
            .put("archive_school_year", "2013-2014")
            .put("created_at", "2013-11-23")
            .put("file_id", "fileIdTest");

    @Test
    public void testNotebookNotNull(TestContext ctx) {
        JsonObject archivePdfObjectMock = mock(JsonObject.class);
        NotebookArchive archive = new NotebookArchive(archivePdfObjectMock);
        ctx.assertNotNull(archive);
    }

    @Test
    public void testNotebookHasContentWithObject(TestContext ctx) {
        NotebookArchive archive = new NotebookArchive(archiveJsonObject_1);
        boolean isNotEmpty = !archive.getId().toString().isEmpty() &&
                !archive.getStructureId().isEmpty() &&
                !archive.getStructureLabel().isEmpty() &&
                !archive.getTeacherId().isEmpty() &&
                !archive.getTeacherFirstName().isEmpty() &&
                !archive.getTeacherLastName().isEmpty() &&
                !archive.getAudienceLabel().isEmpty() &&
                !archive.getSubjectLabel().isEmpty() &&
                !archive.getArchiveSchoolYear().isEmpty() &&
                !archive.getCreatedAt().isEmpty() &&
                !archive.getFileId().isEmpty();
        ctx.assertTrue(isNotEmpty);
    }
}

