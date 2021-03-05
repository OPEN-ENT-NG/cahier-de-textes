import {Behaviours} from 'entcore';
import {inspector} from "./sniplets/inspector";
import {homeworkType} from "./sniplets/homeworkType";
import {initData} from "./sniplets/init_data";
import {sessionType} from "./sniplets/sessionType";

const diaryBehaviours = {
    rights: {
        workflow: {
            access: "fr.openent.diary.controllers.DiaryController|view",
            view: "fr.openent.diary.controllers.DiaryController|view",

            adminAccess: "fr.openent.diary.controllers.VisaController|workflow1",
            manageVisa: "fr.openent.diary.controllers.VisaController|workflow2",
            readVisa: "fr.openent.diary.controllers.FakeRight|adminVisaRead",

            readHomework: "fr.openent.diary.controllers.HomeworkController|workflow1",
            manageHomework: "fr.openent.diary.controllers.HomeworkController|workflow2",
            publishHomework: "fr.openent.diary.controllers.HomeworkController|workflow3",
            setProgressHomework: "fr.openent.diary.controllers.HomeworkController|setProgressHomework",

            readNotebookArchives: "fr.openent.diary.controllers.NotebookArchiveController|readArchives",
            searchNotebookArchiveTeachers: "fr.openent.diary.controllers.NotebookArchiveController|searchTeachers",

            viescoSettingHomeworkAndSessionTypeRead: "fr.openent.diary.controllers.HomeworkController|workflow4",
            viescoSettingHomeworkAndSessionTypeManage: "fr.openent.diary.controllers.HomeworkController|workflow5",

            readSession: "fr.openent.diary.controllers.SessionController|workflow1",
            manageSession: "fr.openent.diary.controllers.SessionController|workflow2",
            publishSession: "fr.openent.diary.controllers.SessionController|workflow3",

            calendarView: "fr.openent.diary.controllers.DiaryController|workflow1",
            listView: "fr.openent.diary.controllers.DiaryController|workflow2",
            accessOwnData: "fr.openent.diary.controllers.DiaryController|workflow3",
            accessChildData: "fr.openent.diary.controllers.DiaryController|workflow4",
            accessExternalData: 'fr.openent.diary.controllers.FakeRight|accessExternalData',
            diarySearch: "fr.openent.diary.controllers.SearchController|searchUsers"
        },
    },
    sniplets: {
        inspector,
        homework_type: homeworkType,
        session_type: sessionType,
        init_data: initData
    }
};

Behaviours.register('diary', diaryBehaviours);