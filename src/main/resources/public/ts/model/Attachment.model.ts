/**
 }
 }
 * Model of attachment from
 * table diary.attachment (DB)
 * @constructor
 */

export function Attachment () {
    /**
     * Attachment id as in diary.attachment table
     * @type {number}
     */
    this.id = null;

    this.user_id = null;
    /**
     * Id of stored document within the document module
     * (see mongodb -> Documents table)
     * E.G: "b88a3c42-7e4f-4e1c-ab61-11c8872ef795"
     * @type {string}
     */
    this.document_id = null;
    /***
     * Creation date
     * @type {null}
     */
    this.creation_date = null;
    /**
     * Filename of attachment
     * @type {string}
     */
    this.document_label = null;
};

/**
 * Download the attachment
 */
Attachment.prototype.download = function () {
    window.location.href = window.location.host + '/workspace/document/' + this.document_id;
};

/**
 * Detach attachment to a lesson
 * Attachment link will be detached to back end on lesson save
 * @param item Lesson or homework
 * @param cb Callback
 * @param cbe Callback on error
 */
Attachment.prototype.detachFromItem = function (item, cb, cbe) {

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