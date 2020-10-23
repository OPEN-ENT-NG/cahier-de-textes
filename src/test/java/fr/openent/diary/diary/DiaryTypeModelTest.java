package fr.openent.diary.diary;

import fr.openent.diary.models.Audience;
import fr.openent.diary.models.DiaryTypeModel;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

import static org.mockito.Mockito.mock;

@RunWith(VertxUnitRunner.class)
public class DiaryTypeModelTest {

    private final JsonObject diaryTypeModelJsonObject_1 = new JsonObject()
            .put("id", 1)
            .put("structure_id", "5c04e497-cb43-4589-8332-16cc8a873920")
            .put("label", "labelTest")
            .put("rank", 8)
            .put("type", "typeTest");

    @Test
    public void testDiaryTypeTestNotNull(TestContext ctx) {
        JsonObject diaryTypeTestObjectMock = mock(JsonObject.class);
        DiaryTypeModel diaryTypeTest = new DiaryTypeModel(diaryTypeTestObjectMock);
        ctx.assertNotNull(diaryTypeTest);
    }

    @Test
    public void testDiaryTypeModelHasContentWithObject(TestContext ctx) {
        DiaryTypeModel diaryTypeModel = new DiaryTypeModel(diaryTypeModelJsonObject_1);
        boolean isNotEmpty = !diaryTypeModel.getId().equals(1) &&
                !diaryTypeModel.getStructureId().isEmpty() &&
                !diaryTypeModel.getLabel().isEmpty() &&
                !diaryTypeModel.getRank().equals(8) &&
                !diaryTypeModel.getType().isEmpty();
        ctx.assertTrue(isNotEmpty);
    }
}
