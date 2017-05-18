package fr.openent.diary.model;

/**
 * Created by A664240 on 16/05/2017.
 */
public class HandlerResponse<T> extends GenericHandlerResponse{

    private T result;

    public HandlerResponse() {}
    public HandlerResponse(String errorMessage) {
        super(errorMessage);
    }

    public T getResult() {
        return result;
    }

    public void setResult(T result) {
        this.result = result;
    }
}
