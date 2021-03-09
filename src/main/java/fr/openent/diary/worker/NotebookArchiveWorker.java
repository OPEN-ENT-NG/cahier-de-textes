package fr.openent.diary.worker;

import fr.openent.diary.eventbus.Viescolaire;
import fr.openent.diary.helper.FutureHelper;
import fr.openent.diary.helper.NotebookArchiveHelper;
import fr.openent.diary.helper.NotebookHelper;
import fr.openent.diary.services.NotebookArchiveService;
import fr.openent.diary.services.NotebookService;
import fr.openent.diary.services.impl.DefaultNotebookArchiveService;
import fr.openent.diary.services.impl.DefaultNotebookService;
import fr.openent.diary.utils.DateUtils;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.Message;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.storage.Storage;
import org.entcore.common.storage.StorageFactory;
import org.vertx.java.busmods.BusModBase;

import java.util.Arrays;
import java.util.Calendar;
import java.util.Objects;

public class NotebookArchiveWorker extends BusModBase implements Handler<Message<JsonObject>> {
    private final Logger log = LoggerFactory.getLogger(NotebookArchiveWorker.class);
    private static final int ARCHIVE_MONTH = Calendar.AUGUST;
    private static final int ARCHIVE_MONTH_DAY = 15;
    private static final int ARCHIVE_YEAR_NUMBER = 2;
    private static final int ARCHIVE_REMOVE_YEAR_NUMBER = 5;
    public static final String ANSI_RESET = "\u001B[0m";
    public static final String ANSI_CYAN = "\u001B[36m";
    private static final String ARCHIVE_FLAG = "[DIARY:ARCHIVE]";


    private NotebookService notebookService;
    private NotebookArchiveService archiveService;

    @Override
    public void start() {
        super.start();
        Storage storage = new StorageFactory(vertx, config).getStorage();
        this.notebookService = new DefaultNotebookService(eb, vertx, storage, config);
        this.archiveService = new DefaultNotebookArchiveService(eb, storage);
        eb.consumer(this.getClass().getName(), this);
    }

    @Override
    public void handle(Message<JsonObject> eventMessage) {
        log.info("[" + this.getClass().getSimpleName() + "] receiving");
        log.info(ANSI_CYAN + ARCHIVE_FLAG + " Begin to process" + ANSI_RESET);
        eventMessage.reply(new JsonObject().put("status", "ok"));
        JsonObject structure = eventMessage.body().getJsonObject("structure", new JsonObject());
        String structureId = structure.getString("id");
        String structureName = structure.getString("name");
        Integer schoolYearToArchive = eventMessage.body().getInteger("schoolYear");

        if (schoolYearToArchive == null) processYearTransition(structureId, structureName);
        else processArchive(structureId, structureName, schoolYearToArchive);
    }

    private void processYearTransition(String structureId, String structureName) {
        Viescolaire.getInstance().getSchoolYearPeriod(structureId, schoolYearPeriodResult -> {
            JsonObject schoolYearPeriod = schoolYearPeriodResult.result();
            Integer baseYear = getEndPeriodYear(schoolYearPeriod);

            String archiveDate = getArchiveDayYearsBefore(ARCHIVE_YEAR_NUMBER, baseYear);
            String removeArchivePeriod = getArchivePeriod(getArchiveDayYearsBefore(ARCHIVE_YEAR_NUMBER + ARCHIVE_REMOVE_YEAR_NUMBER, baseYear));
            String removeNotebookDate = getArchiveDayYearsBefore(ARCHIVE_YEAR_NUMBER + ARCHIVE_REMOVE_YEAR_NUMBER, baseYear);


            Future<JsonObject> removeNotebooksArchiveFuture = removingNotebookArchiveProcess(structureId, removeArchivePeriod);
            Future<JsonObject> removeNotebooksFuture = removingNotebooksProcess(structureId, removeNotebookDate);

            FutureHelper.join(Arrays.asList(removeNotebooksArchiveFuture, removeNotebooksFuture)).setHandler(result -> {
                if (result.failed()) {
                    log.error("[Diary@NotebookArchiveWorker::processNotebookArchive] An error occurred while removing archives data",
                            result.cause().getMessage());
                }

                archivingProcess(structureId, structureName, archiveDate);
            });
        });
    }

    private void processArchive(String structureId, String structureName, Integer schoolYear) {
        Calendar date = getCalendarArchiveDay(schoolYear);
        archivingProcess(structureId, structureName, DateUtils.formatDate(date.getTime(), DateUtils.DATE_FORMAT_SQL));
    }

    private Future<JsonObject> removingNotebookArchiveProcess(String structureId, String removeArchivePeriod) {
        Future<JsonObject> future = Future.future();
        log.info(ANSI_CYAN + ARCHIVE_FLAG + " Get old notebook archives to delete them" + ANSI_RESET);
        archiveService.getNotebookArchives(structureId, removeArchivePeriod, null, null,
                null, null, null)
                .compose(notebooksArchive -> {
                    log.info(ANSI_CYAN + ARCHIVE_FLAG + " Start to delete old notebook archives" + ANSI_RESET);
                    return archiveService.delete(NotebookArchiveHelper.notebookArchives(notebooksArchive));
                })
                .setHandler(result -> {
                    future.handle(result);
                    log.info(ANSI_CYAN + ARCHIVE_FLAG + " Deleting old notebook archives end" + ANSI_RESET);
                });

        return future;
    }

    private Future<JsonObject> removingNotebooksProcess(String structureId, String removeDate) {
        Future<JsonObject> future = Future.future();
        log.info(ANSI_CYAN + ARCHIVE_FLAG + " Start to delete old notebooks" + ANSI_RESET);
        archiveService.deleteOldNotebooksAndVisas(structureId, removeDate, result -> {
            future.handle(result);
            log.info(ANSI_CYAN + ARCHIVE_FLAG + " Deleting old notebooks end" + ANSI_RESET);
        });

        return future;
    }

    private void archivingProcess(String structureId, String structureName, String archiveDate) {
        log.info(ANSI_CYAN + ARCHIVE_FLAG + " Get notebooks to archive them" + ANSI_RESET);
        String archivePeriod = getArchivePeriod(archiveDate);
        notebookService.getNotebooks(structureId, null, archiveDate, null, null, null,
                null, null, null, null, null)
                .compose(toArchiveNotebooks -> {
                    log.info(ANSI_CYAN + ARCHIVE_FLAG + " Start to archive notebooks" + ANSI_RESET);
                    return notebookService.archiveNotebooks(structureId, structureName, archiveDate, archivePeriod,
                            NotebookHelper.toNotebookList(toArchiveNotebooks));
                })
                .setHandler(resultArchive -> log.info(ANSI_CYAN + ARCHIVE_FLAG + " Archiving end and process complete" + ANSI_RESET));
    }

    private Calendar getCalendarArchiveDay(Integer basedYear) {
        Calendar calendar = Calendar.getInstance();
        if (basedYear != null) calendar.set(Calendar.YEAR, basedYear);
        calendar.set(Calendar.MONTH, ARCHIVE_MONTH);
        calendar.set(Calendar.DAY_OF_MONTH, ARCHIVE_MONTH_DAY);
        return calendar;
    }

    private String getArchiveDayYearsBefore(int yearsNumber, Integer basedYear) {
        Calendar date = getCalendarArchiveDay(basedYear);
        date.add(Calendar.YEAR, -yearsNumber);
        return DateUtils.formatDate(date.getTime(), DateUtils.DATE_FORMAT_SQL);
    }

    private String getArchivePeriod(String date) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(Objects.requireNonNull(DateUtils.parseDate(date, DateUtils.DATE_FORMAT_SQL)));
        String endYear = DateUtils.formatDate(calendar.getTime(), DateUtils.YEAR);
        calendar.add(Calendar.YEAR, -1);
        return DateUtils.formatDate(calendar.getTime(), DateUtils.YEAR) + "-" + endYear;
    }


    private Integer getEndPeriodYear(JsonObject schoolYearPeriod) {
        Integer result = null;
        if (schoolYearPeriod != null) {
            String endDate = schoolYearPeriod.getString("end_date");
            if (endDate != null) {
                Calendar calendar = Calendar.getInstance();
                calendar.setTime(Objects.requireNonNull(DateUtils.parseDate(endDate,
                        endDate.contains("T") ? DateUtils.SQL_FORMAT : DateUtils.DATE_FORMAT_SQL)));
                result = calendar.get(Calendar.YEAR);
            }
        }
        return result;
    }

}
