package fr.openent.diary.services;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.user.UserInfos;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class HomeworkServiceImpl implements HomeworkService {

    private DiaryService diaryService = new DiaryServiceImpl();

    @Override
    public void getHomework(long homeworkId, Handler<Either<String, JsonObject>> handler) {
        StringBuilder query = new StringBuilder();
        query.append(" SELECT h.*, to_json(type) as type");
        query.append(" FROM diary.homework h");
        query.append(" LEFT JOIN diary.homework_type AS type ON type.id = h.type_id");
        query.append(" WHERE h.id = ").append(homeworkId);

        Sql.getInstance().raw(query.toString(), SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void getOwnHomeworks(String startDate, String endDate, UserInfos user, Handler<Either<String, JsonArray>> handler) {
        if (user.getType().equals("Student")) {
            this.getChildHomeworks(startDate, endDate, user.getUserId(), handler);
        } else if (user.getType().equals("Teacher")) {
            this.getHomeworks(startDate, endDate, user.getUserId(), null, null, false, false, false, handler);
        }
    }

    @Override
    public void getExternalHomeworks(String startDate, String endDate, String type, String typeId, Handler<Either<String, JsonArray>> handler) {
        List<String> listAudienceId = "audience".equals(type) ? Arrays.asList(typeId) : null;
        List<String> listTeacherId = "teacher".equals(type) ? Arrays.asList(typeId) : null;

        this.getHomeworks(startDate, endDate, null, listAudienceId, listTeacherId, true, false, false, handler);
    }

    @Override
    public void getChildHomeworks(String startDate, String endDate, String childId, Handler<Either<String, JsonArray>> handler) {
        // Get child audiences
        diaryService.getAudienceFromChild(childId, response -> {
            if(response.isRight()){
                List<String> listAudienceId = new ArrayList<>();
                JsonArray result = response.right().getValue();
                for (int i = 0; i < result.size(); i++) {
                    listAudienceId.add(result.getJsonObject(i).getString("audienceId"));
                }
                this.getHomeworks(startDate, endDate, null, listAudienceId, null, true, false, false, handler);
            }
        });
    }

    /**
     * Query homeworks
     * @param startDate return homeworks in the date or after
     * @param endDate return homeworks in the date or before
     * @param ownerId return homeworks with this ownerId
     * @param listAudienceId return homeworks with a audience_id field inside this list
     * @param listTeacherId return homeworks with a teacher_id field inside this list
     * @param onlyPublished returns only published homeworks
     * @param onlyVised returns only the homeworks with visa
     * @param agregVisas returns the homeworks with the field visas
     * @param handler
     */
    private void getHomeworks(String startDate, String endDate, String ownerId, List<String> listAudienceId, List<String> listTeacherId,
                             boolean onlyPublished, boolean onlyVised, boolean agregVisas, Handler<Either<String, JsonArray>> handler) {
        JsonArray values = new JsonArray();
        StringBuilder query = new StringBuilder();
        query.append(" SELECT h.*, to_json(type) as type ");
        query.append(" FROM diary.homework h");
        query.append(" LEFT JOIN diary.homework_type AS type ON type.id = h.type_id");

        if (startDate != null && endDate != null) {
            query.append(" AND h.due_date >= to_date(?,'YYYY-MM-DD')");
            query.append(" AND h.due_date <= to_date(?,'YYYY-MM-DD')");
            values.add(startDate);
            values.add(endDate);
        }

        if (listAudienceId != null) {
            query.append("AND h.audience_id IN ").append(Sql.listPrepared(listAudienceId.toArray()));
            for (String audienceId : listAudienceId) {
                values.add(audienceId);
            }
        }

        if (listTeacherId != null) {
            query.append("AND h.teacher_id IN ").append(Sql.listPrepared(listTeacherId.toArray()));
            for (String teacherId : listTeacherId) {
                values.add(teacherId);
            }
        }

        if (onlyPublished) {
            query.append(" AND h.is_published = true");
        }

        if (ownerId != null) {
            query.append(" AND h.owner_id = ?");
            values.add(ownerId);
        }

        query.append(" ORDER BY h.due_date ASC");

        Sql.getInstance().prepared(query.toString().replaceFirst("AND", "WHERE"), values, SqlResult.validResultHandler(handler));
    }

    @Override
    public void createHomework(JsonObject homework, UserInfos user, Handler<Either<String, JsonObject>> handler) {
        JsonArray values = new JsonArray();
        String query = "INSERT INTO diary.homework (subject_id, structure_id, teacher_id, audience_id, title, " +
                "color, description, is_published, session_id, due_date, type_id, owner_id " +
                ", created, modified) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, " +
                "to_date(?,'YYYY-MM-DD'), ?, ?, NOW(), NOW()) RETURNING id";

        values.add(homework.getString("subject_id"));
        values.add(homework.getString("structure_id"));
        values.add(user.getUserId());
        values.add(homework.getString("audience_id"));
        values.add(homework.getString("title"));
        values.add(homework.getString("color"));
        values.add(homework.getString("description"));
        if(homework.getBoolean("is_published") != null) {
            values.add(homework.getBoolean("is_published"));
        } else {
            values.add(false);
        }

        if (homework.getInteger("session_id") != null) {
            values.add(homework.getInteger("session_id"));
        } else {
            values.addNull();
        }

        if (homework.getString("due_date") != null) {
            values.add(homework.getString("due_date"));
        } else {
            values.addNull();
        }
        values.add(homework.getInteger("type_id"));
        values.add(user.getUserId());

        Sql.getInstance().prepared(query, values, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void updateHomework(long homeworkId, JsonObject homework, Handler<Either<String, JsonObject>> handler) {
        JsonArray values = new JsonArray();
        String query = "UPDATE diary.homework " +
                "SET subject_id = ?, structure_id = ?, audience_id = ?, title = ?, " +
                " color = ?, description = ?, is_published = ?, session_id = ?, due_date = ?, type_id = ?, " +
                " modified = NOW() " +
                " WHERE id = ?;";

        values.add(homework.getString("subject_id"));
        values.add(homework.getString("structure_id"));
        values.add(homework.getString("audience_id"));
        values.add(homework.getString("title"));
        values.add(homework.getString("color"));
        values.add(homework.getString("description"));
        if(homework.getBoolean("is_published") != null) {
            values.add(homework.getBoolean("is_published"));
        } else {
            values.add(false);
        }

        if (homework.getInteger("session_id") != null) {
            values.add(homework.getInteger("session_id"));
        } else {
            values.addNull();
        }

        if (homework.getString("due_date") != null) {
            values.add(homework.getString("due_date"));
        } else {
            values.addNull();
        }
        values.add(homework.getInteger("type_id"));

        values.add(homeworkId);

        Sql.getInstance().prepared(query, values, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void deleteHomework(long homeworkId, Handler<Either<String, JsonObject>> handler) {
        String query = "DELETE FROM diary.homework WHERE id = " + homeworkId;
        Sql.getInstance().raw(query, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void publishHomework(long homeworkId, Handler<Either<String, JsonObject>> handler) {
        String query = "UPDATE diary.homework SET is_published = true WHERE id = " + homeworkId;
        Sql.getInstance().raw(query, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void unpublishHomework(long homeworkId, Handler<Either<String, JsonObject>> handler) {
        String query = "UPDATE diary.homework SET is_published = false WHERE id = " + homeworkId;
        Sql.getInstance().raw(query, SqlResult.validUniqueResultHandler(handler));
    }

    @Override
    public void getHomeworkTypes(Handler<Either<String, JsonArray>> handler) {
        String query = "SELECT * FROM diary.homework_type";

        Sql.getInstance().raw(query, SqlResult.validResultHandler(handler));
    }

    @Override
    public void getWorkloadWeek(final String date, final String audienceId, Handler<Either<String, JsonArray>> handler) {
        if (date != null && !date.isEmpty()) {

            StringBuilder query = new StringBuilder();
            query.append(" select z.day, COALESCE(sum(h.workload),0) as total, count(h.*) as count from  " );
            query.append(" ( " );
            query.append(" select (date_trunc('week',to_date(?, 'YYYY-MM-DD'))::date) + i as day " );
            query.append(" from generate_series(0,6) i " );
            query.append(" ) z " );
            query.append(" left outer join diary.homework h on h.due_date = z.day and h.audience_id = ? " );
            query.append(" group by z.day order by z.day " );

            JsonArray parameters = new fr.wseduc.webutils.collections.JsonArray();
            parameters.add(date);
            parameters.add(audienceId);

            Sql.getInstance().prepared(query.toString(), parameters, SqlResult.validResultHandler(handler));
        }
    }

}
