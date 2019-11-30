import assert from 'assert';
import AssertUtils from "../src/AssertUtils";
import StringUtils from "../src/StringUtils";

/* global describe, it */

describe('StringUtils', () => {

    describe('#formatStringWithArray', () => {

        it('can format a string without params', () => {
            AssertUtils.isEqual( StringUtils.formatStringWithArray('xxx', []), "xxx" );
        });

        it('can format a string with missing params', () => {
            AssertUtils.isEqual( StringUtils.formatStringWithArray('xxx%0%1', ['hello']), "xxxhello%1" );
        });

        it('can format a string with one param', () => {
            AssertUtils.isEqual( StringUtils.formatStringWithArray('xxx%0xxx', ["ABC"]), "xxxABCxxx" );
        });

        it('can format a string with two params', () => {
            AssertUtils.isEqual( StringUtils.formatStringWithArray(',%0,%1,', ["FOO", "BAR"]), ",FOO,BAR," );
        });

    });

    describe('#formatString', () => {

        it('can format a string without params', () => {
            AssertUtils.isEqual( StringUtils.formatString('xxx'), "xxx" );
        });

        it('can format a string with missing params', () => {
            AssertUtils.isEqual( StringUtils.formatString('xxx%0%1', 'hello'), "xxxhello%1" );
        });

        it('can format a string with one param', () => {
            AssertUtils.isEqual( StringUtils.formatString('xxx%0xxx', "ABC"), "xxxABCxxx" );
        });

        it('can format a string with two params', () => {
            AssertUtils.isEqual( StringUtils.formatString(',%0,%1,', "FOO", "BAR"), ",FOO,BAR," );
        });

    });

    describe('#strictFormatString', () => {

        it('can format a string without params', () => {
            AssertUtils.isEqual( StringUtils.strictFormatString('xxx'), "xxx" );
        });

        it('cannot format a string with missing params', () => {
            assert.throws( () => StringUtils.strictFormatString('xxx%0%1', 'hello') );
        });

        it('can format a string with one param', () => {
            AssertUtils.isEqual( StringUtils.strictFormatString('xxx%0xxx', "ABC"), "xxxABCxxx" );
        });

        it('can format a string with two params', () => {
            AssertUtils.isEqual( StringUtils.strictFormatString(',%0,%1,', "FOO", "BAR"), ",FOO,BAR," );
        });

    });

});

