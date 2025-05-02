/**
 * @file Resolve the issue of Prettier configuration not taking effect in VSCode
 * @author lishaohai
 */

// Official website: https://prettier.io/docs/en/configuration.html

// A good article: https://juejin.im/post/5cc58039f265da03775c5a6f

// A brief discussion on how to code comfortably with VS Code: https://www.jianshu.com/p/25b87bc8d36a

// Prettier formatting configuration (recommended): https://www.cnblogs.com/oneweek/p/11236515.html

module.exports = {
    trailingComma: 'none', // Whether to add a comma after the last element in objects or arrays (add trailing comma in ES5)
    tabWidth: 4, // Number of spaces for indentation
    semi: true, // Add semicolons at the end of statements
    singleQuote: true, // Use single quotes instead of double quotes
    proseWrap: 'never', // Whether to wrap lines when code exceeds the limit. 'never' for wrapping, 'preserve' for keeping as is
    printWidth: 140, // Maximum line length before wrapping
    bracketSpacing: false, // Do not allow spaces between objects and curly braces
    jsxSingleQuote: false, // Use single quotes instead of double quotes in JSX
    arrowParens: 'avoid', // Whether to include parentheses around a single parameter in arrow functions. 'avoid': omit parentheses
    space_after_anon_function: true,
    space_after_named_function: true
};
