package fr.openent.diary.services;

import fr.openent.diary.models.ZIPFile;
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import java.util.List;

public interface ExportZIPService {

    void getZIP(List<String> fileIds, JsonObject fileNames, ZIPFile zipFile, Handler<AsyncResult<String>> handler);

    void deleteZIP(ZIPFile zipFile, Handler<AsyncResult<Void>> handler);

}
