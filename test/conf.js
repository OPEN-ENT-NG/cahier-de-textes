// conf.js
exports.config = {
  framework: 'jasmine',
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: [
     'src/calendar/create-homework.spec.js',
     'src/calendar/create-lesson.spec.js',
     'src/calendar/create-mater.spec.js',
     'src/progression/progression.spec.js',
    'src/progression/progression-content.spec.js'
  ],
  // capabilities: {
  //   browserName: 'firefox',
  //   //'marionette': 'true'
  // }
};
