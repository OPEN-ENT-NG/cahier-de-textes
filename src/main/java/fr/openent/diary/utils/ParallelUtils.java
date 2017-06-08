package fr.openent.diary.utils;

import fr.openent.diary.model.HandlerResponse;
import fr.openent.diary.model.util.KeyValueModel;
import org.vertx.java.core.Handler;

import java.util.List;

/**
 * Created by A664240 on 08/06/2017.
 */
public class ParallelUtils  {

    public static ParallelUtils parallel(){
        return new ParallelUtils();
    }

    public void add(Handler<HandlerResponse<? extends Handler>> handler){

    }
}
