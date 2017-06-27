package fr.openent.diary.utils;

import org.entcore.common.user.UserInfos;

/**
 * Created by A664240 on 26/06/2017.
 */
public class SecureUtils {

    static public Boolean hasRight(UserInfos user, String right){
        Boolean result = false;
        Integer i = 0;
        while (!result && i<user.getAuthorizedActions().size()){
            result = user.getAuthorizedActions().get(i).getDisplayName().equals(right);
        }
        return result;
    }
}
