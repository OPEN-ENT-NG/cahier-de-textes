export enum UPDATE_STRUCTURE_EVENTS {
    UPDATE = 'structure:update', // when structure HAVE BEEN updated
    TO_UPDATE = 'structure:to_update'// when structure NEED TO BE updated
}

export enum STRUCTURES_EVENTS {
    UPDATED = 'structure:updated' // when structures HAVE BEEN updated
}

export enum UPDATE_SUBJECT_EVENTS {
    UPDATE = 'subject:update' // when subject HAVE BEEN updated
}

export enum CHILD_EVENTS {
    UPDATE = 'child:update', // when child NEED TO BE updated
    UPDATED = 'child:updated', // when child HAVE BEEN updated
}
