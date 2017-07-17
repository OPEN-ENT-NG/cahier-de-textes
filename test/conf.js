// conf.js
exports.config = {
  framework: 'jasmine',
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: [
    'src/calendar/create-homework.spec.js',
    'src/calendar/create-lesson.spec.js',
    'src/calendar/create-mater.spec.js',
    'src/progression/progression.spec.js',
    'src/progression/progression-content.spec.js',
    'src/visa/visa.spec.js',
    'src/visa/visa-lock.spec.js'
  ],
   multiCapabilities: [
    {
        'browserName': 'chrome',
        'chromeOptions': {
            args: [
              '--no-sandbox',
              '--test-type=browser',
              '--disable-infobars'
            ],
            prefs: {
                'plugins.always_open_pdf_externally': true,
                downloads: {
                    'prompt_for_download': false,
                    'directory_upgrade': true,
                    'args': ['show-fps-counter=true'],
                    'default_directory':  'c:/tmp/diary'
                },
                download: {
                    'prompt_for_download': false,
                    'directory_upgrade': true,
                    'args': ['show-fps-counter=true'],
                    'default_directory':  'c:/tmp/diary'
                }
            }
        }
    },

],
};
