// Summarize retained valid Lighthouse reports; never rerun or replace measurements.
import assert from 'node:assert/strict';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
const median=values=>{const sorted=[...values].sort((a,b)=>a-b), middle=Math.floor(sorted.length/2);return sorted.length%2?sorted[middle]:(sorted[middle-1]+sorted[middle])/2;};
const report={builds:{},differences:{},settingsMatch:true,complete:true,expectedRunsPerProfile:3};
const completion=process.argv.includes('--completion');
const labels=completion ? ['completion-before','completion-after'] : ['performance-before','performance-after'];
let expectedSettings={};
for(const label of labels) {
 const dir=`.cache/phase08-performance/${label}`;
 const build={...(JSON.parse(await readFile(`${dir}/build.json`,'utf8'))),profiles:{}};
 for(const profile of ['mobile','desktop']) {
  const runs=[], missingRuns=[];
  for(let n=1;n<=3;n++) {
   const bytes=await readFile(`${dir}/${profile}-${n}.json`,'utf8').catch(error=>{
    if(error.code==='ENOENT'&&profile==='desktop'){missingRuns.push(n);return null;}
    throw error;
   });
   if(bytes===null) continue;
   const l=JSON.parse(bytes);
   assert.ok(!l.runtimeError,'Only valid reports belong in the comparison');
   const settings=JSON.stringify({config:l.configSettings,version:l.lighthouseVersion,browser:l.userAgent});
   expectedSettings[profile]??=settings;
   assert.equal(settings,expectedSettings[profile],'Matched version, browser and measurement settings required');
   const network=l.audits['network-requests'].details.items;
   const metric=id=>l.audits[id].numericValue;
   runs.push({run:n,score:l.categories.performance.score*100,LCP:metric('largest-contentful-paint'),TBT:metric('total-blocking-time'),CLS:metric('cumulative-layout-shift'),JS:network.filter(r=>/javascript/.test(r.mimeType)).reduce((sum,r)=>sum+r.transferSize,0),transfer:metric('total-byte-weight'),benchmarkIndex:l.environment.benchmarkIndex,lcpElement:l.audits['lcp-breakdown-insight']?.details?.items?.find(item=>item.type==='node')?.selector,mainthread:l.audits['mainthread-work-breakdown'].details.items});
  }
  assert.ok(runs.length>=(profile==='mobile'?3:2),'At least three mobile and two desktop valid reports required');
  report.complete&&=runs.length===3;
  build.profiles[profile]={runs,missingRuns,medians:Object.fromEntries(['score','LCP','TBT','CLS','JS','transfer'].map(key=>[key,median(runs.map(r=>r[key]))]))};
 }
 report.builds[label]=build;
}
for(const profile of ['mobile','desktop']) {
 const before=report.builds[labels[0]].profiles[profile].medians;
 const after=report.builds[labels[1]].profiles[profile].medians;
 report.differences[profile]=Object.fromEntries(Object.keys(before).map(k=>[k,after[k]-before[k]]));
}
const directory=completion ? '.cache/final-completion' : '.cache/performance-review';
await mkdir(directory,{recursive:true});
await writeFile(`${directory}/${completion ? 'performance-comparison' : 'comparison'}.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify({complete:report.complete,medians:Object.fromEntries(Object.entries(report.builds).map(([k,v])=>[k,Object.fromEntries(Object.entries(v.profiles).map(([p,x])=>[p,{validRuns:x.runs.length,missingRuns:x.missingRuns,...x.medians}]))])),differences:report.differences,settingsMatch:true}));
