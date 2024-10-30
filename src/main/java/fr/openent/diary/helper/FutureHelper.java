package fr.openent.diary.helper;

import fr.wseduc.webutils.Either;
import io.vertx.core.*;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

import java.util.List;

public class FutureHelper {

    private static final Logger LOGGER = LoggerFactory.getLogger(FutureHelper.class);

    private FutureHelper() {
    }



    public static Handler<Either<String, JsonArray>> handlerJsonArray(Handler<AsyncResult<JsonArray>> handler) {
        return event -> {
            if (event.isRight()) {
                handler.handle(Future.succeededFuture(event.right().getValue()));
            } else {
                LOGGER.error(event.left().getValue());
                handler.handle(Future.failedFuture(event.left().getValue()));
            }
        };
    }

    public static Handler<Either<String, JsonObject>> handlerJsonObject(Handler<AsyncResult<JsonObject>> handler) {
        return event -> {
            if (event.isRight()) {
                handler.handle(Future.succeededFuture(event.right().getValue()));
            } else {
                LOGGER.error(event.left().getValue());
                handler.handle(Future.failedFuture(event.left().getValue()));
            }
        };
    }

    public static <L,R> Handler<Either<L,R>> handlerEitherPromise(Promise<R> promise){
        return event -> {
            if (event.isRight()) {
                promise.complete(event.right().getValue());
            } else {
                String message = String.format("[Diary@%s::handlerEitherPromise]: %s",
                        FutureHelper.class.getSimpleName(), event.left().getValue());
                LOGGER.error(message);
                promise.fail(event.left().getValue().toString());
            }
        };
    }

}
