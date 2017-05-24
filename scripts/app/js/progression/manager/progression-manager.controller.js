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
                /*vm.subViewRight ='/diary/public/js/progression/manager/creation-progression-form.template.html';*/
                vm.selectedProgressionItem = {
                    edit : true
                };
            };

            vm.selectProgression = function(progressionItem){
                vm.selectedProgressionItem=progressionItem;
                progressionItem.edit=false;
                /*vm.subViewRight ='/diary/public/js/progression/manager/progression-lessons-list.template.html';*/
            };

            vm.progressionItems = [{
                id : 1,
                level: 'seconde',
                title: 'Physique',
                description: 'La physique quantique c\'est super cool ',
                lessonItems: [{
                    attachments: null,
                    audience_id: "36c1c9a3-529c-46fa-8cd6-bde332f8a496",
                    audience_label: "6 B",
                    audience_type: "class",
                    homework_ids: null,
                    lesson_annotation: "",
                    lesson_color: "#CECEF6",
                    lesson_date: "2017-05-09 00:00:00.000000+0200",
                    lesson_description: "<div>Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div>",
                    lesson_end_time: "13:12:00",
                    lesson_id: 58,
                    lesson_room: "amphithe",
                    lesson_start_time: "08:42:00",
                    lesson_state: "published",
                    lesson_title: "Scéance 1",
                    original_subject_id: "32905-1493304352092",
                    school_id: "9a0c3006-73a2-457e-92e9-c137bdf1e19c",
                    subject_id: "3",
                    subject_label: "THEATRE",
                    teacher_display_name: "Mia BARBIER",
                    homeworks: [{
                        attachments: null,
                        audience_id: "21a3cf28-44fd-49be-ad09-5da6fe0d10dd",
                        audience_label: "6 A",
                        audience_type: "class",
                        homework_color: "#CECEF6",
                        homework_description: "<div>Exercice de maths (mathématiques) Problèmes : Problèmes de mathématiques créé par anonyme avec le générateur de tests - créez votre propre test !</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div>",
                        homework_due_date: "2017-05-10 00:00:00.000000+0200",
                        homework_state: "published",
                        homework_title: "Devoir Maison",
                        homework_type_id: 1,
                        homework_type_label: "Devoir Maison",
                        id: 20,
                        lesson_id: 57,
                        school_id: "9a0c3006-73a2-457e-92e9-c137bdf1e19c",
                        subject_id: "1",
                        subject_label: "ANGLAIS LV1"
                    },{
                        attachments: null,
                        audience_id: "21a3cf28-44fd-49be-ad09-5da6fe0d10dd",
                        audience_label: "6 A",
                        audience_type: "class",
                        homework_color: "#CECEF6",
                        homework_description: "<div>Exercice de maths (mathématiques) Problèmes : Problèmes de mathématiques créé par anonyme avec le générateur de tests - créez votre propre test !</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div>",
                        homework_due_date: "2017-05-10 00:00:00.000000+0200",
                        homework_state: "published",
                        homework_title: "Devoir Maison",
                        homework_type_id: 1,
                        homework_type_label: "Devoir Maison",
                        id: 20,
                        lesson_id: 57,
                        school_id: "9a0c3006-73a2-457e-92e9-c137bdf1e19c",
                        subject_id: "1",
                        subject_label: "ANGLAIS LV1"
                    }]
                }, {
                    attachments: null,
                    audience_id: "36c1c9a3-529c-46fa-8cd6-bde332f8a496",
                    audience_label: "6 B",
                    audience_type: "class",
                    homework_ids: null,
                    lesson_annotation: "",
                    lesson_color: "#CECEF6",
                    lesson_date: "2017-05-09 00:00:00.000000+0200",
                    lesson_description: "<div>Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div>",
                    lesson_end_time: "13:12:00",
                    lesson_id: 58,
                    lesson_room: "amphithe",
                    lesson_start_time: "08:42:00",
                    lesson_state: "published",
                    lesson_title: "Sceance2",
                    original_subject_id: "32905-1493304352092",
                    school_id: "9a0c3006-73a2-457e-92e9-c137bdf1e19c",
                    subject_id: "3",
                    subject_label: "THEATRE",
                    teacher_display_name: "Mia BARBIER"
                },{
                    attachments: null,
                    audience_id: "36c1c9a3-529c-46fa-8cd6-bde332f8a496",
                    audience_label: "6 B",
                    audience_type: "class",
                    homework_ids: null,
                    lesson_annotation: "",
                    lesson_color: "#CECEF6",
                    lesson_date: "2017-05-09 00:00:00.000000+0200",
                    lesson_description: "<div>Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div>",
                    lesson_end_time: "13:12:00",
                    lesson_id: 58,
                    lesson_room: "amphithe",
                    lesson_start_time: "08:42:00",
                    lesson_state: "published",
                    lesson_title: "Sceance3",
                    original_subject_id: "32905-1493304352092",
                    school_id: "9a0c3006-73a2-457e-92e9-c137bdf1e19c",
                    subject_id: "3",
                    subject_label: "THEATRE",
                    teacher_display_name: "Mia BARBIER"
                }]
            },{
                id : 2,
                level: 'seconde',
                title: 'Physique quantique',
                description: 'La physique quantique c\'est super cool ',
                lessonItems: [ {
                    attachments: null,
                    audience_id: "36c1c9a3-529c-46fa-8cd6-bde332f8a496",
                    audience_label: "6 B",
                    audience_type: "class",
                    homework_ids: null,
                    lesson_annotation: "",
                    lesson_color: "#CECEF6",
                    lesson_date: "2017-05-09 00:00:00.000000+0200",
                    lesson_description: "<div>Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div><div>​Séance ceci est ma sceamce</div>",
                    lesson_end_time: "13:12:00",
                    lesson_id: 58,
                    lesson_room: "amphithe",
                    lesson_start_time: "08:42:00",
                    lesson_state: "published",
                    lesson_title: "Séance ceci est ma sceamce",
                    original_subject_id: "32905-1493304352092",
                    school_id: "9a0c3006-73a2-457e-92e9-c137bdf1e19c",
                    subject_id: "3",
                    subject_label: "THEATRE",
                    teacher_display_name: "Mia BARBIER"
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
