package fr.openent.diary.utils;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.module.SimpleModule;
import fr.openent.diary.model.GenericHandlerResponse;
import fr.openent.diary.model.HandlerResponse;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.request.RequestUtils;
import org.entcore.common.sql.Sql;
import org.entcore.common.sql.SqlResult;
import org.entcore.common.sql.SqlStatementsBuilder;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.Message;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

import java.beans.BeanInfo;
import java.beans.Introspector;
import java.beans.PropertyDescriptor;
import java.io.IOException;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.text.SimpleDateFormat;
import java.util.*;

import static org.entcore.common.sql.SqlResult.validRowsResultHandler;
import static org.entcore.common.sql.SqlResult.validUniqueResultHandler;



public class SqlMapper<T> {

    public static ObjectMapper mapper = new ObjectMapper(){{
            registerModule(new SimpleModule("MultiDateModule"){{
                addDeserializer(Date.class, new MultiDateSerializer());
                }
            });
        }
    };

    static{

        mapper.configure(JsonParser.Feature.ALLOW_COMMENTS, true);
        mapper.configure(SerializationFeature.INDENT_OUTPUT, true);
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        mapper.setDateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSSSSSZ"));
    }

    private Class clazz;
    private Sql sql;
    private Map<String,String> keyMap = new HashMap<>();
    private String databaseTableSc;
    private final static Logger log = LoggerFactory.getLogger(SqlMapper.class);

    public SqlMapper(Class clazz,String databaseTableSc, Sql sql){
        this.clazz = clazz;
        this.databaseTableSc=databaseTableSc;
        this.sql =sql;
        Field[] classFields = this.clazz.getDeclaredFields();
        for( Field field : classFields ){
            String fieldName = field.getName().toString();
            keyMap.put(fieldName.toLowerCase(), fieldName);
        }
    }

    public static <T> void mappRequest(final HttpServerRequest request, final Class clazz , final Handler<HandlerResponse<T>> handler){
        RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
            @Override
            public void handle(JsonObject json) {
                HandlerResponse<T> response = new HandlerResponse<T>();
                try{
                    if (json!=null){
                        response.setResult((T)mapper.readValue(json.toString(), clazz));
                    }else{
                        response.setMessage("request body cannot be null");
                    }
                }catch (Exception e) {
                    response.setMessage(e.getMessage());
                }
                handler.handle(response);
            }
        });
    }


    public static <T> Handler<Message<JsonObject>> objectMapper(final Handler<HandlerResponse<T>> handler, final Class clazz) {

        return new Handler<Message<JsonObject>>() {
            @Override
            public void handle(Message<JsonObject> event) {
                HandlerResponse<T> resultHandler = new HandlerResponse<T>();
                if ("ok".equals(event.body().getString("status"))){
                    Either<String, JsonArray> resultJson = SqlResult.validResult(event);

                    Object obj = ((JsonArray) (((Either.Right) resultJson).getValue())).getJsonArray(0);
                    resultHandler.setResult((T) decode(obj.toString(),clazz));

                }else{
                    resultHandler.setMessage(event.body().getString("message"));
                }
                handler.handle(resultHandler);
            }
        };

    }

    public static <T> Handler<Message<JsonObject>> listMapper(final Handler<HandlerResponse<List<T>>> handler, final Class clazz) {

        return new Handler<Message<JsonObject>>() {
            @Override
            public void handle(Message<JsonObject> event) {
                HandlerResponse<List<T>> resultHandler = new HandlerResponse<List<T>>();
                try{
                    if ("ok".equals(event.body().getString("status"))){

                        List<Object> fields = rewriteKey(event.body().getJsonArray("fields").getList(),clazz);

                        event.body().put("fields", new fr.wseduc.webutils.collections.JsonArray(fields));

                        Either<String, JsonArray> resultJson = SqlResult.validResult(event);

                        List<T> result = new ArrayList<T>();
                        for (Object obj : ((JsonArray) (((Either.Right) resultJson).getValue()))){
                            T finalObjet =  (T) decode(obj.toString(),clazz);
                            result.add(finalObjet);
                        }
                        resultHandler.setResult(result);
                    }else{
                        resultHandler.setMessage(event.body().getString("message"));
                    }
                    handler.handle(resultHandler);
                }catch(Exception e){
                    handler.handle(new HandlerResponse<List<T>>(e.getMessage()));
                }

            }
        };
    }

    public static <T> void mappListRequest(final HttpServerRequest request, final Class clazz , final Handler<HandlerResponse<List<T>>> handler){
        RequestUtils.bodyToJsonArray(request, new Handler<JsonArray>() {
            @Override
            public void handle(JsonArray json) {
                HandlerResponse<List<T>> response = new HandlerResponse<List<T>>();
                try{
                    if (json!=null){
                        List<T> result = new ArrayList<T>();
                        //JsonArray array = (JsonArray) json;
                        for (Object obj : json.getList()){
                            result.add((T)mapper.convertValue(obj, clazz));
                        }
                        response.setResult(result);
                    }else{
                        response.setMessage("request body cannot be null");
                    }
                }catch (Exception e) {
                    response.setMessage(e.getMessage());
                }
                handler.handle(response);
            }
        });
    }

    public static  <T> T decode(String str, Class clazz){
        T result = null;
        try {
            result = (T)mapper.readValue(str, clazz);
        } catch (IOException e) {
            log.error(e.getMessage(),e);
            throw new RuntimeException(e);
        }
        return result;
    }

    public static String encode(Object obj){
        try {
            return mapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            log.error(e.getMessage(),e);
            throw new RuntimeException(e);
        }

    }

    /*public T decode(String str){
        T result = null;
        try {
            result = (T)mapper.readValue(str, clazz);
        } catch (IOException e) {
            log.error(e.getMessage(),e);
        }
        return result;
    }*/



    public void executeQuery(SqlQuery query, final Handler<GenericHandlerResponse> handler){
        List<SqlQuery> queries = new ArrayList<SqlQuery>();
        queries.add(query);
        executeTransactionnalQueries(queries,handler);
    }

    public void executeTransactionnalQueries(List<SqlQuery> queries, final Handler<GenericHandlerResponse> handler){
        SqlStatementsBuilder sb = new SqlStatementsBuilder();

        for (SqlQuery query : queries) {
            if (query.getType() == SqlQuery.Type.INSERT) {
                sb.insert(query.getTable(), query.getParamsInsert());
            } else {
                sb.prepared(query.getQuery(), query.getParamsUpdate());
            }
        }

        sql.transaction(sb.build(), validUniqueResultHandler(0, new Handler<Either<String, JsonObject>>() {
            @Override
            public void handle(Either<String, JsonObject> event) {
                GenericHandlerResponse response = new GenericHandlerResponse();
                if (!event.isRight()){
                    response.setMessage("error executing transaction");
                }
                handler.handle(response);
            }
        }));

    }

    public Handler<Message<JsonObject>> listMapper(final Handler<HandlerResponse<List<T>>> handler) {

        return new Handler<Message<JsonObject>>() {
            @Override
            public void handle(Message<JsonObject> event) {
                HandlerResponse<List<T>> resultHandler = new HandlerResponse<List<T>>();
                try{
                    if ("ok".equals(event.body().getString("status"))){

                        List<Object> fields = rewriteKey(event.body().getJsonArray("fields").getList());

                        event.body().put("fields", new fr.wseduc.webutils.collections.JsonArray(fields));

                        Either<String, JsonArray> resultJson = SqlResult.validResult(event);


                        List<T> result = new ArrayList<T>();
                        for (Object obj : ((JsonArray) (((Either.Right) resultJson).getValue()))){
                            result.add((T) decode(obj.toString(),clazz));
                        }
                        resultHandler.setResult(result);
                    }else{
                        resultHandler.setMessage(event.body().getString("message"));
                    }
                    handler.handle(resultHandler);
                }catch(Exception e){
                    handler.handle(new HandlerResponse<List<T>>(e.getMessage()));
                }

            }
        };

    }

    private static List<Object> rewriteKey(List<String> fields,Class clazz)  {
        List<Object> rewrited = new ArrayList<>();

        Map<String,String> keyMap = new HashMap<>();
        Field[] classFields = clazz.getDeclaredFields();
        for( Field field : classFields ){
            String fieldName = field.getName().toString();
            keyMap.put(fieldName.toLowerCase(), fieldName);
        }

        for (String field : fields){
            rewrited.add(keyMap.get(field));
        }

        return rewrited;
    }


    private List<Object> rewriteKey(List<String> fields)  {
        List<Object> rewrited = new ArrayList<>();

        for (String field : fields){
            rewrited.add(keyMap.get(field));
        }

        return rewrited;
    }



    public Handler<Message<JsonObject>> objectMapper(final Handler<HandlerResponse<T>> handler) {

        return new Handler<Message<JsonObject>>() {
            @Override
            public void handle(Message<JsonObject> event) {
                HandlerResponse<T> resultHandler = new HandlerResponse<T>();
                if ("ok".equals(event.body().getString("status"))){
                    Either<String, JsonArray> resultJson = SqlResult.validResult(event);

                    Object obj = ((JsonArray) (((Either.Right) resultJson).getValue())).getJsonArray(0);
                    resultHandler.setResult((T) decode(obj.toString(),clazz));

                }else{
                    resultHandler.setMessage(event.body().getString("message"));
                }
                handler.handle(resultHandler);
            }
        };

    }

    public void sequence (final Handler<HandlerResponse<Long>> handler) {
        //TODO append
        sql.raw("select nextval('"+ databaseTableSc +"_id_seq') as next_id", validUniqueResultHandler(new Handler<Either<String, JsonObject>>() {
            @Override
            public void handle(Either<String, JsonObject> event) {
                HandlerResponse<Long> response = new HandlerResponse<Long>();
                if (event.isRight()) {
                    final Long id = event.right().getValue().getLong("next_id");
                    response.setResult(id);

                }else{
                    response.setMessage("unable to get the sequence number");

                }
                handler.handle(response);
            }
        }));
    }

    public void insert(final T obj, final Handler<HandlerResponse<T>> handler) throws Exception {
        prepareInsertStatementWithSequence(obj, new Handler<HandlerResponse<SqlQuery>>() {
            @Override
            public void handle(HandlerResponse<SqlQuery> event) {
                HandlerResponse<T> resultHandler = new HandlerResponse<T>(event.getMessage());
                if (event.hasError()){
                    handler.handle(resultHandler);
                }else{
                    SqlQuery query = event.getResult();
                    sql.insert(query.getTable(), query.getParamsInsert(), new Handler<Message<JsonObject>>() {
                        @Override
                        public void handle(Message<JsonObject> event) {
                            HandlerResponse<T> resultHandler = new HandlerResponse<T>();
                            try{
                                if ("ok".equals(event.body().getString("status"))){
                                    resultHandler.setResult((T)obj);
                                }else{
                                    resultHandler.setMessage(event.body().getString("message"));
                                }
                                handler.handle(resultHandler);
                            }catch (Exception e){
                                resultHandler.setMessage(e.getMessage());
                                handler.handle(resultHandler);
                            }
                        }
                    });
                }
            }
        });

    }

    private void setId(Object obj,Long id) throws Exception {
        Method method = obj.getClass().getMethod("setId", Long.class);
        method.invoke(obj, id);
    }

    private Long getId(Object obj) throws Exception {
        Method method = obj.getClass().getMethod("getId");
        return (Long)method.invoke(obj);
    }

    public static Object objectToJson(Object obj,SimpleDateFormat dateFormat) throws Exception {
        if (obj instanceof  ArrayList){
            JsonArray jsonArray = new fr.wseduc.webutils.collections.JsonArray();
            for (Object e : (ArrayList) obj){
                jsonArray.add(objectToJson(e,dateFormat));
            }
            return jsonArray;
        }
        //Map<String, Object> result = new HashMap<String, Object>();
        BeanInfo info = Introspector.getBeanInfo(obj.getClass());
        JsonObject result = new JsonObject();
        for (PropertyDescriptor pd : info.getPropertyDescriptors()) {
            Method reader = pd.getReadMethod();
            if (reader != null) {
                String key = pd.getName().toLowerCase();
                Object value = reader.invoke(obj);
                if (key.equals("class") || value == null ) {
                    continue;
                }
                if (value instanceof ArrayList){
                    result.put(key,(JsonArray) objectToJson(value,dateFormat));
                    continue;
                }
                if (value instanceof Date) {
                    value = dateFormat.format((Date) value);
                }
                result.put(key, value);

            }
        }
        return result;
    }
    public static Object objectToJson(Object obj) throws Exception {
        return objectToJson(obj,DateUtils.getSimpleDateFormatSql());
    }

    public void prepareInsertStatementWithSequence(final T obj, final Handler<HandlerResponse<SqlQuery>> handler ) throws Exception{

        Long id = getId(obj);
        //if we already have the object id dont active sequence
        if (id != null){
            HandlerResponse<SqlQuery> response = new HandlerResponse<SqlQuery>();
            response.setResult(new SqlQuery(databaseTableSc,(JsonObject)objectToJson(obj)));
            return;
        }

        sequence(new Handler<HandlerResponse<Long>>() {
            @Override
            public void handle(HandlerResponse<Long> eventSequence) {
                HandlerResponse<SqlQuery> response = new HandlerResponse<SqlQuery>();
                if (eventSequence.hasError()){
                    response.setMessage(eventSequence.getMessage());
                    handler.handle(response);
                }else{
                    try{
                        setId(obj,eventSequence.getResult());
                        response.setResult(new SqlQuery(databaseTableSc,(JsonObject) objectToJson(obj)));
                        handler.handle(response);

                    }catch (Exception e){
                        response.setMessage("mapping error");
                        handler.handle(response);
                    }
                }
            }
        });
    }


    public SqlQuery prepareInsertStatement(final T obj) throws Exception{
        return new SqlQuery(databaseTableSc,(JsonObject)objectToJson(obj));
    }

    public SqlQuery prepareUpdateStatement(T obj) throws Exception {
        StringBuilder sb =  new StringBuilder();
        JsonArray values = new fr.wseduc.webutils.collections.JsonArray();

        BeanInfo info = Introspector.getBeanInfo(obj.getClass());
        String prefix ="";

        for (PropertyDescriptor pd : info.getPropertyDescriptors()) {
            Method reader = pd.getReadMethod();
            if (reader != null) {
                String key = pd.getName();
                Object value = reader.invoke(obj);
                if (key.equals("id")  || key.equals("class") || value == null ) {
                    continue;
                }

                sb.append(prefix);
                prefix = ",";
                if (value instanceof Date) {
                    values.add(DateUtils.formatDateSql((Date) value));
                    sb.append(key).append(" = to_date(?, 'YYYY-MM-DD HH24:MI:SS') ");
                }else{
                    values.add(value);
                    sb.append(key).append(" = ? ");
                }
            }
        }


        StringBuilder query =
                new StringBuilder("UPDATE ").append(databaseTableSc)
                    .append(" SET ").append(sb.toString()).append("WHERE id = ? ");

        values.add(getId(obj));

        return new SqlQuery(query.toString(),values);

    }
    public void update(final T obj, final Handler<HandlerResponse<T>> handler) throws Exception {
        SqlQuery sqlQuery = prepareUpdateStatement(obj);
        sql.prepared(sqlQuery.getQuery(),sqlQuery.getParamsUpdate() , validRowsResultHandler(new Handler<Either<String, JsonObject>>() {
            @Override
            public void handle(Either<String, JsonObject> event) {
                HandlerResponse<T> resultHandler = new HandlerResponse<T>();
                try{
                    if (event.isRight()){
                        resultHandler.setResult((T)obj);
                    }else{
                        resultHandler.setMessage("error when update class " + clazz.getName());
                    }
                    handler.handle(resultHandler);
                }catch (Exception e){
                    resultHandler.setMessage(e.getMessage());
                    handler.handle(resultHandler);
                }
            }
        }));
    }
}
