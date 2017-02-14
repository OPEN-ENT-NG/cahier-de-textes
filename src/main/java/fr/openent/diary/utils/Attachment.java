package fr.openent.diary.utils;

/**
 * Created by a457593 on 14/02/2017.
 */
public class Attachment {

    private Long id;

    private String userId;

    private String documentLabel;

    private String entId;

    public Attachment(String entId) {
        this.entId = entId;
    }

    public Attachment(String entId, String userId) {
        this.userId = userId;
        this.entId = entId;
    }

    public Attachment() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getDocumentLabel() {
        return documentLabel;
    }

    public void setDocumentLabel(String documentLabel) {
        this.documentLabel = documentLabel;
    }

    public String getEntId() {
        return entId;
    }

    public void setEntId(String entId) {
        this.entId = entId;
    }

    public String toQuery(String schema, String table) {

        StringBuilder sb = new StringBuilder("INSERT INTO ");
        sb.append(schema).append(".").append(table);
        sb.append("VALUES (").append(this.id).append(",'");
        sb.append(this.userId).append("','");
        sb.append(this.entId).append("',current_date,'");
        sb.append(this.documentLabel).append("'");
        sb.append(");");

        return sb.toString();
    }
}




