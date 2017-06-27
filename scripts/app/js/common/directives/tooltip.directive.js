(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {

        module.directive('diaryTooltip', directive);

        var tooltip ;
        function directive($compile) {
            //create one unique dom element to manage the tooltips
            if (!tooltip){
                tooltip = $('<div />').addClass('diarytooltip').appendTo('body');
            }
            return {
                restrict: 'A',
                link: function(scope, element, attributes) {
                    /*if (ui.breakpoints.tablette >= $(window).width()) {
                        return;
                    }*/
                    var tooltip=$('<div class="tooltip"/>').appendTo('body');
                    var position;

                    //create throttled function show
                    var showThrottled = _.throttle(()=>{
                        if (!attributes.diaryTooltip || attributes.diaryTooltip === 'undefined') {
                            return;
                        }
                        var tip = tooltip.html($compile('<div class="arrow"></div><div class="content">' + lang.translate(attributes.diaryTooltip) + '</div> ')(scope));
                        position = {
                            top : parseInt(element.offset().top + element.height()),
                            left : parseInt(element.offset().left + (element.width() / 2) - (tip.width() / 2))
                        };
                        if (position.top < 5) {
                            position.top = 5;
                        }
                        if (position.left < 5) {
                            position.left = 5;
                        }

                        tooltip.css("top",position.top + 15);
                        tooltip.css("left",position.left);

                        tooltip.fadeIn(100);
                    });
                    //bind show function
                    element.bind('mouseover', showThrottled);

                    //create debounced function hide
                    var hideDebounced = _.debounce(()=>{
                        tooltip.fadeOut(100);
                    },100);
                    //bind leave function
                    element.bind('mouseleave', hideDebounced);

                    //free on detraoy element & handlers
                    scope.$on("$destroy", function() {
                        if (tooltip) {
                            tooltip.remove();
                        }
                        element.off();
                    });

                }
            };
        }

    });

})();
