var pg = require('pg');
var constants = require('../constants');

const pool = new pg.Pool(constants.pgconfig);

var srv = {
    removeData: function() {
        var deleteQuery = 'DELETE FROM diary.modelweek;'+
                'DELETE FROM diary.lessonprogression;'+
                'DELETE FROM diary.progression;'+
                'DELETE FROM diary.members;'+
                'delete from  diary.lesson_has_attachment;'+
                'delete from  diary.homework_has_attachment;'+
                'delete from  diary.attachment;'+
                'delete from  diary.lesson_shares;'+
                'delete from  diary.homework_shares;'+
                'delete from  diary.homework;'+
                'delete from  diary.lesson;'+
                'delete from  diary.homework_type;'+
                'delete from  diary.audience;'+
                'delete from  diary.groups;'+
                'delete from  diary.members;'+
                'delete from  diary.users;'+
                'delete from  diary.teacher;'+
                'delete from  diary.visa_lesson;'+
                'delete from  diary.visa;'+
                'delete from  diary.histo_visa_lesson;'+
                'delete from  diary.histo_visa;'+
                'delete from  diary.histo_lesson;'+
                'delete from  diary.inspector_habilitation;'+
                'delete from  diary.subject;';

        pool.connect(function(err, client, done) {
            if (err) {
                return console.error('error fetching client from pool', err);
            }

            //use the client for executing the query
            client.query(deleteQuery, [], function(err, result) {

                done(err);

                if (err) {
                    return console.error('error running query', err);
                }

            });
        });
    }
};

module.exports = srv;
