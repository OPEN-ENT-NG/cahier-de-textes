package fr.openent.diary.test;

import io.vertx.core.Vertx;
import io.vertx.ext.unit.Async;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(VertxUnitRunner.class)
public class SimpleTest {
    Vertx vertx = Vertx.vertx();

    @Test
    public void testReadI18nFile(TestContext ctx) {
        Async async = ctx.async();
        vertx.fileSystem().readFile("./i18n/fr.json", ar -> {
            if (ar.failed()) {
                ctx.fail(ar.cause());
            } else {
                System.out.println("File size:" + ar.result().length());
                async.complete();
            }
        });
    }
}