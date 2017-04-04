(function() {
	'use strict';

	AngularExtensions.addModuleConfig(function(module){

            /**
             *
             */
            module.directive('attachment', function () {
                return {
                    restrict: "E",
                    require: '^attachmentsx',
                    templateUrl: "diary/public/template/attachment.html",
                    scope: {
                        /**
                         * Attachment
                         */
                        attachment: '=',
                        /**
                         * Reference to lesson or homework
                         */
                        item: '=',
                        /**
                         *  If true, user won't be able to add or modify current attachments (for student for example)
                         */
                        readonly: '='
                    },
                    link: function (scope, element, attrs, location) {

                        /**
                         * As seen from entcore, behaviour.js
                         * @param attachment
                         */
                        scope.downloadAttachment = function () {
                            scope.attachment.download();
                        };

                        // detachFromItem = function (itemId, itemType, cb, cbe) {
                        /**
                         * Removes attachment from lesson or homework
                         * but DOES NOT remove the file physically
                         */
                        scope.removeAttachment = function () {

                            // do not modify current attachment if readonly
                            if (scope.readonly === true) {
                                return;
                            }

                            scope.attachment.detachFromItem(scope.item,
                                // callback function
                                function (cb) {
                                    notify.info(cb.message);
                                },
                                // callback on error function
                                function (cbe) {
                                    notify.error(cbe.message);
                                }
                            );
                        }
                    }
                }
            });


	});

})();
