import {angular, moment} from 'entcore';
import {FORMAT} from '../core/const/dateFormat';

export class DateUtils {

    /**
     * ⚠ Date Utils
     *
     */
    static getFormattedDate(date): string {
        return moment(date).format(FORMAT.formattedDate);
    }

    static getFormattedTime(date): string {
        return moment(date).format(FORMAT.formattedTime);
    }

    static getFormattedDateTime(date, time?): string {
        if (!!time) {
            return moment(DateUtils.getFormattedDate(date) + ' ' + DateUtils.getFormattedTime(time)).format(FORMAT.formattedDateTime);
        } else {
            return moment(date).format(FORMAT.formattedDateTime);
        }
    }

    static formatDate(date, format: string): string {
        return moment(date).format(format);
    }

    static getDisplayDate(date): string {
        return moment(date).format(FORMAT.displayDate);
    }

    static getDisplayTime(date): string {
        return moment(date).format(FORMAT.displayTime);
    }

    static getDisplayDateTime(date): string {
        return moment(date).format(FORMAT.displayDateTime);
    }

    /**
     * ⚠ This method format your TIME but your DATE will have your date.now() ⚠
     * @param time  time value as a string (e.g) "09:00"
     */
    static getTimeFormat(time: string): string {
       return moment().set('HOUR', time.split(":")[0]).set('MINUTE', time.split(":")[1]).format(FORMAT.displayTime);
    }

    static htmlToXhtml(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var xhtml = new XMLSerializer().serializeToString(doc);
        return xhtml;
    }

    static safeApply(that) {
        return new Promise((resolve, reject) => {
            let phase = (that.$root !== null) ? that.$root.$$phase : undefined;
            if (phase === '$apply' || phase === '$digest') {
                if (resolve && (typeof (resolve) === 'function')) resolve();
            } else {
                if (resolve && (typeof (resolve) === 'function')) that.$apply(resolve);
                else that.$apply();
            }
        });
    }

    static convertHtmlToPlainText(html) {
        let htmlWithSpaces = html.replace(/<\/div>/g, ' </div>');
        return htmlWithSpaces ? String(htmlWithSpaces).replace(/<[^>]+>/gm, '') : '';
    }

    static isAChildOrAParent(type) {
        return type === "ELEVE" || type === "PERSRELELEVE"
    }

    static isChild(type) {
        return type === "ELEVE"
    }

    static isRelative(type) {
        return type === "PERSRELELEVE"
    }

    static isTeacher(type) {
        return type === "ENSEIGNANT"
    }

    static startBlobDownload(dataBlob, suggestedFileName) {
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            // for IE
            window.navigator.msSaveOrOpenBlob(dataBlob, suggestedFileName);
        } else {
            // for Non-IE (chrome, firefox etc.)
            var urlObject = URL.createObjectURL(dataBlob);

            var downloadLink = angular.element('<a>Download</a>');
            downloadLink.css('display', 'none');
            downloadLink.attr('href', urlObject);
            downloadLink.attr('download', suggestedFileName);
            angular.element(document.body).append(downloadLink);
            downloadLink[0].click();

            // cleanup
            downloadLink.remove();
            URL.revokeObjectURL(urlObject);
        }
    }

    static getFileNameByContentDisposition(contentDisposition) {
        var regex = /filename[^;=\n]*=(UTF-8(['"]*))?(.*)/;
        var matches = regex.exec(contentDisposition);
        var filename;

        if (matches != null && matches[3]) {
            filename = matches[3].replace(/['"]/g, '');
        }

        return decodeURI(filename);
    }
}