package fr.openent.diary.utils;

import fr.openent.diary.model.GenericHandlerResponse;
import fr.openent.diary.model.HandlerResponse;
import fr.openent.diary.model.lessonview.HomeworkModel;
import fr.wseduc.webutils.http.Renders;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;

import java.util.List;
import java.util.Map;

/**
 * Created by A664240 on 14/06/2017.
 */
public class HandlerUtils {


    public static <T> void renderResponse(Handler<HandlerResponse<T>> handler, T toRender){
        HandlerResponse<T> response = new HandlerResponse<>();
        response.setResult(toRender);
        handler.handle(response);
    }



    public static <T> void checkError(GenericHandlerResponse response, Handler<HandlerResponse<T>> handler){
        if (response.hasError()){
            HandlerResponse<T> responseError = new HandlerResponse<>();
            responseError.setMessage(response.getMessage());
            handler.handle(responseError);
            throw new RuntimeException(response.getMessage());
        }
    }


    public static <T> void checkGenericError(GenericHandlerResponse response, Handler<GenericHandlerResponse> handler){
        if (response.hasError()){
            HandlerResponse<T> responseError = new HandlerResponse<>();
            responseError.setMessage(response.getMessage());
            handler.handle(responseError);
            throw new RuntimeException(response.getMessage());
        }
    }

    public static <T> void error(Throwable t,  Handler<HandlerResponse<T>> handler){
        HandlerResponse<T> responseError = new HandlerResponse<>();
        responseError.setMessage(t.getMessage());
        handler.handle(responseError);
    }


    public static void genericError(Throwable t,  Handler<GenericHandlerResponse> handler){
        GenericHandlerResponse  responseError = new GenericHandlerResponse (t.getMessage());

        handler.handle(responseError);
    }
}
