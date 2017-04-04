function Teacher() {}

Teacher.prototype.create = function(cb, cbe) {

    model.me.structures.forEach(function (structureId) {
        http().postJson('/diary/teacher/' + structureId).done(function (e) {

            if(typeof cb === 'function'){
                cb();
            }
        }).error(function (e) {
            if (typeof cbe === 'function') {
                cbe(model.parseError(e));
            }
        });
    });
};
