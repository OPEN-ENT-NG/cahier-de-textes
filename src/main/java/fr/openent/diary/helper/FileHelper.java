package fr.openent.diary.helper;

import io.vertx.core.AsyncResult;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.file.FileSystem;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.storage.Storage;

import java.util.List;


public class FileHelper {
    private static final Logger log = LoggerFactory.getLogger(FileHelper.class);

    private FileHelper() {
        throw new IllegalStateException("Utility class");
    }

    public static void removeFiles(Storage storage, List<String> fileIds, Handler<AsyncResult<JsonObject>> handler) {
        if (fileIds.isEmpty()) {
            handler.handle(Future.succeededFuture(new JsonObject().put("remove file status", "ok")));
            return;
        }

        storage.removeFiles(new JsonArray(fileIds), result -> {
            if (!"ok".equals(result.getString("status"))) {
                String message = "[Diary@FileHelper::removeFiles] Failed to remove files.";
                log.error(message, result.getString("message"));
                handler.handle(Future.failedFuture(message));
                return;
            }
            handler.handle(Future.succeededFuture(result));
        });
    }

    public static void removeFile(Storage storage, String fileId, Handler<AsyncResult<JsonObject>> handler) {
        storage.removeFile(fileId, result -> {
            if (!"ok".equals(result.getString("status"))) {
                String message = "[Diary@FileHelper::removeFile] Failed to remove file.";
                log.error(message, result.getString("message"));
                handler.handle(Future.failedFuture(message));
                return;
            }
            handler.handle(Future.succeededFuture(result));
        });
    }

    public static void removeDirectory(FileSystem fileSystem, String directoryPath, Handler<AsyncResult<Void>> handler) {
        fileSystem.deleteRecursive(directoryPath, true, res -> {
            if (res.failed()) {
                String message = "[Diary@FileHelper::removeDirectory] Failed to remove directory.";
                handler.handle(Future.failedFuture(message));
            } else {
                handler.handle(Future.succeededFuture(res.result()));
            }
        });
    }

    public static void exist(Storage storage, String fileId, Handler<AsyncResult<Boolean>> handler) {
        storage.readFile(fileId, result -> {
            if (result == null) {
                handler.handle(Future.succeededFuture(false));
                return;
            }
            handler.handle(Future.succeededFuture(true));
        });
    }


    public static List<String> readDirectoryHandler(String path, AsyncResult<List<String>> dirResult, Handler<AsyncResult<Void>> handler) {
        if (dirResult.failed()) {
            String message = "[Diary@FileHelper::readDirectory] Failed to read directory " +
                    "at path: " + path + ". ";
            log.error(message, dirResult.cause());
            handler.handle(Future.failedFuture(message));
            return null;
        }
        return dirResult.result();
    }
}
