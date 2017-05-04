(function() {
    'use strict';

    class PedagogicItemService {

        constructor($http, $q, constants,UtilsService) {
            this.$http = $http;
            this.$q = $q;
            this.constants = constants;
            this.UtilsService=UtilsService;
        }


        getPedagogicItems(params){
            let options = {
                method : 'POST',
                url : `/diary/pedagogicItems/list`,
                data : params
            };

            return this.$http(options).then((result) =>{
                return _.map(result.data, this.mapPedagogicItem);
            } );
        }

        mapPedagogicItem(data) {
            var item = new PedagogicItem();
            item.type_item = data.type_item;
            item.id = data.id;
    		//for share directive you must have _id
            item._id = data.id;
            item.lesson_id = data.lesson_id;
            item.title = data.title;
            item.subject = data.subject;
            item.audience = data.audience;
            item.start_hour = (data.type_item == "lesson") ? moment(data.day).minutes(model.getMinutes(data.start_time)).format("HH[h]mm") : "";
            item.end_hour = (data.type_item == "lesson") ? moment(data.day).minutes(model.getMinutes(data.end_time)).format("HH[h]mm") : "";
            item.type_homework = data.type_homework;
            item.teacher = data.teacher;
            item.description = data.description;
            item.expanded_description = false;
            item.state = data.state;
            item.color = data.color;
            item.getPreviewDescription();
            item.room = data.room;
            item.day = data.day;
            item.turn_in = (data.type_item == "lesson") ? "" : data.turn_in_type;
            item.selected = false;

            if (data.day) {
                item.dayFormatted = moment(data.day).format("DD/MM/YYYY");
                item.dayOfWeek = moment(data.day).format("dddd");
            }
            return item;
        }

    }
    /* create singleton */
    AngularExtensions.addModuleConfig(function(module) {
        module.service("PedagogicItemService", PedagogicItemService);
    });

})();
