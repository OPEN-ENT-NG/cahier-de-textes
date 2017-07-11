module.exports = {
    //TODO add in the conf.js
    pathurl: 'http://localhost:8090/diary',
    pgconfig: {
        user: 'web-education',
        database: 'ong',
        password: 'We_1234',
        host: 'localhost',
        port: 5430,
        max: 10,
        idleTimeoutMillis: 30000,
    },
    profils : {
        'teacher' : {
            login : 'mia.barbier2',
            pwd : 'Ong_1234'
        }
    }
};
