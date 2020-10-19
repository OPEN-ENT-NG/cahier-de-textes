package fr.openent.diary.models.Person;

import io.vertx.core.json.JsonObject;

public class Student extends Person {

    private String classId;
    private String className;

    public Student(JsonObject student) {
        super();
        this.id = student.getString("id", null);
        this.displayName = student.getString("displayName", null);
        this.classId = student.getString("classId", null);
        this.className = student.getString("classeName", null);
        this.firstName = student.getString("firstName", null);
        this.lastName = student.getString("lastName", null);
    }

    public Student(String studentId) {
        super();
        this.id = studentId;
    }

    public String getClassId() {
        return classId;
    }

    public void setClassId(String classId) {
        this.classId = classId;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }
}
