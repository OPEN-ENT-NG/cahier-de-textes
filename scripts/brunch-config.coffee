module.exports = config:
  plugins:
    fbFlo:
      port:8888
    afterBrunch: [
      'ncp ../dist/view/diary.html ../src/main/resources/view/diary.html',
      'ncp ../dist/ ../src/main/resources/public'
    ]
  modules:
    wrapper:false
  npm :
    enabled : false
  paths :
    public:'../dist'
  conventions:
    assets:  (path) ->
      /^app/.test(path) and not /.*(?:\.js$|\.scss$|\.txt$|\.css$)/.test(path)
  files:
    javascripts:
      joinTo:
        'js/vendor.js': (path) ->
            /^(bower_components|vendor)/.test(path)
        'js/behaviours.js': (path) ->
          /behaviours\.js$/.test(path)
        'js/app.js': (path) ->
          /^app/.test(path) and not /behaviours\.js$/.test(path)
      order:
        before:[
          'app/js/ng-extensions.js'
        ]
        after:[
          'app/js/model.js'
        ]
    stylesheets:
      joinTo:
        'css/app.css':/^(app)/
      order:
        before:[
        ]
