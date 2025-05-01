module.exports = {
    root: true,

    env: {
        browser: true,
        node: true
    },

    parser: 'vue-eslint-parser',

    parserOptions: {
        parser: 'babel-eslint',
        ecmaVersion: 12,
        sourceType: 'module'
    },

    rules: {
        'no-console': 'off',
        'no-debug': 'off',
        'no-extra-parens': 0,
        'no-debugger': 2,
        'no-alert': 2,
        eqeqeq: 'off',
        'no-useless-escape': 'off',
        'no-unused-vars': ['error', {vars: 'all', args: 'none', ignoreRestSiblings: true}],
        'no-async-promise-executor': 'off',
        'vue/multi-word-component-names': 'off',
        'no-prototype-builtins': 'off'
    },

    globals: {
        _: true,
        $: true,
        F: true,
        __static: true,
        i18n: true,
        hidToNumber: true,
        BigInt: true,
        currentWin: true,
        sdkContentId: true,
        userDatapath: true,
        eventCallback: true,
        encryptStorage: true,
        localforage: true,
        appdataStorage: true,
        mapGL: true,
        globalThis: true
    },

    extends: [
        'eslint:recommended',
        'plugin:vue/essential'
        // '@vue/standard'
    ]
};
