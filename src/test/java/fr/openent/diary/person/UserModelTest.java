package fr.openent.diary.person;

import fr.openent.diary.models.Person.User;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

import static org.mockito.Mockito.mock;

@RunWith(VertxUnitRunner.class)
public class UserModelTest {

    private final JsonObject userJsonObject_1 = new JsonObject()
            .put("id", "c142699b-38f8-49aa-93dd-45d0fd513e15")
            .put("firstName", "Jonathan")
            .put("lastName", "Casu")
            .put("displayName", "CASU Jonathan")
            .put("info", "jonathan.casu@yopmail.com");

    @Test
    public void testUserNotNull(TestContext ctx) {
        JsonObject userObjectMock = mock(JsonObject.class);
        User user = new User(userObjectMock);
        ctx.assertNotNull(user);
    }

    @Test
    public void testUserHasContentWithObject(TestContext ctx) {
        User user = new User(userJsonObject_1);
        boolean isNotEmpty = !user.getId().isEmpty() &&
                !user.getFirstName().isEmpty() &&
                !user.getLastName().isEmpty() &&
                !user.getName().isEmpty() &&
                !user.getEmail().isEmpty();
        ctx.assertTrue(isNotEmpty);
    }

    @Test
    public void testUserHasBeenInstantiated(TestContext ctx) {
        User user = new User(userJsonObject_1);
        ctx.assertEquals(user.toJSON(), userJsonObject_1);
    }

}
