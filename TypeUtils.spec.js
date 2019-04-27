import sinon from 'sinon';
import assert from 'assert';
import _ from 'lodash';
import TypeUtils from './TypeUtils.js';

describe('TypeUtils', () => {

    describe( '#assert', () => {

        describe('with #defineDefaults', () => {

            before( () => {
                TypeUtils.defineDefaults();
            });

            after( () => {
                TypeUtils.resetInitialState();
            });

            describe('*', () => {
                it('can assert wildcard type', () => TypeUtils.assert("hello", "*"));
            });

            describe('string', () => {
                it('can assert string type', () => TypeUtils.assert("hello", "string"));
                it('can assert String type', () => TypeUtils.assert("hello", "String"));
                it('throws non-string type', () => assert.throws(() => TypeUtils.assert(123, "string"), TypeError));
            });

            describe('number', () => {
                it('can assert number type', () => TypeUtils.assert(123, "number") );
                it('can assert Number type', () => TypeUtils.assert(123, "Number") );
                it('throws non-number type', () => assert.throws(() => TypeUtils.assert("123", "number"), TypeError) );
            });

            describe('undefined', () => {
                it('can assert undefined type', () => TypeUtils.assert(undefined, "undefined") );
                it('throws non-undefined type', () => assert.throws(() => TypeUtils.assert("123", "undefined"), TypeError) );
            });

            describe('null', () => {
                it('can assert null type', () => TypeUtils.assert(null, "null") );
                it('throws non-null type', () => assert.throws(() => TypeUtils.assert("123", "null"), TypeError) );
            });

            describe('boolean', () => {
                it('can assert true type', () => TypeUtils.assert(true, "boolean") );
                it('can assert false type', () => TypeUtils.assert(false, "boolean") );
                it('throws non-boolean type', () => assert.throws(() => TypeUtils.assert("123", "boolean"), TypeError) );
            });

            describe('symbol', () => {
                it('can assert symbol type', () => TypeUtils.assert(Symbol('test'), "symbol") );
                it('can assert Symbol type', () => TypeUtils.assert(Symbol('test'), "Symbol") );
                it('throws non-symbol type', () => assert.throws(() => TypeUtils.assert("123", "symbol"), TypeError) );
            });

            describe('function', () => {
                it('can assert function type', () => TypeUtils.assert(() => {}, "function") );
                it('can assert Function type', () => TypeUtils.assert(() => {}, "Function") );
                it('throws non-function type', () => assert.throws(() => TypeUtils.assert("123", "function"), TypeError) );
            });

            describe('array', () => {
                it('can assert mixed array', () => TypeUtils.assert([1, 2, "test"], "Array") );
                it('can assert number array with dot', () => TypeUtils.assert([1, 2, 3], "Array.<number>") );
                it('can assert number array', () => TypeUtils.assert([1, 2, 3], "Array<number>") );
                it('can assert number array with []', () => TypeUtils.assert([1, 2, 3], "number[]") );
                it('can assert string array with dot', () => TypeUtils.assert(["a", "b", "c"], "Array.<string>") );
                it('can assert string array', () => TypeUtils.assert(["a", "b", "c"], "Array<string>") );
                it('throws non-array type', () => assert.throws(() => TypeUtils.assert("123", "array"), TypeError) );
            });

            describe('object', () => {
                it('can assert with object literal', () => TypeUtils.assert({}, "{}") );
                it('can assert with custom object literal', () => TypeUtils.assert({foo:"value"}, "{foo:string}") );
                it('can assert object type', () => TypeUtils.assert({}, "object") );
                it('can assert Object type', () => TypeUtils.assert({}, "Object") );
                it('can assert custom object with dot', () => TypeUtils.assert({foo: 123}, "Object.<string, number>") );
                it('can assert custom object', () => TypeUtils.assert({foo: 123}, "Object<string, number>") );

                it('throws non-object type', () => assert.throws(() => TypeUtils.assert("123", "object"), TypeError) );
                it('throws non-object type with custom object literal', () => assert.throws(() => TypeUtils.assert("123", "{foo:string}"), TypeError) );

                it('throws when property has invalid type',
                    () => assert.throws(
                        () => TypeUtils.assert({foo:"123"}, "{foo:number}"),
                        TypeError
                    )
                );

                it('throws when property is not defined in type definition',
                    () => assert.throws(
                        () => TypeUtils.assert({foo: 123, bar:"123"}, "{foo:number}"),
                        TypeError
                    )
                );

            });

            describe('Date', () => {
                it('can assert Date type', () => TypeUtils.assert(new Date(), "Date") );
                it('throws non-Date type', () => assert.throws(() => TypeUtils.assert("123", "Date"), TypeError) );
            });

            describe('Promise', () => {
                it('can assert promise type', () => TypeUtils.assert(Promise.resolve(), "promise") );
                it('can assert Promise type', () => TypeUtils.assert(Promise.resolve(), "Promise") );
                it('can assert specific Promise type', () => TypeUtils.assert(Promise.resolve(), "Promise<number>") );
                it('can assert specific Promise type with dot', () => TypeUtils.assert(Promise.resolve(), "Promise.<number>") );
                it('can assert specific promise type', () => TypeUtils.assert(Promise.resolve(), "promise<number>") );
                it('can assert specific promise type with dot', () => TypeUtils.assert(Promise.resolve(), "promise.<number>") );
                it('throws non-Promise type', () => assert.throws(() => TypeUtils.assert("123", "Promise"), TypeError) );
            });

            describe('string|number', () => {
                it('can assert string type', () => TypeUtils.assert("hello", "string|number"));
                it('can assert number type', () => TypeUtils.assert(123, "string|number"));
                it('throws when invalid type', () => assert.throws(() => TypeUtils.assert(true, "string|number"), TypeError));
            });

            describe('string|{foo:string}', () => {
                it('can assert object type', () => TypeUtils.assert({foo:"hello"}, "string|{foo:string}"));
                it('can assert string type', () => TypeUtils.assert("123", "string|{foo:string}"));
                it('throws when invalid type', () => assert.throws(() => TypeUtils.assert(true, "string|{foo:string}"), TypeError));
            });

            describe('Object.<string, string>|{foo:string}', () => {
                it('can assert object type', () => TypeUtils.assert({foo:"hello"}, "Object.<string, string>|{foo:string}"));
                it('can assert string type', () => TypeUtils.assert({bar: "world"}, "Object.<string, string>|{foo:string}"));

                it('throws when invalid value', () => assert.throws(
                    () => TypeUtils.assert(
                        true,
                        "Object.<string, string>|{foo:string}"),
                    TypeError)
                );

                it('throws when invalid property', () => assert.throws(
                    () => TypeUtils.assert(
                        {"foo": 123},
                        "Object.<string, string>|{foo:string}"),
                    TypeError)
                );

                it('throws when invalid custom property', () => assert.throws(
                    () => TypeUtils.assert(
                        {"bar": 123},
                        "Object.<string, string>|{foo:string}"),
                    TypeError)
                );

            });

            // intersection
            describe('{foo:string} & {bar: number}', () => {
                it('can assert string type', () => TypeUtils.assert({foo: "hello"}, "{foo:string} & {bar: number}"));
                it('can assert number type', () => TypeUtils.assert({bar: 123}, "{foo:string} & {bar: number}"));
                it('throws when invalid value as boolean', () => assert.throws(() => TypeUtils.assert(true, "{foo:string} & {bar: number}"), TypeError));
                it('throws when invalid value property', () => assert.throws(() => TypeUtils.assert({hello: "world"}, "{foo:string} & {bar: number}"), TypeError));
            });

        });

        describe('with #defineType', () => {

            before( () => {
                TypeUtils.defineDefaults();
                TypeUtils.defineType("Foo", {
                    "value": "string",
                    "ready": "boolean"
                });
            });

            after( () => {
                TypeUtils.resetInitialState();
            });

            it('can assert Foo object', () => {
                TypeUtils.assert({value: "hello", ready: true}, "Foo");
            });

            it('can assert Foo object with intersection', () => {
                TypeUtils.assert({value: "hello", ready: false, error: "Test error"}, "Foo & {error:string}");
            });

            it('throws error for Foo object with bad value', () => {
                assert.throws(
                    () => TypeUtils.assert(
                        {value: "hello", ready: false, error: 123},
                        "Foo"
                    ),
                    TypeError
                );
            });

            it('throws error for Foo object with intersection and bad value', () => {
                assert.throws(
                    () => TypeUtils.assert(
                        {value: "hello", ready: false, error: 123},
                        "Foo & {error:string}"
                    ),
                    TypeError
                );
            });

        });

    });

});
