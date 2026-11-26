import {readFileSync,writeFileSync,existsSync} from 'node:fs';

// The same WebP sidecar format used by Impeccable embed-prompt. Keep the exact
// origin beside every derivative without modifying any fabric pixels.
export function writeRasterProvenance(dataset,root) {
 for(const fabric of dataset.fabrics)for(const size of [320,960]) {
  const first=fabric.sources[0];
  const prompt=`Origin: user-provided ${dataset.source.source}, SHA-256 ${dataset.source.sha256}. Real Carnevali fabric scan: ${fabric.collection} ${fabric.code}. Source PDF page ${first.page}, original scan box ${first.box.join(',')}. ${size===320?'Central crop at aspect 1.24, resized to at most 320px.':'Full-width scan crop resized to at most 960px.'} No generated fabric pixels. Complete source references in fabrics.json and catalog-provenance.json; pipeline in scripts/extract-catalog.py.`;
  const path=new URL(`assets/tessuti/${fabric.id}-${size}.webp.json`,root);
  let previous;
  if(existsSync(path))try{previous=JSON.parse(readFileSync(path,'utf8'));}catch{}
  if(previous?.prompt===prompt)continue;
  writeFileSync(path,JSON.stringify({prompt,createdAt:previous?.createdAt||new Date().toISOString()},null,2)+'\n');
 }
}
