import {  _ } from 'entcore';
import {Attachment} from '../model/Attachment.model';

/*
 * Attachement service as class
 * used to manipulate Attachement model
 */
export class AttachmentService  {
    /*
    *   Mapp homeworks
    */
    static mappAttachement(attachements){
        return _.map(attachements,(attachementData) =>{
            var att = new Attachment();
            att.id = attachementData.id;
            att.user_id = attachementData.user_id;
            att.creation_date = attachementData.creation_date;
            att.document_id = attachementData.document_id;
            att.document_label = attachementData.document_label;

            return att;
        });
    }



};
