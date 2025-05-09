package fr.openent.diary.services.impl;

import fr.openent.diary.helper.FutureHelper;
import fr.openent.diary.services.HomeworkService;
import fr.openent.diary.services.SessionHomeworkService;
import fr.openent.diary.services.SessionService;
import fr.wseduc.webutils.Either;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.events.EventStore;
import org.entcore.common.user.UserInfos;

import java.util.ArrayList;
import java.util.List;

public class DefaultSessionsHomeworkService implements SessionHomeworkService {
    private static final Logger LOGGER = LoggerFactory.getLogger(DefaultSessionsHomeworkService.class);

    private SessionService sessionService;
    private HomeworkService homeworkService;

    public DefaultSessionsHomeworkService(EventBus eb, EventStore eventStore) {
        this.sessionService = new SessionServiceImpl(eb, eventStore);
        this.homeworkService = new HomeworkServiceImpl("diary", eb, eventStore);
    }

    @Override
    public void create(JsonObject sessionHomework, UserInfos user, Handler<Either<String, JsonObject>> handler) {
        JsonArray homeworks = sessionHomework.getJsonArray("homeworks");
        List<Future<JsonObject>> allSessionsFuture = new ArrayList<>();
        List<Future<JsonObject>> homeworkFutures = new ArrayList<>();
        for (int i = 0; i < homeworks.size(); i++) {
            JsonObject homework = homeworks.getJsonObject(i);
            JsonArray sessions = homework.getJsonArray("sessions");
            if (sessions != null && !sessions.isEmpty()) {
                for (int j = 0; j < sessions.size(); j++) {
                    // if already has identifier
                    if (sessions.getJsonObject(j).containsKey("id") &&
                            sessions.getJsonObject(j).getInteger("id") != null) {
                        // insert only homework based on session_id (id) and session's subject_id + audience_id + due_date
                        Promise<JsonObject> homeworkSessionPromise = Promise.promise();
                        allSessionsFuture.add(homeworkSessionPromise.future());
                        homeworkSessionPromise.complete(sessions.getJsonObject(j).put("homework", homework));
                    } else {
                        // insert session returning id and insert homework using that id and
                        // session's subject_id + audience_id + due_date
                        Promise<JsonObject> sessionPromise = Promise.promise();
                        allSessionsFuture.add(sessionPromise.future());
                        this.createSession(homework, sessions.getJsonObject(j), user, sessionPromise);
                    }
                }
            } else {
                // insert homework having session_id NULL  and its subject_id + due_date for each audience_ids
                JsonArray audience_ids = homework.getJsonArray("audience_ids");

                //Handle potential undefined audience_ids
                if(audience_ids != null) {
                    for (int j = 0; j < audience_ids.size(); j++) {
                        Promise<JsonObject> homeworkPromise = Promise.promise();
                        homeworkFutures.add(homeworkPromise.future());
                        homework.put("audience_id", audience_ids.getString(j));
                        this.createHomework(homework, user, homeworkPromise);
                    }
                }
            }
        }

        // All sessions whose each is created or fetched (having their current homework)
        Future.all(allSessionsFuture).onComplete(event -> {
            if (event.failed()) {
                String message = "[diary@DefaultSessionsHomeworkService::createSession] " +
                        "Failed to create session(s) ";
                LOGGER.error(message + event.cause());
                handler.handle(new Either.Left<>(message));
            } else {
                for (int j = 0; j < event.result().size(); j++) {
                    if (!((JsonObject) event.result().resultAt(j)).isEmpty()) {
                        JsonObject homeworkSession = event.result().resultAt(j);
                        Promise<JsonObject> homeworkPromise = Promise.promise();
                        homeworkFutures.add(homeworkPromise.future());
                        this.createHomework(formatHomeworkObjectWithSession(homeworkSession), user, homeworkPromise);
                    }
                }
                // All homework is created
                Future.all(homeworkFutures).onComplete(finalEvent -> {
                    if (finalEvent.failed()) {
                        String message = "[diary@DefaultSessionsHomeworkService::createSession] " +
                                "Failed to create homework in session(s) ";
                        LOGGER.error(message + finalEvent.cause());
                        handler.handle(new Either.Left<>(message));
                    } else {
                        handler.handle(new Either.Right<>(new JsonObject().put("status", "ok")));
                    }
                });
            }
        });
    }

    private JsonObject formatHomeworkObjectWithSession(JsonObject homeworkSession) {
        // need info (session_id...audience_id...etc...)
        return homeworkSession.getJsonObject("homework")
                .put("session_id", homeworkSession.getLong("id"))
                .put("from_session_id",  homeworkSession.getJsonObject("homework").getLong("from_session_id"))
                .put("due_date",    homeworkSession.getString("due_date"))
                .put("audience_id", homeworkSession.getString("audience_id", null))
                .put("subject_id", homeworkSession.getString("subject_id", null))
                .put("exceptional_label", homeworkSession.getString("exceptional_label", null));
    }

    private void createSession(JsonObject homework, JsonObject session, UserInfos user, Promise<JsonObject> promise) {
        this.sessionService.createSession(session, user, event -> {
            if (event.isRight()) {
                promise.complete(session
                        .put("id", event.right().getValue().getInteger("id"))
                        .put("homework", homework)
                );
            } else {
                String message = "[diary@DefaultSessionsHomeworkService::createSession::createSession] " +
                        "Failed to create session future(s) ";
                LOGGER.error(message + event.left().getValue());
                promise.fail(event.left().getValue());
            }
        });
    }

    private void createHomework(JsonObject homework, UserInfos user, Promise<JsonObject> promise) {
        this.homeworkService.createHomework(homework, user, event -> {
            if (event.isRight()) {
                promise.complete();
            } else {
                String message = "[diary@DefaultSessionsHomeworkService::createSession::createSession] " +
                        "Failed to create session future(s) ";
                LOGGER.error(message + event.left().getValue());
                promise.fail(event.left().getValue());
            }
        });
    }

    @Override
    public void update(JsonObject sessionHomework, Handler<Either<String, JsonObject>> handler) {
        JsonArray homeworks = sessionHomework.getJsonArray("homeworks");
        List<Future<JsonObject>> homeworkFutures = new ArrayList<>();

        for (int i = 0; i < homeworks.size(); i++) {
            // update homeworks statements based on session_id
            JsonObject homework = homeworks.getJsonObject(i);
            Promise<JsonObject> homeworkPromise = Promise.promise();
            homeworkFutures.add(homeworkPromise.future());
            this.homeworkService.updateHomework(homework.getInteger("id"), false, homework,
                    FutureHelper.handlerEitherPromise(homeworkPromise));
        }

        Future.all(homeworkFutures).onComplete(event -> {
            if (event.failed()) {
                String message = "[diary@DefaultSessionsHomeworkService::update] " +
                        "Failed to update homework(s) ";
                LOGGER.error(message + event.cause());
                handler.handle(new Either.Left<>(message));
            } else {
                handler.handle(new Either.Right<>(new JsonObject().put("status", "ok")));
            }
        });
    }
}
