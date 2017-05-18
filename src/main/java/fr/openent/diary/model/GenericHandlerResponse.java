package fr.openent.diary.model;

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
}

