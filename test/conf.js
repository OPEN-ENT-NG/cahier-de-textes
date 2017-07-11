// conf.js
exports.config = {
  framework: 'jasmine',
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: [
    'src/calendar/create-homework.spec.js',
    'src/calendar/create-lesson.spec.js',
    'src/calendar/create-mater.spec.js'
  ]
};
