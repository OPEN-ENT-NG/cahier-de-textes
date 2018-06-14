package fr.openent.diary.model.progression;

/**
 * Created by A664240 on 26/05/2017.
 */
public class Progression {
    private Long id;
    private String level;
    private String title;



    private String description;
    private String teacherId;
    private Long nbLessons;

    public String getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(String teacherId) {
        this.teacherId = teacherId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getNbLessons() {
        return nbLessons;
    }

    public void setNbLessons(Long nbLessons) {
        this.nbLessons = nbLessons;
    }
}
