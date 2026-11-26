// Compare decoded review pixels. Artifacts stay ignored and never enter public builds.
import {readdir, readFile, writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import sharp from 'sharp';
const root='.cache/performance-review';
const names=(await readdir(`${root}/before`)).filter(name=>name.endsWith('.png')).sort();
const report=[];
for(const name of names) {
 const before=await sharp(await readFile(`${root}/before/${name}`)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const after=await sharp(await readFile(`${root}/after/${name}`)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const sameSize=before.info.width===after.info.width&&before.info.height===after.info.height;
 let changedPixels=0;
  if(sameSize) for(let i=0;i<before.data.length;i+=4) {
  if(before.data[i]!==after.data[i]||before.data[i+1]!==after.data[i+1]||before.data[i+2]!==after.data[i+2]||before.data[i+3]!==after.data[i+3]) changedPixels++;
 }
 const row={name,width:before.info.width,height:before.info.height,sameSize,changedPixels:sameSize?changedPixels:null,changedPercent:sameSize?100*changedPixels/(before.info.width*before.info.height):null};
 if(sameSize&&changedPixels) {
  const width=before.info.width, height=before.info.height;
  let best={offset:0,ratio:0};
  for(let offset=-512;offset<=512;offset++) {
   let matches=0,total=0;
   for(let y=Math.max(0,-offset);y<Math.min(height,height-offset);y+=16) for(let x=0;x<width;x+=32) {
    const a=(y*width+x)*4,b=((y+offset)*width+x)*4;
    total++;if(before.data[a]===after.data[b]&&before.data[a+1]===after.data[b+1]&&before.data[a+2]===after.data[b+2]) matches++;
   }
   if(matches/total>best.ratio) best={offset,ratio:matches/total};
  }
  let overlapChangedPixels=0;
  for(let y=Math.max(0,-best.offset);y<Math.min(height,height-best.offset);y++) for(let x=0;x<width;x++) {
   const a=(y*width+x)*4,b=((y+best.offset)*width+x)*4;
   if(before.data[a]!==after.data[b]||before.data[a+1]!==after.data[b+1]||before.data[a+2]!==after.data[b+2]||before.data[a+3]!==after.data[b+3]) overlapChangedPixels++;
  }
  row.cropAlignment={verticalOffset:best.offset,overlapChangedPixels};
 }
 report.push(row);
}
await writeFile(`${root}/visual-comparison.json`,JSON.stringify(report,null,2));
assert.ok(report.length>=7&&report.every(r=>r.sameSize),'Review matching screenshot dimensions');
console.log(JSON.stringify({captures:report.length,identical:report.filter(r=>r.changedPixels===0).length,changed:report.filter(r=>r.changedPixels!==0)}));
