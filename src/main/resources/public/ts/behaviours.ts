import { Behaviours } from 'entcore';

const diaryBehaviours = {
    rights: {
        workflow: {
            manageVisa: "fr.openent.diary.controllers.VisaController|createVisa",

            readHomework: "fr.openent.diary.controllers.HomeworkController|workflow1",
            manageHomework: "fr.openent.diary.controllers.HomeworkController|workflow2",
            publishHomework: "fr.openent.diary.controllers.HomeworkController|workflow3",
            setProgressHomework: "fr.openent.diary.controllers.HomeworkController|setProgressHomework",

            readSession: "fr.openent.diary.controllers.SessionController|workflow1",
            manageSession: "fr.openent.diary.controllers.SessionController|workflow2",
            publishSession: "fr.openent.diary.controllers.SessionController|workflow3",

            calendarView: "fr.openent.diary.controllers.DiaryController|workflow1",
            listView: "fr.openent.diary.controllers.DiaryController|workflow2",
            accessOwnData: "fr.openent.diary.controllers.DiaryController|workflow3",
            accessChildData: "fr.openent.diary.controllers.DiaryController|workflow4",
            accessExternalData: "fr.openent.diary.controllers.DiaryController|workflow5",
        },
    }
};

Behaviours.register('diary', diaryBehaviours);