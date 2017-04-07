export const sortByKey = (collection: Array<any>, key: string): Array<any> => {

    return collection.sort((a, b) => {

        if (a[key] < b[key]) return -1;

        if (a[key] > b[key]) return 1;

        return 0;
    });
};
