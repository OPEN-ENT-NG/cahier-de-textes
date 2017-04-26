(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();
"use strict";

/**
 * Statement of rights to be used by the directive "behavior" or by "workflow" property to hide / display allowed behaviors like creating, updating, sharing, etc.
 * No use for share-panel Directive !
 *
 */
var diariesBehaviours = {
	resources: {
		//lessons
		shareSubmitLesson: {
			right: "fr-openent-diary-controllers-LessonController|shareSubmit"
		},
		getLesson: {
			right: "fr-openent-diary-controllers-LessonController|getLesson"
		},
		publishLesson: {
			right: "fr-openent-diary-controllers-LessonController|publishLesson"
		},
		modifyLesson: {
			right: "fr-openent-diary-controllers-LessonController|modifyLesson"
		},
		deleteLesson: {
			right: "fr-openent-diary-controllers-LessonController|deleteLesson"
		},
		// homeworks
		shareSubmitHomework: {
			right: "fr-openent-diary-controllers-HomeworkController|shareSubmit"
		},
		modifyHomework: {
			right: "fr-openent-diary-controllers-HomeworkController|modifyHomework"
		},
		getHomework: {
			right: "fr-openent-diary-controllers-HomeworkController|getHomework"
		},
		deleteHomework: {
			right: "fr-openent-diary-controllers-HomeworkController|deleteHomework"
		}
	},
	//using by workflow property ($register.$workflow), ex on a button for creating lesson : workflow="diary.createLesson"
	workflow: {
		createLesson: "fr.openent.diary.controllers.LessonController|createLesson",
		createHomeworkForLesson: "fr.openent.diary.controllers.HomeworkController|createHomeworkForLesson",
		createFreeHomework: "fr.openent.diary.controllers.HomeworkController|createFreeHomework"
	}
};

Behaviours.register('diary', {
	behaviours: diariesBehaviours,
	/**
  * Allows to set rights for behaviours.
  */
	resource: function resource(_resource) {
		var rightsContainer = _resource;
		if (!_resource.myRights) {
			_resource.myRights = {};
		}

		for (var behaviour in diariesBehaviours.resources) {
			if (model.me.hasRight(rightsContainer, diariesBehaviours.resources[behaviour]) || model.me.userId === _resource.owner.userId || model.me.userId === rightsContainer.owner.userId) {
				if (_resource.myRights[behaviour] !== undefined) {
					_resource.myRights[behaviour] = _resource.myRights[behaviour] && diariesBehaviours.resources[behaviour];
				} else {
					_resource.myRights[behaviour] = diariesBehaviours.resources[behaviour];
				}
			}
		}
		return _resource;
	},

	/**
  * Allows to load workflow rights according to rights defined by the
  * administrator for the current user in the console.
  */
	workflow: function workflow() {
		var workflow = {};

		var diariesWorkflow = diariesBehaviours.workflow;
		for (var prop in diariesWorkflow) {
			if (model.me.hasWorkflow(diariesWorkflow[prop])) {
				workflow[prop] = true;
			}
		}

		return workflow;
	},

	/**
  * Allows to define all rights to display in the share windows. Names are
  * defined in the server part with
  * <code>@SecuredAction(value = "xxxx.read", type = ActionType.RESOURCE)</code>
  * without the prefix <code>xxx</code>.
  */
	resourceRights: function resourceRights() {
		return ['read', 'publish', 'manager'];
	},

	/**
  * Function required by the "linker" component to display the collaborative editor info
  */
	loadResources: function loadResources(callback) {}
});

