package fr.openent.diary.test;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpServer;
import io.vertx.ext.unit.Async;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;


@RunWith(VertxUnitRunner.class)
public class SimpleTest {

    @Test
    public void testAsyncSucceed(TestContext ctx) {
        Async async = ctx.async();
        asyncManagement(true, res -> {
            ctx.assertTrue(res.isRight());
            ctx.assertEquals("ok", res.right().getValue());
            async.complete();
        });
    }

    @Test
    public void testAsyncFailed(TestContext ctx) {
        Async async = ctx.async();
        asyncManagement(false, res -> {
            ctx.assertTrue(res.isLeft());
            ctx.assertEquals("ko", res.left().getValue());
            async.complete();
        });
    }

    private void asyncManagement(boolean var, Handler<Either<String, String>> handler) {
        if (var) {
            handler.handle(new Either.Right<>("ok"));
            return;
        }
        handler.handle(new Either.Left<>("ko"));
    }
}