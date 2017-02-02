/**
 * Created by Daniel Biales on 2/1/17.
 */
import 'angular-mocks';
import { visitry } from '/client/lib/app.js';
import {assert} from 'meteor/practicalmeteor:chai';
import './capitalize';

describe('Filter: capitalize', function () {
  var capitalize;
  let $filter;
  beforeEach(()=> {
    angular.mock.module('visitry')
  });
  beforeEach(inject(function (_$filter_) {
    $filter = _$filter_;
  }));
  it('first letter should be capitalized', ()=> {
    assert.equal($filter('capitalize')('hello'), 'Hello');
  });
  it('does not throw error if undefined is passed',()=>{
    assert.doesNotThrow(()=>$filter('capitalize')(''),/.*/,'capitalize does not throw error when empty string passed');
  });
});