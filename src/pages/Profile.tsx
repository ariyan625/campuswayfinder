import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, Save, UserRound } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Badge, Button, Card, Field, Input, SectionTitle, Select } from '../components/ui'
import type { Profile as ProfileType } from '../types'

export function Profile() {
  const { role, profile, updateProfile, resetApp } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState<ProfileType>(profile)
  const [saved, setSaved] = useState(false)

  if (!role) return null

  const save = () => {
    updateProfile(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1>Profile</h1>
        <p>Your details and preferences</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="profile-card">
          <div className="profile-avatar">
            {role === 'student' ? <GraduationCap size={30} /> : <UserRound size={30} />}
          </div>
          <div className="profile-card__head">
            <h3>{form.name || 'Your name'}</h3>
            <Badge tone={role === 'student' ? 'primary' : role === 'faculty' ? 'violet' : 'success'}>
              {role === 'visitor' ? 'Parent / Visitor' : role[0].toUpperCase() + role.slice(1)}
            </Badge>
          </div>
        </Card>
      </motion.div>

      <SectionTitle>Edit Profile</SectionTitle>
      <Card className="profile-form">
        <div className="form-grid">
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>

          {role === 'student' && (
            <>
              <Field label="Student ID">
                <Input value={form.studentId ?? ''} onChange={(e) => setForm({ ...form, studentId: e.target.value })} />
              </Field>
              <Field label="Department">
                <Input value={form.department ?? ''} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </Field>
              <Field label="Year">
                <Select value={form.year ?? '1st Year'} onChange={(e) => setForm({ ...form, year: e.target.value })}>
                  {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((y) => <option key={y}>{y}</option>)}
                </Select>
              </Field>
              <Field label="Section">
                <Input value={form.section ?? ''} onChange={(e) => setForm({ ...form, section: e.target.value })} />
              </Field>
            </>
          )}

          {role === 'faculty' && (
            <>
              <Field label="Faculty ID">
                <Input value={form.facultyId ?? ''} onChange={(e) => setForm({ ...form, facultyId: e.target.value })} />
              </Field>
              <Field label="Department">
                <Input value={form.department ?? ''} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </Field>
              <Field label="Cabin">
                <Input value={form.cabin ?? ''} onChange={(e) => setForm({ ...form, cabin: e.target.value })} />
              </Field>
            </>
          )}

          {role === 'visitor' && (
            <Field label="Visitor type">
              <Select value={form.visitorType ?? 'Parent'} onChange={(e) => setForm({ ...form, visitorType: e.target.value })}>
                {['Parent', 'Alumni', 'Prospective Student', 'Guest', 'Vendor'].map((t) => <option key={t}>{t}</option>)}
              </Select>
            </Field>
          )}
        </div>

        <div className="profile-actions">
          <Button onClick={save} icon={<Save size={16} />}>{saved ? 'Saved ✓' : 'Save Profile'}</Button>
        </div>
      </Card>

      <Card className="profile-danger">
        <h3>Change role</h3>
        <p>Switch to a different campus experience or start over.</p>
        <div className="profile-danger__actions">
          <Button variant="outline" onClick={() => navigate('/role')}>Change Role</Button>
          <Button
            variant="danger"
            onClick={() => {
              resetApp()
              navigate('/')
            }}
          >
            Reset Demo Data
          </Button>
        </div>
      </Card>
    </div>
  )
}
