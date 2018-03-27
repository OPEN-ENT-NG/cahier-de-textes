import {_, model, idiom as lang} from 'entcore';

/*
 * Utils service as class
 * used to manipulate Utils model
 */
export class UtilsService {

   static getUserStructuresIdsAsString() {
        var structureIds = "";

        model.me.structures.forEach(function(structureId) {
            structureIds += structureId + ":";
        });

        return structureIds;
    }

    /**
     * Set lesson tooltip text depending on screen resolution.
     * Tricky responsive must be linked to additional.css behaviour
     * @param lesson
     */
    static getResponsiveLessonTooltipText(lesson) {
        var tooltipText = lesson.title + ' (' + lang.translate(lesson.state) + ')';
        var screenWidth = window.innerWidth;

        // < 900 px display room
        if (screenWidth < 900 && lesson.room) {
            tooltipText += '<br>' + lesson.room;
        }

        // < 650 px display hour start and hour end
        if (screenWidth < 650) {
            tooltipText += '<br>' + [
                [lesson.startMoment.format('HH')]
            ] + 'h' + [
                [lesson.startMoment.format('mm')]
            ];
            tooltipText += ' -> ' + [
                [lesson.endMoment.format('HH')]
            ] + 'h' + [
                [lesson.endMoment.format('mm')]
            ];
        }

        // < 600 px display subjectlabel
        if (screenWidth < 650 && lesson.subjectLabel) {
            tooltipText += '<br>' + lesson.subjectLabel;
        }

        tooltipText = tooltipText.trim();

        return tooltipText;
    }


};