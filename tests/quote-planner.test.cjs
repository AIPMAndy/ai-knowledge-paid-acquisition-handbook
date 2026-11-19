const test = require("node:test");
const assert = require("node:assert/strict");
const { calculate, asCSV } = require("../site/quote-planner.js");
test("明确虚构的教学算例计算正确", () => {
 const r = calculate({ price:399, variable:39, hours:1, hourrate:80, fixed:1000, budget:300, conversion:20 });
 assert.equal(r.ok,true); assert.equal(r.perOrder,280); assert.equal(r.orders,5); assert.equal(r.leads,25);
 assert.ok(asCSV(r,"demo").includes("完全虚构教学模拟"));
 assert.ok(asCSV(r,"demo").startsWith("\ufeff"));
});
test("未知值不得默认为零", () => {
 assert.equal(calculate({price:500,variable:"",hours:1,hourrate:30,fixed:100,budget:0}).ok,false);
});
test("每单非正贡献不捏造保本单量", () => {
 const r=calculate({price:100,variable:110,hours:0,hourrate:0,fixed:500,budget:0});
 assert.equal(r.ok,true);assert.equal(r.orders,null);assert.equal(r.leads,null);
});
test("没有转化率不编造咨询人数", () => {
 const r=calculate({price:300,variable:100,hours:0,hourrate:0,fixed:400,budget:0});
 assert.equal(r.orders,2);assert.equal(r.leads,null);
});
test("无效转化率和数字被拒绝", () => {
 for(const conversion of [0,-1,101,Infinity,"abc"]) assert.equal(calculate({price:500,variable:0,hours:0,hourrate:0,fixed:50,budget:20,conversion}).ok,false);
 assert.equal(calculate({price:NaN,variable:0,hours:0,hourrate:0,fixed:0,budget:0}).ok,false);
});
test("零固定成本与零预算理论保本为零单", () => {
 const r=calculate({price:100,variable:0,hours:0,hourrate:0,fixed:0,budget:0,conversion:50});
 assert.equal(r.orders,0); assert.equal(r.leads,0);
});
test("无超大溢出", () => {
 assert.equal(calculate({price:1,variable:0,hours:0,hourrate:0,fixed:Number.MAX_VALUE,budget:0,conversion:0.1}).ok,false);
});