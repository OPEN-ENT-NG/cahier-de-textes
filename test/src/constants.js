var moment = require('moment');
module.exports = {
    //TODO add in the conf.js
    pathurl: 'http://localhost:8090/diary',
    tempdir : 'c:/tmp/diary',
    pgconfig: {
        user: 'ong',
        database: 'ong2',
        password: 'ong',
        host: 'localhost',
        port: 5432,
        max: 10,
        idleTimeoutMillis: 30000,
    },
    momentWeek : moment('2017-07-24'),
    momentWeek2 : moment('2017-07-25'),
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
        },
        'parent' : {
          login : 'jean.claude',
          pwd : 'Ong_1234'
        },
        'student1' : {
          login : 'clea.aubert',
          pwd : 'Ong_1234'
        },
        'student2' : {
          login : 'tom.fleury',
          pwd : 'Ong_1234'
        }
    }
};
