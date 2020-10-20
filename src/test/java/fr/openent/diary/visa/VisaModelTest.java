package fr.openent.diary.visa;

import fr.openent.diary.models.Visa;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

import static org.mockito.Mockito.mock;

@RunWith(VertxUnitRunner.class)
public class VisaModelTest {

    JsonObject visaJsonObject_1 = new JsonObject()
            .put("comment", "ceci est un commentaire")
            .put("created", "2020-10-19T14:56:53")
            .put("id", 12441)
            .put("modified", "2020-10-19T14:56:53")
            .put("nb_sessions", 2)
            .put("owner_id", "b8e65abc-515f-4c99-9017-336b3a7c13f9")
            .put("owner_type", "headmaster")
            .put("pdf_details", "2c54189f-2c36-426b-8041-b2555d25d40b")
            .put("structure_id", "97a7363c-c000-429e-9c8c-d987b2a2c204")
            .put("teacher_id", "2225a66b-c3d3-418b-8567-ed9e3ad0f22e");

    @Test
    public void testVisaNotNull(TestContext ctx) {
        JsonObject subjectObjectMock = mock(JsonObject.class);
        Visa Visa = new Visa(subjectObjectMock);
        ctx.assertNotNull(Visa);
    }

    @Test
    public void testVisaHasContentWithObject(TestContext ctx) {
        Visa Visa = new Visa(visaJsonObject_1);
        boolean isNotEmpty =
                Visa.getId() != null &&
                        !Visa.getComment().isEmpty() &&
                        !Visa.getCreated().isEmpty() &&
                        !Visa.getModified().isEmpty() &&
                        Visa.getNbSessions() != 0 &&
                        !Visa.getOwnerId().isEmpty() &&
                        !Visa.getOwnerType().isEmpty() &&
                        !Visa.getPdfDetails().isEmpty() &&
                        !Visa.getStructureId().isEmpty() &&
                        !Visa.getTeacherId().isEmpty();
        ctx.assertTrue(isNotEmpty);
    }

    @Test
    public void testVisaHasBeenInstantiated(TestContext ctx) {
        Visa Visa = new Visa(visaJsonObject_1);
        ctx.assertEquals(Visa.toJSON(), visaJsonObject_1);
    }

}
