module.exports = config:
  plugins:  
    afterBrunch: [
      'node ./after-brunch.js'
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
