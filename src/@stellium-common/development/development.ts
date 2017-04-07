export const enableDeveloperMode = () => {

    Object.defineProperty(global, 'DEVELOPMENT', {
        get: () => true
    });

    Object.defineProperty(global, 'PRODUCTION', {
        get: () => false
    });
};

export const enableProductionMode = () => {

    Object.defineProperty(global, 'DEVELOPMENT', {
        get: () => false
    });

    Object.defineProperty(global, 'PRODUCTION', {
        get: () => true
    });
};
