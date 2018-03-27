/**
 }
 }
 * Model of attachment from
 * table diary.attachment (DB)
 * @constructor
 */
export class Attachment {
    /**
     * Attachment id as in diary.attachment table
     * @type {number}
     */
    id = null;

    user_id = null;
    /**
     * Id of stored document within the document module
     * (see mongodb -> Documents table)
     * E.G: "b88a3c42-7e4f-4e1c-ab61-11c8872ef795"
     * @type {string}
     */
    document_id = null;
    /***
     * Creation date
     * @type {null}
     */
    creation_date = null;
    /**
     * Filename of attachment
     * @type {string}
     */
    document_label = null;


    /**
     * Download the attachment
     */
    download = function () {
        window.location.href = window.location.host + '/workspace/document/' + this.document_id;
    };

    /**
     * Detach attachment to a lesson
     * Attachment link will be detached to back end on lesson save
     * @param item Lesson or homework
     * @param cb Callback
     * @param cbe Callback on error
     */
    detachFromItem = function (item, cb, cbe) {

        var that = this;

        if (item && item.attachments) {

            var udpatedAttachments = new Array();

            item.attachments.forEach(function (attachment) {
                if (attachment && attachment.document_id !== that.document_id) {
                    udpatedAttachments.push(attachment);
                }
            });

            item.attachments = udpatedAttachments;

            if (typeof cb === 'function') {
                cb();
            } else (typeof cbe === 'function')
            {
                cbe();
            }
        }
    };
};