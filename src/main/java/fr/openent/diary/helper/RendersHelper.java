package fr.openent.diary.helper;

import com.samskivert.mustache.Mustache;
import com.samskivert.mustache.Template;
import fr.wseduc.webutils.I18n;
import fr.wseduc.webutils.Server;
import fr.wseduc.webutils.collections.JsonUtils;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import java.io.Reader;
import java.io.StringWriter;
import java.io.Writer;
import java.util.Map;

public class RendersHelper {
    protected static final Logger log = LoggerFactory.getLogger(RendersHelper.class);
    protected String pathPrefix;
    private final I18n i18n;
    protected Vertx vertx;
    protected JsonObject config;

    public RendersHelper(Vertx vertx, JsonObject config) {
        this.config = config;
        if (config != null) {
            this.pathPrefix = Server.getPathPrefix(config);
        }

        this.i18n = I18n.getInstance();
        this.vertx = vertx;
    }

    public void processTemplate(JsonObject p, String resourceName, Reader r, final Handler<Writer> handler) {
        final JsonObject params = p == null ? new JsonObject() : p.copy();
        this.getTemplate(resourceName, r, true, t -> {
            if (t != null) {
                try {
                    Writer writer = new StringWriter();
                    Map<String, Object> ctx = JsonUtils.convertMap(params);
                    RendersHelper.this.setLambdaTemplateRequest(ctx);
                    t.execute(ctx, writer);
                    handler.handle(writer);
                } catch (Exception var4) {
                    RendersHelper.log.error(var4.getMessage(), var4);
                    handler.handle(null);
                }
            } else {
                handler.handle(null);
            }
        });
    }


    private void getTemplate(String resourceName, Reader r, final boolean escapeHTML, final Handler<Template> handler) {
        if (resourceName != null && r != null && !resourceName.trim().isEmpty()) {
            Mustache.Compiler compiler = Mustache.compiler().defaultValue("");
            if (!escapeHTML) {
                compiler = compiler.escapeHTML(escapeHTML);
            }

            handler.handle(compiler.compile(r));
        } else {
            log.info("[Diary@RendersHelper::getTemplate] Failed to get template.");
        }
    }

    private void setLambdaTemplateRequest(Map<String, Object> ctx) {
        ctx.put("i18n", (Mustache.Lambda) (frag, out) -> {
            String key = frag.execute();
            String text = RendersHelper.this.i18n.translate(key, config.getString("host").split("//")[1], "fr", new String[0]);
            out.write(text);
        });
        ctx.put("static", (Mustache.Lambda) (frag, out) -> {
            String path = frag.execute();
            out.write(RendersHelper.this.staticResource(RendersHelper.this.config.getBoolean("ssl", false), (String) null, RendersHelper.this.pathPrefix + "/public", path));
        });
        ctx.put("infra", (Mustache.Lambda) (frag, out) -> {
            String path = frag.execute();
            out.write(RendersHelper.this.staticResource(RendersHelper.this.config.getBoolean("ssl", false), "8001", "/infra/public", path));
        });
        ctx.put("formatBirthDate", (Mustache.Lambda) (frag, out) -> {
            String date = frag.execute();
            if (date != null && date.trim().length() > 0) {
                String[] splitted = date.split("-");
                if (splitted.length == 3) {
                    out.write(splitted[2] + "/" + splitted[1] + "/" + splitted[0]);
                    return;
                }
            }

            out.write(date);
        });
    }

    private String staticResource(boolean https, String infraPort, String publicDir, String path) {
        String host = config.getString("host").split("//")[1];
        String protocol = https ? "https://" : "http://";
        if (infraPort != null) {
            host = host.split(":")[0] + ":" + infraPort;
        }

        return protocol + host + (publicDir != null && publicDir.startsWith("/") ? publicDir : "/" + publicDir) + "/" + path;
    }
}