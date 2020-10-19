package fr.openent.diary.helper;

import fr.openent.diary.models.DiaryTypeModel;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.ArrayList;
import java.util.List;

public class DiaryTypeHelper {

    /**
     * Convert JsonArray into DiaryTypeModel list
     *
     * @param diaryTypeArray     JsonArray response
     * @return new list of diary type (SESSION || HOMEWORK type)
     */
    public static List<DiaryTypeModel> toDiaryTypeModelList(JsonArray diaryTypeArray) {
        List<DiaryTypeModel> diaryTypeList = new ArrayList<>();
        for (Object o : diaryTypeArray) {
            if (!(o instanceof JsonObject)) continue;
            DiaryTypeModel diaryType = new DiaryTypeModel((JsonObject) o);
            diaryTypeList.add(diaryType);
        }
        return diaryTypeList;
    }

    /**
     * Convert List DiaryTypeModel into DiaryTypeModel JsonArray
     *
     * @param diaryTypeList DiaryTypeModel list
     * @return new JsonArray of diary type (SESSION || HOMEWORK type)
     */
    public static JsonArray toJsonArray(List<DiaryTypeModel> diaryTypeList) {
        JsonArray diaryTypeArray = new JsonArray();
        for (DiaryTypeModel diaryTypeModel : diaryTypeList) {
            diaryTypeArray.add(diaryTypeModel.toJSON());
        }
        return diaryTypeArray;
    }
}
