import { Behaviours, model } from 'entcore';

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
	behaviours:  diariesBehaviours,
	/**
	 * Allows to set rights for behaviours.
	 */
	resource : function(resource) {
		var rightsContainer = resource;
		if (!resource.myRights) {
			resource.myRights = {};
		}

		for (var behaviour in diariesBehaviours.resources) {
			if (model.me.hasRight(rightsContainer, diariesBehaviours.resources[behaviour]) || model.me.userId === resource.owner.userId || model.me.userId === rightsContainer.owner.userId) {
				if (resource.myRights[behaviour] !== undefined) {
					resource.myRights[behaviour] = resource.myRights[behaviour] && diariesBehaviours.resources[behaviour];
				} else {
					resource.myRights[behaviour] = diariesBehaviours.resources[behaviour];
				}
			}
		}
		return resource;
	},

	/**
	 * Allows to load workflow rights according to rights defined by the
	 * administrator for the current user in the console.
	 */
	workflow : function() {
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
	resourceRights : function() {
		return [ 'read', 'publish', 'manager' ];
	},

	/**
	 * Function required by the "linker" component to display the collaborative editor info
	 */
	loadResources: function(callback){}
});
