(function() {
	'use strict';

	AngularExtensions.addModuleConfig(function(module){
    /**
     * Directive to perform a quick search among lessons and homeworks
     */
    module.directive('attachmentsx', function () {
        return {
            restrict: "E",
            templateUrl: "diary/public/template/attachments.html",
            scope: {
                /**
                 * Lesson or homework
                 */
                item: '=',
                /**
                 * If true, user won't be able to add or modify current attachments (for student for example)
                 */
                readonly: '='
            },
            controller: function(){
            },
            link: function($scope){
                //$scope.selectedAttachments = new Array();
                $scope.display = {};
                $scope.display.showPersonalAttachments = false;
                $scope.mediaLibraryScope = null;

                /**
                 * Set selected or not documents within
                 * media library documents
                 */
                var syncSelectedDocumentsFromItemAttachments = function(){

                    var theScope = getMediaLibraryScope();                   

                    theScope.documents.forEach(function(document){
                        document.selected = hasAttachmentInItem(document._id);
                    });

                    theScope.$apply();
                };

                /**
                 *
                 * @returns {*}
                 */
                var getMediaLibraryScope = function () {

                    if ($scope.mediaLibraryScope != null) {
                        return $scope.mediaLibraryScope;
                    }

                    // tricky way to get that mediaLibrary directive ...
                    var i = 0;
                    var mediaLibraryScope = null;

                    for (var cs = $scope.$$childHead; cs; cs = cs.$$nextSibling) {
                        if (i === 0 && !cs.attachment) {
                            mediaLibraryScope = cs.$$nextSibling.$$childTail.$$childTail.$$childTail;
                            break;
                        }
                        i++;
                    }

                    $scope.mediaLibraryScope = mediaLibraryScope;
                };

                var mediaLibraryScope = null;

                // open up personal storage
                $scope.showPersonalAttachments = function(){
                    $scope.display.showPersonalAttachments = true;
                    setTimeout(function(){
                        // FIXME can't find mediaLibrary scopre at first time !!
                        syncSelectedDocumentsFromItemAttachments();
                    }, 300);
                };

                $scope.hidePersonalAttachments = function(){
                    $scope.display.showPersonalAttachments = false;
                };


                /**
                 * Selected attachments from media library directive
                 * see attachments.html
                 * @param selectedAttachments Selected attachments in personal storage view
                 */
                $scope.updateSelectedAttachments = function (selectedAttachments) {
                    // TODO DELETE
                };

                /**
                 *
                 * @param documentId
                 */
                var hasAttachmentInItem = function(documentId) {

                    var hasAttachment = false;

                    if(!$scope.item.attachments || $scope.item.attachments.length === 0){
                        hasAttachment = false;
                    } else {
                        $scope.item.attachments.forEach(function(itemAttachment){

                            if(itemAttachment.document_id === documentId){
                                hasAttachment = true;
                            }
                        });
                    }

                    return hasAttachment;
                };

                /**
                 *
                 * @returns {*}
                 */
                var getSelectedDocuments = function () {
                    var selectedDocuments = _.where(getMediaLibraryScope().documents, {
                        selected: true
                    });

                    return selectedDocuments;
                };

                /**
                 *
                 * @param selectedAttachments Selected documents in media library directive
                 */
                var addSelectedDocumentsToItem = function (newSelectedAttachments) {

                    if (!newSelectedAttachments || newSelectedAttachments.length === 0) {
                        return;
                    }

                    var newAttachments = new Array();

                    newSelectedAttachments.forEach(function (selectedAttachment) {

                        if (!hasAttachmentInItem(selectedAttachment._id)) {
                            var itemAttachment = new Attachment();

                            itemAttachment.user_id = model.me.userId;
                            itemAttachment.document_id = selectedAttachment._id;
                            itemAttachment.document_label = selectedAttachment.name;

                            newAttachments.push(itemAttachment);
                            $scope.item.addAttachment(itemAttachment);
                        }
                    });
                };


                /**
                 * Associates the selected attachments from directive
                 * to current item (lesson or homework)
                 */
                $scope.linkAttachmentsToItem = function () {

                    if (mediaLibraryScope == null) {
                        mediaLibraryScope = getMediaLibraryScope();
                    }

                    var selectedAttachments = getSelectedDocuments();

                    if (selectedAttachments.length === 0) {
                        notify.info('diary.attachments.selectattachmentstolink');
                    }

                    else {
                        addSelectedDocumentsToItem(selectedAttachments);
                        // close media library directive
                        $scope.hidePersonalAttachments();
                    }

                };

                /**
                 * Removes the attachment from item (lesson or homework)
                 * @param attachment
                 */
                $scope.removeAttachment = function (attachment) {

                    attachment.detachFromItem(scope.item.id, scope.itemType,
                        // callback function TODO handle
                        function () {

                        },
                        // callback on error function TODO handle
                        function () {

                        }
                    );
                };


                setInterval(function () {
                    var addButton = $('.right-magnet.vertical-spacing-twice');
                    addButton.hide();
                }, 400);
            }
        }
    });

	});

})();
