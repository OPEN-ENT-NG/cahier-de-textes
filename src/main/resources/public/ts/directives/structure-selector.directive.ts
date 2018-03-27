import { angular, ng, model } from 'entcore';


export const structureDropDown = ng.directive('structureDropDown', function () {
    return {
        restrict: "E",
        template : `
                <diary-drop-down
                    ng-if="!(hideIfSolo && structureList.length === 1)"
                    placeholder="select.structure"
                    list="structureList"
                    selected="structure"
                    nullable="false"
                    property="name">
                </diary-drop-down>
                `,
        scope: {
            structure : "=",
            hideIfSolo : "=",
            isHidden : "="
        },
        controller: function($scope) {
            $scope.structureList = [];
            let i=0;
            model.me.structures.forEach((structure)=>{
                $scope.structureList.push({
                    id : structure,
                    name : model.me.structureNames[i++],
                });
            });
            if (!$scope.structure){
                $scope.structure = $scope.structureList[0];
            }
            $scope.isHidden = ($scope.hideIfSolo && $scope.structureList.length === 1);
        },
    };
});
