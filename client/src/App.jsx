import React, { useEffect, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'

const COLORS = ['#4f46e5','#06b6d4','#f59e0b','#ef4444','#10b981']

function shortId(){ return 'id'+Math.floor(Math.random()*1000000) }

export default function App(){
  const [timeseries,setTimeseries] = useState([])
  const [members,setMembers] = useState([])
  const [adminMode,setAdminMode] = useState(false)
  const [newMemberName,setNewMemberName] = useState('')
  const [newTSDate,setNewTSDate] = useState('')
  const [newTSMembers,setNewTSMembers] = useState('')

  useEffect(()=>{ fetch('/api/timeseries').then(r=>r.json()).then(setTimeseries).catch(()=>setTimeseries([]))
    fetch('/api/members').then(r=>r.json()).then(setMembers).catch(()=>setMembers([]))
  },[])

  const loginAdmin = async () => {
    const p = prompt('Enter admin password:')
    if(!p) return
    const res = await fetch('/api/auth',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({password:p})})
    const j = await res.json()
    if(j.ok) setAdminMode(true)
    else alert('Unauthorized')
  }

  const addMember = async ()=>{
    if(!newMemberName) return alert('enter name')
    const id = shortId()
    const m = { id, name:newMemberName, notes:'', roles:'', trust:50, reviews:[] , flagged:false }
    const res = await fetch('/api/members',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(m)})
    if(res.ok){ setMembers(s=>[...s,m]); setNewMemberName('') }
  }

  const updateMember = async (id, updates) => {
    const res = await fetch('/api/members/'+id,{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(updates)})
    if(res.ok){ setMembers(s=>s.map(m=>m.id===id?({...m,...updates}):m)) }
  }

  const removeMember = async (id) => {
    if(!confirm('Delete member?')) return
    const res = await fetch('/api/members/'+id,{method:'DELETE'})
    if(res.ok) setMembers(s=>s.filter(m=>m.id!==id))
  }

  const addTS = async ()=>{
    if(!newTSDate || !newTSMembers) return alert('date and members required')
    const id = shortId()
    const payload = { id, date:newTSDate, members: Number(newTSMembers), scamReports:0 }
    const res = await fetch('/api/timeseries',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)})
    if(res.ok){ setTimeseries(s=>[...s,payload]); setNewTSDate(''); setNewTSMembers('') }
  }

  const exportRemote = ()=>{ window.location.href='/api/export' }

  const avgTrust = members.length ? Math.round(members.reduce((s,m)=>s+(m.trust||0),0)/members.length) : 0
  const reviewBuckets = [0,0,0,0,0]
  members.forEach(m=>(m.reviews||[]).forEach(r=>reviewBuckets[r-1]++))
  const pieData = reviewBuckets.map((c,i)=>({name:`${i+1}★`, value:c}))

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>Scam Shield Society — Dashboard</h1>
          <div className="small">Track members, trust scores, scams and growth</div>
        </div>
        <div className="controls">
          {!adminMode ? <button className="btn btn-ghost" onClick={loginAdmin}>Admin</button> : <div className="badge">Admin</div>}
          <button className="btn btn-primary" onClick={exportRemote}>Export JSON</button>
        </div>
      </div>

      <div className="grid">
        <div>
          <div className="card" style={{marginBottom:12}}>
            <h3>Growth (Members over time)</h3>
            <div style={{width:'100%',height:320}}>
              <ResponsiveContainer>
                <LineChart data={timeseries}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="members" stroke="#4f46e5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {adminMode && <div style={{marginTop:8}}><input className="small-input" placeholder="YYYY-MM-DD" value={newTSDate} onChange={e=>setNewTSDate(e.target.value)} /> <input className="small-input" placeholder="members" value={newTSMembers} onChange={e=>setNewTSMembers(e.target.value)} /> <button className="btn" onClick={addTS}>Add point</button></div>}
          </div>

          <div className="card" style={{marginBottom:12}}>
            <h3>Scam categories</h3>
            <div style={{width:'100%',height:220}}>
              <ResponsiveContainer>
                <BarChart data={[{name:'Phishing',count:24},{name:'Fake Shop',count:10},{name:'Tech Support',count:15}]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count">
                    {Array.from({length:3}).map((_,i)=>(<Cell key={i} fill={COLORS[i%COLORS.length]} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3>Impact vs Awareness (sample)</h3>
            <div style={{width:'100%',height:200}}>
              <ResponsiveContainer>
                <BarChart data={[{name:'A',x:20,y:8},{name:'B',x:50,y:40}]}><XAxis dataKey="name"/><YAxis/></BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <aside>
          <div className="card" style={{marginBottom:12}}>
            <h3>Members • avg trust {avgTrust}</h3>
            <div>
              {members.map(m=>(
                <div className="member-row" key={m.id}>
                  <div style={{flex:1}}>
                    <strong>{m.name}</strong>
                    <div className="small">{m.notes || ''}</div>
                    <div className="small">Roles: {m.roles || '-'}</div>
                    {m.flagged && <div className="small" style={{color:'#ef4444'}}>FLAGGED</div>}
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div className="small">{m.trust}</div>
                    <div style={{marginTop:6}}>
                      <button className="btn btn-ghost" onClick={()=>{ const t=prompt('Trust 0-100',m.trust); if(t!==null) updateMember(m.id,{trust:Number(t)}) }}>Edit</button>
                      <button className="btn" onClick={()=>updateMember(m.id,{flagged:!m.flagged})}>{m.flagged ? 'Unflag':'Flag'}</button>
                      <button className="btn" onClick={()=>removeMember(m.id)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {adminMode &&
              <div style={{marginTop:8}}>
                <input className="small-input" placeholder="member name" value={newMemberName} onChange={e=>setNewMemberName(e.target.value)} />
                <button className="btn" onClick={addMember}>Add</button>
              </div>
            }
          </div>

          <div className="card">
            <h3>Reviews</h3>
            <div style={{width:260,height:180}}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} dataKey="value" outerRadius={70}>
                    {pieData.map((_,i)=>(<Cell key={i} fill={COLORS[i%COLORS.length]} />))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="small" style={{marginTop:8}}>Click a member to add a review (admin)</div>
          </div>
        </aside>
      </div>

      <div className="footer card">Enhanced starter — admin password is stored in server env; default password is shown in README and .env.example</div>
    </div>
  )
}
