import {ng} from 'entcore';

export const editorResize = ng.directive('editorResize', ($timeout) => {
    return {
        controller: function ($scope, $element: JQuery) {

            $timeout(() => {
                // [2] === editor-toolbar HTMLElement content among children()
                const $editorToolbar = $($element.children()[2]);
                if ($editorToolbar.css('position') === 'absolute') {
                    if ($editorToolbar.css('top') !== "0px") {
                        $element.css('padding-top',  $editorToolbar.css('top'));
                    } else {
                        $element.css('padding-top',  $($element).children()[2].clientHeight + 'px');
                    }
                }
            });
        },
    };
});