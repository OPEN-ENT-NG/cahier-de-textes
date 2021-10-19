import {UPDATE_STRUCTURE_EVENTS} from "../core/enum/events";

export class StructureUtils {
    static emitChangeStructure = ($scope: any, structureId: string): void =>
        $scope.$emit(UPDATE_STRUCTURE_EVENTS.TO_UPDATE, structureId);
}