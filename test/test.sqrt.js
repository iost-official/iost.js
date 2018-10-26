const mocha = require('mocha');

const { describe, it } = mocha;
const chai = require('chai');
const My = require('../sqrt.js');

const { expect } = chai;

describe('sqrt', () => {
  it('4的平方根应该等于2', () => {
    expect(My.sqrt(4)).to.equal(2);
  });

  it('参数为负值时应该报错', () => {
    expect(() => { My.sqrt(-1); }).to.throw('负值没有平方根');
  });
});
