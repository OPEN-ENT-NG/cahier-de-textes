package fr.openent.diary.services.impl;

import fr.openent.diary.models.ZIPFile;
import fr.openent.diary.services.ExportZIPService;
import fr.openent.diary.helper.FileHelper;
import io.vertx.core.AsyncResult;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.file.FileSystem;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.storage.Storage;
import org.entcore.common.utils.Zip;

import java.util.List;
import java.util.zip.Deflater;

public class ExportZIPServiceImpl implements ExportZIPService {

    private static final Logger log = LoggerFactory.getLogger(ExportZIPServiceImpl.class);
    private final Vertx vertx;
    private final Storage storage;

    /**
     * Service for managing .zip files from a list of file ids
     */
    public ExportZIPServiceImpl(Vertx vertx, Storage storage) {
        super();
        this.vertx = vertx;
        this.storage = storage;
    }

    /**
     * Create a .zip file from a list of file identifiers.
     * @param fileIds       list of file identifiers
     * @param fileNames     list of file names for each id
     *                      (ex: {'id1' : 'name1.pdf', 'id2': 'name2.pdf', 'id3': 'name3.jpg'})
     * @param zipFile       Object containing the desired .zip file name, path and subfolder path
     * @param handler       function handler returning data
     */
    @Override
    public void getZIP(List<String> fileIds, JsonObject fileNames, ZIPFile zipFile, Handler<AsyncResult<String>> handler) {
        generateTempFolder(fileIds, fileNames, zipFile)
                .compose(res -> createZIPFromTempFolder(zipFile))
                .setHandler(result -> {
                    if (result.failed()) {
                        log.error(result.cause());
                        handler.handle(Future.failedFuture(result.cause().getMessage()));
                        return;
                    }
                    handler.handle(Future.succeededFuture(result.result()));
                });
    }

    /**
     * Create temporary folder containing a copy of each file.
     * @param fileIds           list of file identifiers
     * @param fileNames         list of file names for each id
     * @param zipFile           Object containing the desired .zip file name, path and subfolder path
     * @return                  temporary folder path
     */
    private Future<JsonObject> generateTempFolder(List<String> fileIds, JsonObject fileNames, ZIPFile zipFile) {
        Future<JsonObject> future = Future.future();
        storage.writeToFileSystem(fileIds.toArray(new String[0]), zipFile.getDirPath(), fileNames, res -> {
            if ("ok".equals(res.getString("status"))) {
                future.complete(res);
            } else {
                future.fail(res.getString("error"));
            }
        });

        return future;
    }

    /**
     * Compress the temp folder into a .zip file.
     * @param zipFile       Object containing the desired .zip file name, path and subfolder path
     * @return              Zip file location path
     */
    private Future<String> createZIPFromTempFolder(ZIPFile zipFile) {
        Future<String> future = Future.future();

        Zip.getInstance().zipFolder(zipFile.getDirPath(), zipFile.getZipPath(), true, Deflater.NO_COMPRESSION, res2 -> {
            if ("ok".equals(res2.body().getString("status"))) {
                future.complete(res2.body().getString("destZip"));
            } else {
                String message = "[Diary@ExportZipServiceImpl::createZIPFromTempFolder] Failed to compress temporary folder to ZIP.";
                future.fail(message);
            }
        });

        return future;
    }

    /**
     * Remove a zip file.
     * @param zipFile       Object containing the .zip file name, path and subfolder path
     * @param handler       function handler returning data
     */
    @Override
    public void deleteZIP(ZIPFile zipFile, Handler<AsyncResult<Void>> handler) {
        FileSystem fs = vertx.fileSystem();
        FileHelper.removeDirectory(fs, zipFile.getRootPath(), res -> {
            if (res.failed()) {
                handler.handle(Future.failedFuture(res.cause().getMessage()));
            } else {
                handler.handle(Future.succeededFuture(res.result()));
            }
        });
    }
}
