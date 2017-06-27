(function(){
  'use strict';

    AngularExtensions.addModuleConfig(function(module) {
        module.directive("confirmPopup",directive);

        function directive($compile){
          let zIndex = 100000;
          return {
            restrict : 'A',
            /*controller : function($scope){
              setTimeout(()=>{
                $scope.apply
              });
            },*/
            link: function (scope, element, attr) {
              console.log("confirm click linked");
                   zIndex++;
                   var clickAction = attr.confirmedClick;
                   var html =  ` 
                     <lightbox show="display" class="${scope.confirmClass}" on-close="remove()" style="z-index : ${zIndex}" >
                       <div class="row" ng-if="!confirmTemplate">
                          <h2> [[msg]] </h2>
                           <div class="row">
                               <button class="right-magnet " ng-click="confirm()">[[yes]]</button>
                               <input type="button" class="right-magnet cancel" i18n-value="[[cancel]]" ng-click="remove()"  />
                           </div>
                       </div>
                       <div class="row" ng-if="confirmTemplate">
                          <div ng-include="confirmTemplate">
                          </div>
                       </div>
                     </lightbox>
                     `;
                  var lightbox;
                   element.bind('click',function (event) {
                     scope.msg = attr.confirmClick || "Etes vous sur?";
                     scope.yes = attr.confirmYes || "Ok";
                     scope.confirmClass = attr.confirmClass || "";
                     scope.confirmTemplate = attr.confirmTemplate ;
                     scope.cancel = attr.confirmCancel || "Annuler";
                      scope.display = true;

                      lightbox = $compile(html)(scope);
                      $('body').append(lightbox);

                      lightbox.addClass(scope.confirmClass);
                      scope.$apply();
                   });
                   scope.$on('closeallpop',()=>{
                     scope.remove();
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
