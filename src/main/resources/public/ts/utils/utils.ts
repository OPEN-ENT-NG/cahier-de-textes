import { moment, model, me, Behaviours, _ } from 'entcore';
import {FORMAT} from './const/dateFormat';

export class Utils {

    /**
     * Add the fields succeed and toastMessage to the response
     * @param response
     * @param message
     * @param errorMessage
     * @returns {any}
     */
    static setToastMessage(response, message, errorMessage){
        if(response.status === 200 || response.status === 201){
            response.succeed = true;
            response.toastMessage = message;
        } else {
            response.succeed = false;
            response.toastMessage = errorMessage;
        }
        return response;
    }

    static getFormattedDate(date) {
        return moment(date).format(FORMAT.formattedDate);
    }

    static getFormattedTime(date) {
        return moment(date).format(FORMAT.formattedTime);
    }

    static getFormattedDateTime(date, time?) {
        if(!!time){
            return moment(Utils.getFormattedDate(date) + ' ' + Utils.getFormattedTime(time)).format(FORMAT.formattedDateTime);
        } else {
            return moment(date).format(FORMAT.formattedDateTime);
        }
    }

    static getDisplayDate(date) {
        return moment(date).format(FORMAT.displayDate);
    }

    static getDisplayTime(date) {
        return moment(date).format(FORMAT.displayTime);
    }

    static getDisplayDateTime(date) {
        return moment(date).format(FORMAT.displayDateTime);
    }

    static safeApply(that) {
        return new Promise((resolve, reject) => {
            let phase = (that.$root !== null) ? that.$root.$$phase : undefined;
            if(phase === '$apply' || phase === '$digest') {
                if(resolve && (typeof(resolve) === 'function')) resolve();
            } else {
                if (resolve && (typeof(resolve) === 'function')) that.$apply(resolve);
                else that.$apply();
            }
        });
    }

    static convertHtmlToPlainText(html) {
        let htmlWithSpaces = html.replace(/<\/div>/g, ' </div>');
        return htmlWithSpaces ? String(htmlWithSpaces).replace(/<[^>]+>/gm, '') : '';
    }
}