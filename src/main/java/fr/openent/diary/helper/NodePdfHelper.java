package fr.openent.diary.helper;

import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import org.entcore.common.pdf.PdfFactory;


public class NodePdfHelper {
    private PdfFactory pdfFactory;

    private NodePdfHelper() {
    }

    public static NodePdfHelper getInstance() {
        return NodePdfHolder.instance;
    }

    public void init(Vertx vertx, JsonObject config) {
        this.pdfFactory = new PdfFactory(vertx, new JsonObject().put("node-pdf-generator", new JsonObject()
                .put("url", config.getJsonObject("pdf-generator").getString("url"))
                .put("pdf-connector-id", config.getJsonObject("pdf-generator").getString("pdf-connector-id", "exportpdf"))
                .put("auth", config.getJsonObject("pdf-generator").getString("auth"))
        ));
    }

    public PdfFactory pdfFactory() {
        return this.pdfFactory;
    }

    private static class NodePdfHolder {
        private static final NodePdfHelper instance = new NodePdfHelper();

        private NodePdfHolder() { }
    }
}
