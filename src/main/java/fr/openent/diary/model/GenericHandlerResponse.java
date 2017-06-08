package fr.openent.diary.model;

import fr.openent.diary.model.visa.VisaFilters;
import fr.openent.diary.utils.StringUtils;
import fr.wseduc.webutils.http.Renders;
import org.entcore.common.controller.ControllerHelper;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonObject;

/**
 * Created by A664240 on 16/05/2017.
 */
public class GenericHandlerResponse {

    private Boolean error = Boolean.FALSE;
    private String message;

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

