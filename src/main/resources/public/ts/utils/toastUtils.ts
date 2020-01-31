import {angular, idiom as lang, moment} from 'entcore';
import {FORMAT} from './const/dateFormat';
import http from "axios";
import {Homework} from "../model";

export class ToastUtils {

    /**
     * Add the fields succeed and toastMessage to the response
     * @param response
     * @param message
     * @param errorMessage
     * @returns {any}
     */
    static setToastMessage(response, message, errorMessage) {
        if (response.status === 200 || response.status === 201) {
            response.succeed = true;
            response.toastMessage = message;

        } else {
            response.succeed = false;
            response.toastMessage = errorMessage;
        }
        return response;
    }
}