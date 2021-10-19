export class ArrayUtils {

    static flat = (array: any[]): any[] => {
        return array.reduce((results: any[], item: any) => results.concat(item), []);
    };

    static propertyDistinct = (array: any[], property: string): any[] => {
        return array.filter((item: any, i: number, items: any[]) =>
            items.findIndex((s: any) => (s[property] === item[property])) === i
        );
    }

    static distinct = (array: any[]): any[] => {
        return array.filter((item: any, i: number, items: any[]) =>
            items.indexOf(item) === i
        );
    }

}