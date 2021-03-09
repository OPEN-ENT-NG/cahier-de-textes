package fr.openent.diary.models;

import fr.openent.diary.helper.NotebookHelper;
import fr.openent.diary.utils.DateUtils;
import fr.wseduc.webutils.I18n;
import io.vertx.core.json.JsonObject;
import org.entcore.common.utils.HtmlUtils;

import java.util.List;
import java.util.Locale;

public class NotebookPdf {

    private final String structureName;
    private final String audience;
    private final String subject;
    private final String teacher;
    private final boolean printPDF;
    private final String created;
    private final String owner_id;
    private final String modified;
    private final String comment;
    private final List<SessionPdf> sessions;

    public NotebookPdf(String structureName, Notebook notebook, List<Notebook> notebookSessions) {
        this.structureName = structureName;
        this.audience = notebook.getAudience().getName();
        this.subject = notebook.getSubject().getName();
        this.teacher = notebook.getTeacher().getName();
        this.printPDF = true;
        this.created = "";
        this.owner_id = "";
        this.modified = "";
        this.comment = notebook.getVisas().getComment();
        this.sessions = NotebookHelper.notebooksToSessionPdfs(notebookSessions);
    }

    public JsonObject toJSON() {
        return new JsonObject()
                .put("structureName", this.structureName)
                .put("audience", this.audience)
                .put("subject", this.subject)
                .put("teacher", this.teacher)
                .put("printPDF", this.printPDF)
                .put("created", this.created)
                .put("owner_id", this.owner_id)
                .put("modified", this.modified)
                .put("comment", this.comment)
                .put("sessions", this.sessions != null ? NotebookHelper.sessionPdfstoJSON(this.sessions) : null);
    }

    public String getAudience() {
        return audience;
    }

    public String getSubject() {
        return subject;
    }

    public String getTeacher() {
        return teacher;
    }


    public static class SessionPdf {

        private final String type;
        private final String title;
        private final String startDisplayDate;
        private String startDisplayTime;
        private String endDisplayTime;
        private final boolean hasDescription;
        private final String description;
        private final boolean hasHomeworks;
        private List<HomeworkPdf> homeworks;


        public SessionPdf(Notebook notebook, List<Notebook> homeworks) {
            this.type = notebook.getDiaryType().getLabel();
            this.title = notebook.getTitle();
            this.startDisplayDate = DateUtils.formatDate(DateUtils.parseDate(notebook.getDate(), DateUtils.DATE_FORMAT_SQL), DateUtils.DATE_FORMAT);
            if (notebook.getType().equals(Notebook.SESSION_TYPE)) {
                this.startDisplayTime = DateUtils.formatDate(DateUtils.parseDate(notebook.getStartTime(), DateUtils.HOUR_MINUTE_SECOND), DateUtils.HOUR_MINUTE);
                this.endDisplayTime = DateUtils.formatDate(DateUtils.parseDate(notebook.getEndTime(), DateUtils.HOUR_MINUTE_SECOND), DateUtils.HOUR_MINUTE);
            }

            this.hasDescription = notebook.getDescription() != null && !HtmlUtils.extractPlainText(notebook.getDescription()).equals("");
            this.description = notebook.getDescription();
            this.hasHomeworks = homeworks != null && !homeworks.isEmpty();
            if (hasHomeworks) {
                this.homeworks = NotebookHelper.notebooksToHomeworkPdfs(homeworks);
            }
        }

        public JsonObject toJSON() {
            return new JsonObject()
                    .put("type", this.type)
                    .put("title", this.title)
                    .put("startDisplayDate", this.startDisplayDate)
                    .put("startDisplayTime", this.startDisplayTime)
                    .put("endDisplayTime", this.endDisplayTime)
                    .put("hasDescription", this.hasDescription)
                    .put("description", this.description)
                    .put("hasHomeworks", this.hasHomeworks)
                    .put("homeworks", this.homeworks != null ? NotebookHelper.homeworkPdfstoJSON(this.homeworks) : null);
        }


        public static class HomeworkPdf {
            private final String type;
            private final String estimatedTime;
            private final boolean hasEstimatedTime;
            private final String description;

            public HomeworkPdf(Notebook notebook) {
                this.type = notebook.getDiaryType().getLabel();
                this.hasEstimatedTime = (notebook.getEstimatedTime() != null && notebook.getEstimatedTime() != 0);
                this.estimatedTime = hasEstimatedTime ? notebook.getEstimatedTime().toString() : "";
                I18n.getInstance().translate("homework.no.workload",
                        I18n.DEFAULT_DOMAIN, Locale.FRANCE);
                this.description = notebook.getDescription();
            }

            public JsonObject toJSON() {
                return new JsonObject()
                        .put("type", this.type)
                        .put("estimatedTime", this.estimatedTime)
                        .put("hasEstimatedTime", this.hasEstimatedTime)
                        .put("description", this.description);
            }
        }
    }
}