(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {
        //controller declaration
        module.controller("ProgressionManagerController", controller);

        function controller($scope, $rootScope) {
            let vm = this;

            vm.edit = function(){
                vm.originalProgressionItem = angular.copy(vm.selectedProgressionItem);
                vm.selectedProgressionItem.edit=true;
            };

            vm.hasProgressItem = function(){
                console.log(!!vm.selectedProgressionItem);
                return vm.selectedProgressionItem === undefined;
            };
            vm.cancel = function(){
                if (vm.selectedProgressionItem.id){
                    vm.selectedProgressionItem.title = vm.originalProgressionItem.title;
                    vm.selectedProgressionItem.level = vm.originalProgressionItem.level;
                    vm.selectedProgressionItem.description = vm.originalProgressionItem.description;
                    vm.originalProgressionItem=null;
                    vm.selectedProgressionItem.edit=false;
                }else{
                    vm.selectedProgressionItem=undefined;
                }
            };
            vm.setNewProgression = function(){
                vm.selectedProgressionItem = {
                    edit : true
                };
            };

            vm.selectProgression = function(progressionItem){
                vm.selectedProgressionItem=progressionItem;
                progressionItem.edit=false;
            };

            vm.addNewLesson = function(){
              $rootScope.redirect('/progressionEditLesson/'+vm.selectedProgressionItem.id+'/new' );
            };

            vm.editLesson = function(id){
                $rootScope.redirect('/progressionEditLesson/'+vm.selectedProgressionItem.id+'/'+id );
            };

            vm.progressionItems = [{
                id : 1,
                level: 'seconde',
                title: 'Physique',                
                description: 'La physique quantique c\'est super cool ',
                lessonItems: [{
                    id : 1,
                    type : 'progression',
                    title: "Scéance 1",
                    description : "<div>Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div>",
                    subject: model.subjects.findWhere({id: "3"}),
                    original_subject_id: "32905-1493304352092",
                    subjectId: "3",
                    subjectLabel: 'THEATRE',
                    teacherName : "Mia BARBIER",
                    structureId : "9a0c3006-73a2-457e-92e9-c137bdf1e19c",
                    color: "#CECEF6",
                    annotation: "",
                    orderIndex : 1,
                    attachments : [],
                    homeworks: [{
                        id : 'id',
                        description: "<div>Exercice de maths (mathématiques) Problèmes : Problèmes de mathématiques créé par anonyme avec le générateur de tests - créez votre propre test !</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div>",
                        type: model.homeworkTypes.findWhere({ id: 1 }),
                        typeId: 1,
                        typeLabel: "Devoir Maison",
                        title: "Physique devoir 1",
                        attachments: [],
                        structureId : "9a0c3006-73a2-457e-92e9-c137bdf1e19c"
                    },{
                        id : 'id',
                        description: "<div>Exercice de maths (mathématiques) Problèmes : Problèmes de mathématiques créé par anonyme avec le générateur de tests - créez votre propre test !</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div>",
                        type: model.homeworkTypes.findWhere({ id: 1 }),
                        typeId: 1,
                        typeLabel: "Devoir Maison",
                        title: "Devoir Maison",
                        attachments: [],
                        structureId : "9a0c3006-73a2-457e-92e9-c137bdf1e19c"
                    }]
                }, {
                    id : 1,
                    type : 'progression',
                    title: "Scéance 1",
                    description : "<div>Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div>",
                    subject: model.subjects.findWhere({id: "3"}),
                    original_subject_id: "32905-1493304352092",
                    subjectId: "3",
                    subjectLabel: 'THEATRE',
                    teacherName : "Mia BARBIER",
                    structureId : "9a0c3006-73a2-457e-92e9-c137bdf1e19c",
                    color: "#CECEF6",
                    annotation: "",
                    orderIndex : 2,
                    attachments : [],
                },{
                    id : 1,
                    type : 'progression',
                    title: "Scéance 1",
                    description : "<div>Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div>",
                    subject: model.subjects.findWhere({id: "3"}),
                    original_subject_id: "32905-1493304352092",
                    subjectId: "3",
                    subjectLabel: 'THEATRE',
                    teacherName : "Mia BARBIER",
                    structureId : "9a0c3006-73a2-457e-92e9-c137bdf1e19c",
                    color: "#CECEF6",
                    annotation: "",
                    orderIndex : 3,
                    attachments : [],
                }]
            },{
                id : 2,
                level: 'seconde',
                title: 'Physique quantique',
                description: 'La physique quantique c\'est super cool ',
                lessonItems: [ {
                    id : 1,
                    type : 'progression',
                    title: "Scéance 1",
                    description : "<div>Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div>",
                    subject: model.subjects.findWhere({id: "3"}),
                    original_subject_id: "32905-1493304352092",
                    subjectId: "3",
                    subjectLabel: 'THEATRE',
                    teacherName : "Mia BARBIER",
                    structureId : "9a0c3006-73a2-457e-92e9-c137bdf1e19c",
                    color: "#CECEF6",
                    annotation: "",
                    orderIndex : 1,
                    attachments : [],
                }]
            }];

            vm.saveProgression = function(item){
                vm.progressionItems.push(item);
            };

            vm.saveOrder = function(){
                    console.log("save order");
            };
        }
    });


})();
