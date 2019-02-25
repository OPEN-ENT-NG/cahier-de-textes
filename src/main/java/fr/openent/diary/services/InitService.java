package fr.openent.diary.services;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;

public interface InitService {


    void init( final  Handler<Either<String, JsonObject>>  handler);
}
