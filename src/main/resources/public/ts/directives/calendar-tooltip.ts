import {ng} from 'entcore';
import {CALENDAR_TOOLTIP_EVENTER} from "../utils/const/calendar-tooltip-eventer";
import {IAngularEvent} from "angular";

interface IViewModel {
    calendarTooltipItem: {
        item: any;
        title: string,
        color: string,
        content: string
    };

    isSession(item: any): boolean;
    getSourcesFromHTML(html: string): Array<string>;
    getDescriptionHTML(description: string): any;
}

export const CalendarTooltip = ng.directive('calendarTooltip', ['$sce', ($sce) => {
    return {
        restrict: 'E',
        transclude: true,
        template: `
        <!-- sessions/homeworks hovered card -->
        <div id="calendar-tooltip" class="calendar-tooltip">
            <!-- session -->
            <div ng-show="vm.isSession(vm.calendarTooltipItem.item)">
                <!-- title case for session -->
                <div class="calendar-tooltip-title ellipsis-multiline-three" style="background-color: [[vm.calendarTooltipItem.color]]">
                    [[vm.calendarTooltipItem.title]]
                </div>
                   
                <!-- html content from session -->
                <div class="calendar-tooltip-content session" ng-bind-html="vm.calendarTooltipItem.content"></div>
            </div>
         
            <!-- homeworks -->
            <div ng-repeat="homework in vm.calendarTooltipItem.item.homeworks">
                <!-- title case for homework -->
                <div class="calendar-tooltip-title homework ellipsis-multiline-three" style="background-color: [[homework.color]]">
                    [[homework.type.label]]
                </div>   
                
                <!-- html content from homework -->
                <div class="calendar-tooltip-content [[$index]]" ng-bind-html="vm.getDescriptionHTML(homework.description)"></div>
            </div>
        </div>
        `,
        controllerAs: 'vm',
        bindToController: true,
        replace: false,
        controller: function () {
            const vm: IViewModel = <IViewModel>this;
            vm.calendarTooltipItem = {
                item: null,
                title: '',
                color: '',
                content: ''
            };
        },
        link: function ($scope) {
            const vm: IViewModel = $scope.vm;
            const windowWidth: number = document.getElementsByTagName('html')[0].clientWidth;

            // entering card (hover in)
            $scope.$on(CALENDAR_TOOLTIP_EVENTER.HOVER_IN, (_: IAngularEvent, data: any) => hoverCalendarItem(data));

            // leaving card (hover out )
            $scope.$on(CALENDAR_TOOLTIP_EVENTER.HOVER_OUT, (_: IAngularEvent) => hoverOutCalendarItem());

            vm.isSession = (item): boolean => {
                if (item) {
                    // #00ab6f represents session's color and #7E7E7E represents session that does not match timeslot
                    return item.color === '#00ab6f' || item.color === '#7E7E7E';
                }
                return false;
            };

            vm.getSourcesFromHTML = (html: string): Array<string> => {
                const regex: RegExp = new RegExp('(?<=src=").*?(?=[?"])')
                const sources: Array<string> = html.match(regex) ? Array.from(html.match(regex)) : [];
                if (sources.length > 0) {
                    return sources;
                } else {
                    return [];
                }
            };

            vm.getDescriptionHTML = (description: string): any => {
                return $sce.trustAsHtml(description.toString());
            }

            const hoverCalendarItem = (data: any): void => {
                // setting our data
                vm.calendarTooltipItem.item = data.item;
                vm.calendarTooltipItem.title = data.item.title;
                vm.calendarTooltipItem.color = data.item.color;
                vm.calendarTooltipItem.content = getTooltipContent(data.item);

                const hover: HTMLElement = document.getElementById('calendar-tooltip');

                // editing html text in order to adjust its size before calculating
                editHTMLtoAdjustSize(hover);

                const widthEventCard: number = hover.querySelector('.calendar-tooltip-title').clientWidth || 220;

                let {top, left, right, width}: { top: number, left: number, right: number, width: number }
                = offset(data.$event.target.closest('.schedule-item-content'));

                hover.style.visibility = 'visible';
                hover.style.top = `${top - (hover.offsetHeight / 2)}px`;
                // if card will reach window limit
                if (right + widthEventCard > windowWidth) {
                    hover.style.left = `${left - widthEventCard}px`;
                } else {
                    hover.style.left = `${left + width}px`;
                }
            };

            const editHTMLtoAdjustSize = (hover): void => {
                // adjust main session size
                hover.querySelector('.calendar-tooltip-content.session').innerHTML =
                    $sce.trustAsHtml(vm.calendarTooltipItem.content.toString());
            };

            const getTooltipContent = (item: any): string => {
                // if homework(orange)
                if (item.color === '#ff9700') {
                    return (item.homeworks && item.homeworks.length > 0) ? $sce.trustAsHtml(item.homeworks[0].description.toString()) : '';
                } else {
                    return $sce.trustAsHtml(item.description.toString());
                }
            };

            const hoverOutCalendarItem = (): void => {
               const hover: HTMLElement = document.getElementById('calendar-tooltip');
               hover.style.visibility = 'hidden';
            };

            const offset = (el): { top: number, left: number, right: number, width: number } => {
                let rect: ClientRect = el.getBoundingClientRect();
                return {
                    top: rect.top,
                    left: rect.left,
                    right: rect.right,
                    width: rect.width
                };
            };
        }
    };
}]);