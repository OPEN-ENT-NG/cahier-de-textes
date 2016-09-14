package fr.openent.diary.utils;

import java.util.Map;

/**
 * Created by a457593 on 15/06/2016.
 */
public class SearchCriterion {

    private CriteriaSearchType type;
    /**
     * Either string or number (e.g: id)
     */
    private Object value;

    public Object getValue() {
        return value;
    }

    public void setValue(Object value) {
        this.value = value;
    }

    public CriteriaSearchType getType() {
        return type;
    }

    public void setType(CriteriaSearchType type) {
        this.type = type;
    }

    /**
     * Converts an entry from a search form to a SearchCriterion. Returns null if the key does not match a known CriteriaSearchType.
     * @param parameter
     * @return
     */
    public static SearchCriterion convertParameterToSearchCriterion(Map.Entry<String, Object> parameter) {

        SearchCriterion criterion = new SearchCriterion();
        criterion.setType(CriteriaSearchType.valueOfName(parameter.getKey()));
        if (criterion.getType() != null && parameter.getValue() != null) {
            if (parameter.getValue() instanceof String && ((String) parameter.getValue()).isEmpty()) {
                return null;
            }
            criterion.setValue(parameter.getValue());
        } else {
            return null;
        }

        return criterion;
    }
}
