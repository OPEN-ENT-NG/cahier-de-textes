package fr.openent.diary.models;

import fr.openent.diary.models.Person.User;
import io.vertx.core.json.JsonObject;

public class Notebook {

    private String notebook_id;
    private Long id;
    private Subject subject;
    private String exceptional_label;
    private User teacher;
    private Audience audience;
    private Long sessions;
    private String description;
    private String annotation;
    private String title;
    private DiaryTypeModel diaryType;
    private Long workload;
    private String date;
    private String start_time;
    private String end_time;
    private String modified_at;
    private Boolean is_published;
    private Long estimatedTime;
    private Long session_id;
    private String type;
    private String visa;
    private Visa visas;

    public Notebook(JsonObject notebook) {
        this.notebook_id = notebook.getString("notebook_id", null);
        this.id = notebook.getLong("id", null);
        this.subject = new Subject(notebook.getString("subject_id"));
        this.exceptional_label = notebook.getString("exceptional_label", null);
        this.teacher = new User(notebook.getString("teacher_id"));
        this.audience = new Audience(notebook.getString("audience_id"));
        this.sessions = notebook.getLong("sessions", null);
        this.annotation = notebook.getString("annotation", null);
        this.description = notebook.getString("description", null);
        this.title = notebook.getString("title", null);
        this.diaryType = new DiaryTypeModel(notebook.getLong("type_id"));
        this.workload = notebook.getLong("workload", 0L);
        this.date = notebook.getString("date", null);
        this.start_time = notebook.getString("start_time", null);
        this.end_time = notebook.getString("end_time", null);
        this.modified_at = notebook.getString("modified", null);
        this.is_published = notebook.getBoolean("is_published", null);
        this.estimatedTime = notebook.getLong("estimatedtime", 0L);
        this.session_id = notebook.getLong("session_id", null);
        this.visa = notebook.getString("visa", null);
        this.type = notebook.getString("type", null);
        this.visas = notebook.getString("visas") != null ? new Visa(new JsonObject(notebook.getString("visas"))) : new Visa();
    }

    public JsonObject toJSON() {
        return new JsonObject()
                .put("notebook_id", this.notebook_id)
                .put("id", this.id)
                .put("subject", this.subject.toJSON())
                .put("exceptional_label", this.exceptional_label)
                .put("teacher", this.teacher.toJSON())
                .put("audience", this.audience.toJSON())
                .put("description", this.description)
                .put("title", this.title)
                .put("diaryType", this.diaryType.toJSON())
                .put("workload", this.workload)
                .put("sessions", this.sessions)
                .put("annotation", this.annotation)
                .put("date", this.date)
                .put("start_time", this.start_time)
                .put("end_time", this.end_time)
                .put("modified", this.modified_at)
                .put("is_published", this.is_published)
                .put("estimatedtime", this.estimatedTime)
                .put("session_id", this.session_id)
                .put("visa", this.visa)
                .put("type", this.type)
                .put("visas", this.visas.toJSON());
    }

    public String getNotebookId() {
        return notebook_id;
    }

    public void setNotebookId(String notebook_id) {
        this.notebook_id = notebook_id;
    }

    public Boolean isPublished() {
        return is_published;
    }

    public void setPublished(Boolean is_published) {
        this.is_published = is_published;
    }

    public Long getSessionId() {
        return session_id;
    }

    public void setSessionId(Long session_id) {
        this.session_id = session_id;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Subject getSubject() {
        return subject;
    }

    public void setSubject(Subject subject) {
        this.subject = subject;
    }

    public User getTeacher() {
        return teacher;
    }

    public void setTeacher(User teacher) {
        this.teacher = teacher;
    }

    public Audience getAudience() {
        return audience;
    }

    public void setAudience(Audience audience) {
        this.audience = audience;
    }

    public Long getSessions() {
        return sessions;
    }

    public void setSessions(Long sessions) {
        this.sessions = sessions;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public DiaryTypeModel getDiaryType() {
        return diaryType;
    }

    public void setDiaryType(DiaryTypeModel diaryType) {
        this.diaryType = diaryType;
    }

    public String getAnnotation() {
        return annotation;
    }

    public void setAnnotation(String annotation) {
        this.annotation = annotation;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getStartTime() {
        return start_time;
    }

    public void setStartTime(String start_time) {
        this.start_time = start_time;
    }

    public String getEndTime() {
        return end_time;
    }

    public void setEndTime(String end_time) {
        this.end_time = end_time;
    }

    public String getModifiedAt() {
        return modified_at;
    }

    public void setModifiedAt(String modified_at) {
        this.modified_at = modified_at;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getVisa() {
        return visa;
    }

    public void setVisa(String visa) {
        this.visa = visa;
    }

    public Visa getVisas() {
        return visas;
    }

    public void setVisas(Visa visas) {
        this.visas = visas;
    }

    public Long getWorkload() {
        return workload;
    }

    public void setWorkload(Long workload) {
        this.workload = workload;
    }

    public Long getEstimatedTime() {
        return estimatedTime;
    }

    public void setEstimatedTime(Long estimatedTime) {
        this.estimatedTime = estimatedTime;
    }
}
