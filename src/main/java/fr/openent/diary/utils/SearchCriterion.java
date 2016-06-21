package fr.openent.diary.utils;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by a457593 on 15/06/2016.
 */
public class SearchCriterion {

    private CriteriaSearchType type;
    private String value;

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public CriteriaSearchType getType() {
        return type;
    }

    public void setType(CriteriaSearchType type) {
        this.type = type;
    }

    /**
     * Parses a query string into a list of search criterion.
     * @param parameters '&' separated list of key=value search criteria.
     * @return
     */
    public static List<SearchCriterion> convertParametersToSearchCriteria(String parameters) {

        List<SearchCriterion> criteria = new ArrayList<>();
        String[] params = parameters.split("&");
        for (String param : params)
        {
            String name = param.split("=")[0];
            String value = param.split("=")[1];
            SearchCriterion criterion = new SearchCriterion();
            criterion.setType(CriteriaSearchType.valueOfName(name));
            criterion.setValue(value);
            if (criterion.getType() != null) {
                criteria.add(criterion);
            }
        }
        return criteria;
    }
}
