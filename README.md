# utils

Common almost-non-dependable(*) utils for ES6 and Node.js, with MIT license.

(*) Only runtime dependency is to [Lodash](https://lodash.com/).

----------------------------------------------------------------------------------------------------

### Install stable from NPM

`npm install @norjs/utils`

### Install latest from Github

`npm install norjs/utils`

----------------------------------------------------------------------------------------------------

### TypeUtils 

Runtime JSDoc style type asserting and testing.

```js
const TypeUtils = require('@norjs/utils/Type');
```

----------------------------------------------------------------------------------------------------

#### `TypeUtils.assert(value, type)`

This function throws a `TypeError` if value is not of the type definition.

```js

// Basic types
TypeUtils.assert(          "123", "string");
TypeUtils.assert(            123, "number");
TypeUtils.assert(           true, "boolean");
TypeUtils.assert(          false, "boolean");
TypeUtils.assert(       () => {}, "function");
TypeUtils.assert(      undefined, "undefined");
TypeUtils.assert(           null, "null");

// Objects
TypeUtils.assert(             {}, "{}");
TypeUtils.assert(             {}, "Object");
TypeUtils.assert(   {foo: "bar"}, "Object.<string,string>");
TypeUtils.assert(    {foo:"bar"}, "{foo:string}");

// Arrays
TypeUtils.assert(      [1, 2, 3], "Array");
TypeUtils.assert(["1", "2", "3"], "Array.<string>");
TypeUtils.assert(["1", "2", "3"], "string[]");

// Multiple types
TypeUtils.assert("false", "boolean|string");

// Intersections
TypeUtils.assert( {"foo": 1, "bar": 2}, "{bar:number} & {foo:number}");

```

----------------------------------------------------------------------------------------------------

#### `TypeUtils.test(value, type)`

This function returns `false` if `value` is not of the type definition.

```js
if (TypeUtils.test("123", "string")) {
    // ...
}
```

----------------------------------------------------------------------------------------------------

#### `TypeUtils.defineType(name, type)`

You can define your own JSDoc `typedef` definitions like this:

```js
/** 
 * @typedef {string} MyStringType
 */
TypeUtils.defineType("MyStringType", "string");
TypeUtils.assert("bar", "MyStringType");

/** 
 * @typedef {Object} MyFooType
 * @property {string} foo - The foo property
 */
TypeUtils.defineType("MyFooType", {"foo": "string"});
TypeUtils.assert({foo:"bar"}, "MyFooType");
```

...and your classes like:

```js
class Foo { 
    // ...
}
TypeUtils.defineType("Foo", TypeUtils.classToTestType(Foo));
```

...and your interfaces like: 

```js
/**
 * @interface
 */
class FooInterface {
    // ...    
}
TypeUtils.defineType(
  "FooInterface", 
  TypeUtils.classToObjectPropertyTypes(FooInterface),
  {
    acceptUndefinedProperties: true // Accept test subject to have properties not defined in FooInterface
  }
);
```

----------------------------------------------------------------------------------------------------

#### `TypeUtils.toString(value)`

Returns a human readable string presentation of `value`.

----------------------------------------------------------------------------------------------------

#### `TypeUtils.isPromise(value)`

Returns `true` if `value` is a promise (eg. it is an object and has `then` method).

----------------------------------------------------------------------------------------------------

### LogicUtils 

```js
const LogicUtils = require('@norjs/utils/Logic');
```

----------------------------------------------------------------------------------------------------

#### `LogicUtils.tryCatch(f, handleError)`

Will call function `f` inside a try-catch block.

If an exception is thrown, the `handleError(error)` function will be called with an error object.

The result from `f()` will be returned, except if an error occurs, then the result from `handleError(error)`.

*Note:* Some JS environments (eg. some versions of Google v8) will turn off performance optimizations 
and fallback in to the slower interpreter mode when a try-catch block is detected for the whole 
execution block. **However**, this function *may be slower than try-catch block* on modern environments. 

----------------------------------------------------------------------------------------------------

