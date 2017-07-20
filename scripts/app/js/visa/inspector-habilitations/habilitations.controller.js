(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {
        //controller declaration
        module.controller("HabilitationController", controller);

        function controller($scope, $rootScope, VisaService, $timeout) {
            let vm = this;

            function init() {
                vm.filter = {};
                vm.getInspector(model.me.structures[0]);
                vm.rended = true;

                //watch change inspector
                $scope.$watch(() => {
                    return vm.filter.inspector;
                }, (n, o) => {
                    if (o !== n && n) {
                        vm.getInspectTeachers(vm.structure.id, vm.filter.inspector.key);
                    }
                });

                //watch change teacher
                $scope.$watch(() => {
                    return vm.filter.teacher;
                }, (n, o) => {
                    if (o !== n && n) {
                        vm.selectTeacher(n.item);
                        vm.filter.teacher=undefined;
                    }
                });
            }
            $timeout(init);

            vm.selectTeacher = function(teacher){
                let existantTeacher = _.findWhere(vm.selectedTeachers,{'key' : teacher.key});
                if (!existantTeacher){
                    vm.selectedTeachers.push(teacher);
                    vm.save();
                }
            };

            vm.getInspector = function(structureId) {
                vm.filter.teacher = undefined;
                VisaService.getInspectorList().then((inspectors) => {
                    vm.filters = {
                        inspectors: inspectors
                    };
                });
            };
            vm.removeTeacher = function (teacher) {
                vm.selectedTeachers = _.filter(vm.selectedTeachers,(t)=>{
                    return t.key !== teacher.key;
                });
               vm.save();
            };
            vm.cancel = function() {
                vm.getInspectTeachers(vm.structure.id, vm.filter.inspector.key);
            };

            vm.getInspectTeachers = function(structureId, inspectorId) {
                vm.filters.teachers = undefined;
                vm.selectedTeachers = undefined;
                vm.filter.teacher = undefined;

                VisaService.getInspectTeachers(structureId, vm.filter.inspector.key).then((result) => {                  
                    vm.filters.teachers = result.availableTeachers;
                    vm.selectedTeachers = result.onInspectorTeachers;
                });
            };

            vm.save = function() {
                VisaService.applyInspectorRight(vm.structure.id, vm.filter.inspector.key, vm.selectedTeachers).then(() => {
                    vm.getInspectTeachers(vm.structure.id, vm.filter.inspector.key);

                });
            };
        }
    });
})();
