package fr.openent.diary.model.visa;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by A664240 on 12/06/2017.
 */
public class ApplyVisaModel {

    private String comment;
    private String structureId;
    private String ownerId;
    private String ownerName;
    private String ownerType;

    private List<VisaModel> resultVisaList = new ArrayList<>();

    public List<VisaModel> getResultVisaList() {
        return resultVisaList;
    }

    public void setResultVisaList(List<VisaModel> resultVisaList) {
        this.resultVisaList = resultVisaList;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getStructureId() {
        return structureId;
    }

    public void setStructureId(String structureId) {
        this.structureId = structureId;
    }



    public String getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getOwnerType() {
        return ownerType;
    }

    public void setOwnerType(String ownerType) {
        this.ownerType = ownerType;
    }
}
