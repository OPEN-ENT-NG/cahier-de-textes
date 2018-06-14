package fr.openent.diary.model.progression;

/**
 * Created by A664240 on 26/05/2017.
 */
public class LessonProgression {

    private Long id;
    //REMOVE?
    private String type;
    private String title;
    private String description;
    private String subjectLabel;
    //REMOVE?
    private String teacherName;
    private String color;
    //CHANGE with s
    private String annotations;
    private Long orderIndex;
    private String teacherId;

    private String homeworks;

    private String subject;
    private String attachments;

    private Long progressionId;

    public String getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(String teacherId) {
        this.teacherId = teacherId;
    }


    public Long getProgressionId() {
        return progressionId;
    }

    public void setProgressionId(Long progressionId) {
        this.progressionId = progressionId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSubjectLabel() {
        return subjectLabel;
    }

    public void setSubjectLabel(String subjectLabel) {
        this.subjectLabel = subjectLabel;
    }

    public String getTeacherName() {
        return teacherName;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getAnnotations() {
        return annotations;
    }

    public void setAnnotations(String annotations) {
        this.annotations = annotations;
    }

    public Long getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Long orderIndex) {
        this.orderIndex = orderIndex;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getAttachments() {
        return attachments;
    }

    public void setAttachments(String attachments) {
        this.attachments = attachments;
    }

    public String getHomeworks() {
        return homeworks;
    }

    public void setHomeworks(String homeworks) {
        this.homeworks = homeworks;
    }



    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}
