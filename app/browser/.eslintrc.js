module.exports = {
  "root": true,
  "env": {
    "browser": true,
    "node": false,
    "es6": true,
    "amd": false
  },
  "overrides": [
    {
      "files": [
        "*.ts"
      ],
      "parser": "@typescript-eslint/parser",
      "parserOptions": {
        "ecmaVersion": 2020,
        "sourceType": "module",
        tsconfigRootDir: __dirname,
        "project": [
          "src/tsconfig.app.json"
        ],
        "createDefaultProgram": true
      },
      "plugins": [
        "@typescript-eslint",
        "@angular-eslint"
      ],
      "extends": [
        'plugin:@typescript-eslint/recommended',
        "plugin:@angular-eslint/ng-cli-compat",
        "plugin:@angular-eslint/ng-cli-compat--formatting-add-on",
        "plugin:@angular-eslint/template/process-inline-templates"
      ],
      "rules": {
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@angular-eslint/directive-selector": [
          "error",
          {
            "type": "attribute",
            "prefix": "ape",
            "style": "camelCase"
          }
        ],
        "@angular-eslint/component-selector": [
          "error",
          {
            "type": "element",
            "prefix": "ape"
          }
        ],
        "@typescript-eslint/array-type": [
          "error",
          {
            "default": "array-simple"
          }
        ],
        "@typescript-eslint/dot-notation": "off",
        "@typescript-eslint/explicit-member-accessibility": [
          "error",
          {
            "accessibility": "no-public"
          }
        ],
        "@typescript-eslint/member-ordering": "off",
        "@typescript-eslint/naming-convention": [
          "error",
          {
            "selector": [
              "class",
              "typeLike"
            ],
            "format": [
              "StrictPascalCase"
            ],
            "leadingUnderscore": "forbid",
            "trailingUnderscore": "forbid",
            "filter": {
              "regex": "^WebGL|WebGL$",
              "match": false
            }
          },
          {
            "selector": "variableLike",
            "leadingUnderscore": "forbid",
            "trailingUnderscore": "forbid",
            "filter": {
              "match": false,
              "regex": "_id|_"
            },
            "format": null
          },
          {
            "selector": "memberLike",
            "leadingUnderscore": "forbid",
            "trailingUnderscore": "forbid",
            "filter": {
              "match": false,
              "regex": "_id"
            },
            "format": null
          },
          {
            "selector": "typeParameter",
            "format": [
              "StrictPascalCase"
            ]
          }
        ],
        "@typescript-eslint/no-extraneous-class": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/no-this-alias": "error",
        "@typescript-eslint/no-unused-expressions": "off",
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": ["error", {
          "args": "none"
        }],
        "@typescript-eslint/no-var-requires": "error",
        "arrow-parens": [
          "error",
          "as-needed"
        ],
        "brace-style": [
          "error",
          "stroustrup",
          {
            "allowSingleLine": true
          }
        ],
        "comma-dangle": [
          "error",
          {
            "arrays": "always-multiline",
            "objects": "always-multiline",
            "functions": "never",
            "imports": "always-multiline",
            "exports": "always-multiline"
          }
        ],
        "complexity": [
          "error",
          {
            "max": 7
          }
        ],
        "curly": "off",
        "eqeqeq": [
          "error",
          "always"
        ],
        "import/no-default-export": "error",
        "import/no-extraneous-dependencies": "off",
        "import/no-internal-modules": "off",
        "import/no-unassigned-import": "error",
        "import/order": "off",
        "no-bitwise": "off",
        "no-duplicate-case": "error",
        "no-duplicate-imports": "error",
        "no-extra-bind": "error",
        "no-fallthrough": "off",
        "no-invalid-this": "error",
        "no-multiple-empty-lines": [
          "error",
          {
            "max": 2
          }
        ],
        "no-new-func": "error",
        "no-redeclare": "error",
        "no-return-await": "error",
        "no-sequences": "error",
        "no-shadow": "off",
        "no-sparse-arrays": "error",
        "no-template-curly-in-string": "error",
        "padding-line-between-statements": [
          "off",
          {
            "blankLine": "always",
            "prev": "*",
            "next": "return"
          }
        ],
        "prefer-object-spread": "error",
        "prefer-template": "error",
        "quote-props": [
          "off",
          "as-needed"
        ],
        "space-in-parens": [
          "error",
          "never"
        ]
      }
    },
    {
      "files": [
        "*.html"
      ],
      "parser": "@angular-eslint/template-parser",
      "plugins": [
        "@angular-eslint/template"
      ],
      "rules": {}
    }
  ]
}
