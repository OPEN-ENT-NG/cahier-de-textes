import { Behaviours } from 'entcore';
import {Exclusion, Exclusions} from "./model";
import {SETTINGS_SNIPPLET} from "./snipplets";

const cdtBehaviours = {
    workflow: {
        createLesson: "fr.openent.diary.controllers.LessonController|createLesson",
        createHomeworkForLesson: "fr.openent.diary.controllers.HomeworkController|createHomeworkForLesson",
        createFreeHomework: "fr.openent.diary.controllers.HomeworkController|createFreeHomework"
    },
    resources: {
        //lessons
        shareSubmitLesson: {
            right: "fr-openent-diary-controllers-LessonController|shareSubmit"
        },
        getLesson: {
            right: "fr-openent-diary-controllers-LessonController|getLesson"
        },
        publishLesson: {
            right: "fr-openent-diary-controllers-LessonController|publishLesson"
        },
        modifyLesson: {
            right: "fr-openent-diary-controllers-LessonController|modifyLesson"
        },
        deleteLesson: {
            right: "fr-openent-diary-controllers-LessonController|deleteLesson"
        },
        // homeworks
        shareSubmitHomework: {
            right: "fr-openent-diary-controllers-HomeworkController|shareSubmit"
        },
        modifyHomework: {
            right: "fr-openent-diary-controllers-HomeworkController|modifyHomework"
        },
        getHomework: {
            right: "fr-openent-diary-controllers-HomeworkController|getHomework"
        },
        deleteHomework: {
            right: "fr-openent-diary-controllers-HomeworkController|deleteHomework"
        }
    },

    resourceRights: function resourceRights() {
        return ['read', 'publish', 'manager'];
    },

    loadResources: function (callback) {
    },

    model: {
        Exclusion: Exclusion,
        Exclusions: Exclusions
    },

    sniplets: {
        settings: SETTINGS_SNIPPLET
    }
};

Behaviours.register('cdt', cdtBehaviours);