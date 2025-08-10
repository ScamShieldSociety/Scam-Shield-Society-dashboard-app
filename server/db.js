const fs = require('fs');
const path = require('path');
const DATA_FILE = path.resolve(process.cwd(), 'data.json');

function load(){
  try{
    const raw = fs.readFileSync(DATA_FILE,'utf8');
    return JSON.parse(raw);
  }catch(e){
    return { members:[], timeseries:[] };
  }
}
function save(data){
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}
function ensure(){
  const d = load();
  if(!d.members) d.members=[];
  if(!d.timeseries) d.timeseries=[];
  save(d);
  return d;
}
module.exports = { load, save, ensure, DATA_FILE };
