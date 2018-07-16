import { Behaviours } from 'entcore';

const diaryBehaviours = {
    rights: {
        workflow: {
            createLesson: "fr.openent.diary.controllers.LessonController|createLesson",
            manageVisa: "fr.openent.diary.controllers.VisaController|createVisa",
            createHomeworkForLesson: "fr.openent.diary.controllers.HomeworkController|createHomeworkForLesson",
            createHomework: "fr.openent.diary.controllers.HomeworkController|createFreeHomework",
            manageHomework: "fr.openent.diary.controllers.HomeworkController|modifyHomework",
            manageSession: "fr.openent.diary.controllers.LessonController|modifyLesson",
            viewExternal: "fr.openent.diary.controllers.LessonController|getExternalLesson",
            calendarView: "fr.openent.diary.controllers.DiaryController|workflow1",
            listView: "fr.openent.diary.controllers.DiaryController|workflow2",
            accessOwnData: "fr.openent.diary.controllers.DiaryController|workflow3",
            readChildren: "fr.openent.diary.controllers.StudentController|getChildren",
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
        }
    },

    resourceRights: function resourceRights() {
        return ['read', 'publish', 'manager'];
    },

    loadResources: function (callback) {
    }
};

Behaviours.register('diary', diaryBehaviours);