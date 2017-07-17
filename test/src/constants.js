var moment = require('moment');
module.exports = {
    //TODO add in the conf.js
    pathurl: 'http://localhost:8090/diary',
    tempdir : 'c:/tmp/diary',
    pgconfig: {
        user: 'web-education',
        database: 'ong',
        password: 'We_1234',
        host: 'localhost',
        port: 5430,
        max: 10,
        idleTimeoutMillis: 30000,
    },
    momentWeek : moment('2017-05-29'),
    profils : {
        'teacher' : {
            login : 'mia.barbier2',
            pwd : 'Ong_1234'
        },
        'director' : {
            login : 'alexia.garnier',
            pwd : 'Ong_1234'
        },
        'inspector': {
          login :'diane.adam',
          pwd : 'Ong_1234'
        }
    }
};
