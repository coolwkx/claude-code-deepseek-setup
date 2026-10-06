const assert=require('assert');const {Alerts,interval}=require('./token-monitor/alerts');const {summarize}=require('./token-monitor/usage');
const limits={CNY:{low:10,drop:5}},a=new Alerts(),check=(value,time)=>a.check([{currency:'CNY',total:value}],limits,time);
assert.equal(check(9,1000)[0].kind,'low');assert.equal(check(8,2000).length,0);assert.equal(new Alerts(a.saved()).check([{currency:'CNY',total:8}],limits,3000).length,0);check(20,4000);assert.equal(check(9,5000).length,2);assert.equal(check(3,6000).length,0);assert.equal(check(2,700000).length,0);
assert.equal(interval(true,0,1000),30000);assert.equal(interval(true,0,120000),300000);assert.equal(interval(false,1000,1001),300000);
const r=(id,session,input,output,time)=>({type:'assistant',sessionId:session,timestamp:time,message:{id,usage:{input_tokens:input,output_tokens:output,cache_read_input_tokens:2}}});
const d=summarize([r('a','one',10,1,'1'),r('a','one',10,3,'2'),r('a','two',10,3,'2'),r('b','two',20,5,'3')]);assert.equal(d.total.requests,2);assert.equal(d.total.output,8);assert.equal(d.total.input,30);assert.equal(d.sessions.length,2);assert.equal(d.sessions[0].id,'two');assert.equal(d.sessions[0].total.requests,2);
console.log('PASS: session totals, deduplication, warning persistence, recharge, cooldown, expiry, adaptive refresh');
