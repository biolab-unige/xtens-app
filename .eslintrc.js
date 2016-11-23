module.exports = {
    "env": {
        "browser": true,
        "node": true,
        "es6": true
    },
    "extends": ["eslint:recommended", "plugin:backbone/recommended"],
    "parserOptions": {
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true,
            "jsx": true
        },
        "sourceType": "module"
    },
    "globals": {
        "_": true,
        "sails":true,
        "$": true,
        "JST": true,
        "d3": true,
        "xtens": true,
        "Backbone": true,
        "io":true,
        "ss":true,
        "moment":true,
        "Pikaday":true,
        "Dropzone":true,
        "ParsleyUI":true

    },

    "settings": {
        "backbone": {
            "Collection": ["Backbone"],
            "Model": ["Backbone"],
            "View": ["Backbone"]
        }
    },

    "plugins": ["backbone"],
    "rules": {
        "indent": ["error",4],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [0],
        "semi": [
            "warn",
            "always"
        ],
        "no-console": [0],
        "no-unused-vars": [0],
        "backbone/model-defaults": [0],
        "backbone/no-view-model-attributes": [0],
        "backbone/no-native-jquery": [0],
        "backbone/event-scope": [0]
    }
};
