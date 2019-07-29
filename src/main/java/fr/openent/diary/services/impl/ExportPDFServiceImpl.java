package fr.openent.diary.services.impl;

import fr.openent.diary.services.ExportPDFService;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.data.FileResolver;
import fr.wseduc.webutils.http.Renders;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.*;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.core.net.ProxyOptions;
import org.entcore.common.pdf.PdfException;
import org.entcore.common.storage.Storage;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;

import java.io.StringReader;
import java.io.StringWriter;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

import static fr.wseduc.webutils.Utils.isEmpty;
import static fr.wseduc.webutils.Utils.isNotEmpty;
import static fr.wseduc.webutils.http.Renders.badRequest;


public class ExportPDFServiceImpl implements ExportPDFService {
    private static final Logger log = LoggerFactory.getLogger(ExportPDFServiceImpl.class);
    private String pdfGeneratorURL;
    private JsonObject config;
    private Vertx vertx;
    private Renders renders;
    private Storage storage;
    private String authHeader;


    public ExportPDFServiceImpl(Vertx vertx, Storage storage, JsonObject config) {
        super();
        this.config = config;
        this.vertx = vertx;
        this.renders = new Renders(this.vertx, this.config);
        this.storage = storage;
        try {
            this.authHeader = "Basic " + (config.getJsonObject("pdf-generator").getString("auth"));
            this.pdfGeneratorURL = config.getJsonObject("pdf-generator").getString("url");
        } catch (Exception e) {
            log.info("can not get pdf generator var");
        }

    }

    public void generatePDF(final HttpServerRequest request, UserInfos user, final JsonObject templateProps, final String templateName, final Handler<Buffer> handler) {
        final String templatePath = config.getJsonObject("exports").getString("template-path");

        String absolutePathPrefix = FileResolver.absolutePath("./");
        //templateProps.put("pathPrefix", absolutePathPrefix);

        vertx.fileSystem().readFile(absolutePathPrefix + templatePath + templateName, result -> {
            if (!result.succeeded()) {
                badRequest(request);
                return;
            }
            StringReader reader = new StringReader(result.result().toString("UTF-8"));
            renders.processTemplate(request, templateProps, templateName, reader, writer -> {
                String processedTemplate = ((StringWriter) writer).getBuffer().toString();
                byte[] bytes;
                try {
                    bytes = processedTemplate.getBytes(StandardCharsets.UTF_8);
                } catch (Exception e) {
                    log.error(e.getMessage(), e);
                    badRequest(request, "Can not make the xhtml file");
                    return;
                }

                callNodePdfGenerator(bytes, user, bufferEither -> {

                    if (bufferEither.isLeft()) {
                        badRequest(request, bufferEither.left().getValue());
                        return;
                    }
                    Buffer either = bufferEither.right().getValue();
                    handler.handle(either);
                });
            });
        });
    }

    @Override
    public void getPDF(String pdfId, Handler<Buffer> handler) {
        storage.readFile(pdfId, handler);
    }

    @Override
    public void storePDF(Buffer pdf, String fileName, Handler<Either<String, JsonObject>> handler) {
        final String id = UUID.randomUUID().toString();

        storage.writeBuffer(id, pdf, "application/pdf", fileName, file -> {
            if ("ok".equals(file.getString("status"))) {
                handler.handle(new Either.Right<>(file));
            } else {
                log.error("An error occurred when inserting pdf in mongo");
            }
        });
    }

    private static HttpClient createHttpClient(Vertx vertx) {
        final HttpClientOptions options = new HttpClientOptions();
        options.setSsl(true);
        options.setTrustAll(true);
        options.setVerifyHost(false);
        if (System.getProperty("httpclient.proxyHost") != null) {
            ProxyOptions proxyOptions = new ProxyOptions()
                    .setHost(System.getProperty("httpclient.proxyHost"))
                    .setPort(Integer.parseInt(System.getProperty("httpclient.proxyPort")));
            options.setProxyOptions(proxyOptions);
        }
        return vertx.createHttpClient(options);
    }

    private static Buffer multipartBody(String content, String token, String boundary) {
        Buffer buffer = Buffer.buffer();
        // Add name
        buffer.appendString("--" + boundary + "\r\n")
                .appendString("Content-Disposition: form-data; name=\"name\"\r\n")
                .appendString("\r\n")
                .appendString("exportFile" + "\r\n");
        if (isNotEmpty(token)) {
            buffer.appendString("--" + boundary + "\r\n");
            buffer.appendString("Content-Disposition: form-data; name=\"token\"\r\n");
            buffer.appendString("\r\n");
            buffer.appendString(token + "\r\n");
        }
        // Add file
        buffer.appendString("--" + boundary + "\r\n")
                .appendString("Content-Disposition: form-data; name=\"template\"; filename=\"file\"\r\n")
                .appendString("Content-Type: application/xml\r\n")
                .appendString("\r\n")
                .appendString(content)
                .appendString("\r\n")
                .appendString("--" + boundary + "--\r\n");

        return buffer;
    }

    public String createToken(UserInfos user) throws Exception {

        final String token = UserUtils.createJWTToken(vertx, user, null, null);
        if (isEmpty(token)) {
            throw new PdfException("invalid.token");
        }
        return token;
    }


    private void webServiceNodePdfGeneratorPost(String file, String token, String nodePdfGeneratorUrl, Handler<Either<String, Buffer>> handler) {
        AtomicBoolean responseIsSent = new AtomicBoolean(false);
        URI url;
        try {
            url = new URI(nodePdfGeneratorUrl);
        } catch (URISyntaxException e) {
            handler.handle(new Either.Left<>("Bad request"));
            return;
        }
        HttpClient httpClient = createHttpClient(this.vertx);
        HttpClientRequest httpClientRequest =
                httpClient.postAbs(url.toString(), response -> {
                    if (response.statusCode() == 200) {
                        final Buffer buff = Buffer.buffer();
                        response.handler(buff::appendBuffer);
                        response.endHandler(end -> {
                            handler.handle(new Either.Right<>(buff));
                            if (!responseIsSent.getAndSet(true)) {
                                httpClient.close();
                            }
                        });
                    } else {
                        log.error("fail to post node-pdf-generator" + response.statusMessage());
                        response.bodyHandler(event -> {
                            log.error("Returning body after POST CALL : " + nodePdfGeneratorUrl
                                    + ", Returning body : " + event.toString("UTF-8"));
                            if (!responseIsSent.getAndSet(true)) {
                                httpClient.close();
                            }
                        });
                    }
                });

        httpClientRequest.exceptionHandler(new Handler<Throwable>() {
            @Override
            public void handle(Throwable event) {
                log.error(event.getMessage(), event);
                if (!responseIsSent.getAndSet(true)) {
                    handle(event);
                    httpClient.close();
                }
            }
        }).setFollowRedirects(true);
        final String boundary = UUID.randomUUID().toString();
        httpClientRequest.setChunked(true)
                .putHeader(HttpHeaders.CONTENT_TYPE, "multipart/form-data; boundary=" + boundary)
                .putHeader("Authorization", authHeader)
                .putHeader(HttpHeaders.ACCEPT, "*/*")
                .end(multipartBody(file, token, boundary));

    }

    private void callNodePdfGenerator(byte[] bytes, UserInfos user, Handler<Either<String, Buffer>> asyncResultHandler) {
        String token = null;
        try {
            token = createToken(user);
        } catch (Exception e) {
            log.error("Can not generate token, pdf create without token.", e);
        }

        String nodePdfGeneratorUrl = pdfGeneratorURL;
        webServiceNodePdfGeneratorPost(Buffer.buffer(bytes).toString(),
                token, nodePdfGeneratorUrl, asyncResultHandler);

    }
}