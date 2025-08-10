const express = require('express');
const path = require('path');
const db = require('./db');
const cors = require('cors');
const fs = require('fs');

db.ensure();
const DATA_FILE = db.DATA_FILE;

const app = express();
app.use(cors());
app.use(express.json());

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'scamshield-admin-2025!';

// simple auth endpoint
app.post('/api/auth', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) return res.json({ ok: true });
  return res.status(401).json({ ok: false });
});

// members CRUD
app.get('/api/members', (req,res)=>{
  const d = db.load();
  res.json(d.members || []);
});
app.post('/api/members', (req,res)=>{
  const d = db.load();
  d.members = d.members || [];
  d.members.push(req.body);
  db.save(d);
  res.json({ok:true});
});
app.put('/api/members/:id', (req,res)=>{
  const d = db.load();
  d.members = d.members || [];
  d.members = d.members.map(m=> m.id===req.params.id ? {...m, ...req.body} : m);
  db.save(d);
  res.json({ok:true});
});
app.delete('/api/members/:id', (req,res)=>{
  const d = db.load();
  d.members = (d.members || []).filter(m=>m.id!==req.params.id);
  db.save(d);
  res.json({ok:true});
});

// timeseries
app.get('/api/timeseries', (req,res)=>{
  const d = db.load();
  res.json(d.timeseries || []);
});
app.post('/api/timeseries', (req,res)=>{
  const d = db.load();
  d.timeseries = d.timeseries || [];
  d.timeseries.push(req.body);
  db.save(d);
  res.json({ok:true});
});

// export/import
app.get('/api/export', (req,res)=>{
  const d = db.load();
  res.setHeader('Content-Disposition','attachment; filename=backup.json');
  res.json(d);
});
app.post('/api/import', (req,res)=>{
  const payload = req.body || {};
  db.save(payload);
  res.json({ok:true});
});

// serve static built frontend
const staticPath = path.resolve(process.cwd(), 'dist/public');
if(fs.existsSync(staticPath)){
  app.use(express.static(staticPath));
  app.get('*', (req,res)=> res.sendFile(path.join(staticPath,'index.html')));
}else{
  app.get('/', (req,res)=> res.send('Build the client first (npm run build)'));
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Server listening on', PORT));
