(function(){
  'use strict';

    AngularExtensions.addModuleConfig(function(module) {
        module.directive("confirmClick",directive);

        function directive($compile){
          return {
            restrict : 'A',
            link: function (scope, element, attr) {
              console.log("confirm click linked");

                   var clickAction = attr.confirmedClick;
                   var html =  `
                     <lightbox show="display" on-close="remove()">
                       <div class="row">
                          <h2> [[msg]] </h2>
                           <div class="row">
                               <button class="right-magnet " ng-click="confirm()">[[yes]]</button>
                               <input type="button" class="right-magnet cancel" i18n-value="[[cancel]]" ng-click="remove()"  />                              
                           </div>
                       </div>
                     </lightbox>
                     `;
                  var lightbox;
                   element.bind('click',function (event) {
                     scope.msg = attr.confirmClick || "Etes vous sur?";
                     scope.yes = attr.confirmYes || "Ok";
                     scope.cancel = attr.confirmCancel || "Annuler";
                      scope.display = true;
                      lightbox = $compile(html)(scope);
                      $('body').append(lightbox);
                      scope.$apply();
                   });
                   scope.remove = function(){
                      scope.display = false;
                      if (lightbox){
                        lightbox.remove();
                      }
                   };
                   scope.confirm = function(){
                     scope.$eval(clickAction);
                     scope.remove();
                   };
               }
          };
        }
    });

})();
