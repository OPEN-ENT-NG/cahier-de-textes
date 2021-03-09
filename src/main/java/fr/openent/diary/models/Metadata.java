package fr.openent.diary.models;

import io.vertx.core.json.JsonObject;

public class Metadata {
    private String name;
    private String contentType;
    private String contentTransferEncoding;
    private String filename;
    private Integer size;
    private String charset;

    public Metadata(String oMetadata) {
        if (oMetadata != null) {
            JsonObject metadata = new JsonObject(oMetadata);
            this.name = metadata.getString("name");
            this.contentType = metadata.getString("content-type");
            this.contentTransferEncoding = metadata.getString("content-transfer-encoding");
            this.filename = metadata.getString("filename");
            this.size = metadata.getInteger("size");
            this.charset = metadata.getString("charset");
        }
    }

    public JsonObject toJSON() {
        return new JsonObject()
                .put("name", this.name)
                .put("content_type", this.contentType)
                .put("content_transfer_encoding", this.contentTransferEncoding)
                .put("filename", this.filename)
                .put("size", this.size)
                .put("charset", this.charset);
    }

}
