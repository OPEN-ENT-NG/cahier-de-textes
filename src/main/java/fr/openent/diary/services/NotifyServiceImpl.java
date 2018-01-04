package fr.openent.diary.services;

import fr.wseduc.webutils.http.BaseController;
import org.entcore.common.notification.TimelineHelper;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.eventbus.EventBus;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;

import java.util.Date;
import java.util.List;

/**
 * Created by A664240 on 21/12/2017.
 */
public class NotifyServiceImpl {


    public enum NotifyEventType{
        HOMEWORK_EVENT_TYPE
    }

    private final static Logger log = LoggerFactory.getLogger(NotifyServiceImpl.class);

    private TimelineHelper notification;
    private EventBus eb;
    private String pathPrefix;


    public NotifyServiceImpl(TimelineHelper notification,EventBus eb,String pathPrefix){
        this.notification=notification;
        this.eb = eb;
        this.pathPrefix = pathPrefix;
    }

    public void notifyHomeworks(final String dueDate, final Long homeworkId, Long lessonId, final UserInfos sender, final List<String> users, final NotifyEventType notifyEventType){
        if (notifyEventType ==  NotifyEventType.HOMEWORK_EVENT_TYPE){

            String resourcePath = lessonId != null ? "#/editLessonView/"+ String.valueOf(lessonId) : "#/editHomeworkView/" + String.valueOf(homeworkId);

            JsonObject params = new JsonObject()
                    .putString("username", sender.getUsername())
                    .putString ("senderId",sender.getUserId())
                    .putString ("dueDate",dueDate)
                    .putString("resourcepath", pathPrefix + resourcePath);


            log.info(params.toString());

            String resourceId = lessonId != null ? String.valueOf(lessonId) : String.valueOf(homeworkId);

            notification.notifyTimeline(null, "diary.homeworkpublish", sender, users, resourceId, params);

        }
    }
}
