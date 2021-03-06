module.exports = {
    "env": {
        "browser": false,
        "node": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaFeatures": {
            "classes": false,
            "experimentalObjectRestSpread": false,
            "jsx": false
        },
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
        "indent": ["error", 4, { "SwitchCase": 1 } ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "warn",
            "single"
        ],
        "semi": [
            "warn",
            "always"
        ],
        "no-console": "warn",
        "no-unused-vars": "warn",
        "react/jsx-uses-react": "error",
        "react/jsx-uses-vars": "error",
        "react/jsx-no-target-blank": "error",
        "react/jsx-pascal-case": "warn"
    }
};
