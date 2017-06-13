package fr.openent.diary.model;

import fr.openent.diary.utils.StringUtils;
import fr.wseduc.webutils.http.Renders;
import org.entcore.common.controller.ControllerHelper;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;

/**
 * Created by A664240 on 16/05/2017.
 */
public class GenericHandlerResponse {

    private Boolean error = Boolean.FALSE;
    private String message;
    private final static Logger log = LoggerFactory.getLogger(GenericHandlerResponse.class);
    public GenericHandlerResponse(){}
    public GenericHandlerResponse(String errorMessage){
        setMessage(errorMessage);
    }

    public Boolean hasError() {
        return error;
    }

    public void setError(Boolean error) {
        this.error = error;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        setError(Boolean.TRUE);
        this.message = message;
    }

    public  static <T> Handler<HandlerResponse<T>> handler (final HttpServerRequest request){
        return new Handler<HandlerResponse<T>>() {
            @Override
            public void handle(HandlerResponse event) {
                try{
                    if (!event.hasError()){
                        if (event.getResult()!=null){
                            request.response()
                                    .putHeader("content-type", "application/json; charset=utf-8")
                                    .end(StringUtils.encodeJson(event.getResult()));
                        }else{
                            Renders.renderJson(request, new JsonObject().putString("status","ok"));
                        }

                    }else{
                        ControllerHelper.badRequest(request,event.getMessage());
                    }

                }
                catch(IllegalStateException ie){
                    //response already written
                    log.warn("response has already been written");
                }
            }
        };
    }

    public  static Handler<GenericHandlerResponse> genericHandle (final HttpServerRequest request){
        return new Handler<GenericHandlerResponse>() {
            @Override
            public void handle(GenericHandlerResponse event) {
                if (!event.hasError()){
                    Renders.renderJson(request, new JsonObject().putString("status","ok"));
                }else{
                    ControllerHelper.badRequest(request,event.getMessage());
                }
            }
        };
    }

}

