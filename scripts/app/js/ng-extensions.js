var AngularExtensions = {
    moduleConfigs : [],
    addModuleConfig : function(callBack){
        this.moduleConfigs.push(callBack);
    },
    init: function (module) {
        angular.forEach(this.moduleConfigs,function(moduleConfig){
            moduleConfig.apply(this,[module]);
        });
    }
};
