package fr.openent.diary.services;

import fr.openent.diary.models.Notebook;
import fr.wseduc.webutils.Either;
import io.vertx.core.AsyncResult;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.List;

public interface NotebookService {

    /**
     * Fetch main notebooks (gathering of sessions/homeworks)
     *
     * @param structure_id structure identifier
     * @param start_at     start date
     * @param end_at       end date
     * @param teacher_id   list teacher identifiers
     * @param audience_id  list audience identifiers
     * @param isVisa       filter VISA
     * @param visaOrder    filter VISA ORDER ASC OR DESC
     * @param isPublished  filter Published
     * @param page         pagination
     * @param limit        limit
     * @param offset       offset
     * @param handler      function handler returning da
     */
    void get(String structure_id, String start_at, String end_at, List<String> teacher_id, List<String> audience_id,
             Boolean isVisa, String visaOrder, Boolean isPublished, Integer page, String limit, String offset,
             Handler<Either<String, JsonObject>> handler);

    void getNotebooks(String structure_id, String start_at, String end_at, List<String> teacher_ids,
                      List<String> audience_ids, Boolean isVisa, String visaOrder, Boolean isPublished, Integer page,
                      String limit, String offset, Promise<JsonArray> promise);

    Future<JsonArray> getNotebooks(String structureId, String starAt, String enAt, List<String> teacherIds,
                                   List<String> audienceIds, Boolean isVisa, String visaOrder, Boolean isPublished, Integer page,
                                   String limit, String offset);


    /**
     * archives each notebooks of a given school year
     *
     * @param structureId   structure identifier
     * @param structureName structure name
     * @param date          correspond to the end of period to archive
     * @param notebooks     notebooks of the corresponding in period
     */
    Future<Void> archiveNotebooks(String structureId, String structureName, String date, String archivePeriod, List<Notebook> notebooks);

    /**
     * Fetch all sessions/homeworks in a notebook
     *
     * @param structure_id structure identifier
     * @param start_at     start date
     * @param end_at       end date
     * @param teacher_id   list teacher identifiers
     * @param audience_id  list audience identifiers
     * @param isVisa       filter VISA
     * @param isPublished  filter Published
     * @param handler      function handler returning da
     */
    void getNotebookHomeworksSessions(String structure_id, String start_at, String end_at, String subject_id, String teacher_id,
                                      String audience_id, Boolean isVisa, Boolean isPublished, Handler<Either<String, JsonArray>> handler);
}
