// @system — Mobile Responsive Components Demo
// Showcase of mobile-optimized components and patterns
// This page demonstrates best practices for mobile-first design

import { useState } from 'react'
import { Users, Mail, Phone, MapPin, Edit, Trash2, Plus } from 'lucide-react'
import { DashboardLayout } from '@/app/components/@system/Dashboard/DashboardLayout'
import { MobileTable } from '@/app/components/@system/Dashboard/MobileTable'
import { MobileForm } from '@/app/components/@system/Form/MobileForm'
import { MobileModal } from '@/app/components/@system/Modal/MobileModal'
import { StatCard, StatCardGrid } from '@/app/components/@system/Dashboard/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/@system/Card/Card'
import { Button } from '@/app/components/@system/ui/button'
import { Input } from '@/app/components/@system/Form/Form'
import { Badge } from '@/app/components/@system/ui/badge'

// Sample data
const SAMPLE_USERS = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 234 567 8900',
    status: 'active',
    role: 'Admin',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1 234 567 8901',
    status: 'active',
    role: 'User',
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    phone: '+1 234 567 8902',
    status: 'inactive',
    role: 'User',
  },
]

export function MobileResponsiveDemo() {
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })

  const handleFormSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    setFormModalOpen(false)
  }

  const handleUserClick = (user) => {
    console.log('User clicked:', user)
  }

  return (
    <DashboardLayout>
      <DashboardLayout.Content>
        <DashboardLayout.Header
          title="Mobile Responsive Demo"
          description="Examples of mobile-optimized components and patterns"
        />

        {/* Stats Grid - Responsive */}
        <DashboardLayout.Section
          title="Responsive Stat Cards"
          description="1 column on mobile, 2 on tablet, 4 on desktop"
        >
          <StatCardGrid>
            <StatCard
              label="Total Users"
              value="2,543"
              trend={{ value: 12, direction: 'up' }}
              description="vs last month"
              icon={Users}
            />
            <StatCard
              label="Active Sessions"
              value="1,234"
              trend={{ value: 5, direction: 'down' }}
              description="in last 24h"
              icon={Activity}
            />
            <StatCard
              label="Revenue"
              value="$45,678"
              trend={{ value: 23, direction: 'up' }}
              description="this month"
              icon={CreditCard}
            />
            <StatCard
              label="Conversion"
              value="3.2%"
              trend={{ value: 0.5, direction: 'up' }}
              description="from last week"
              icon={BarChart}
            />
          </StatCardGrid>
        </DashboardLayout.Section>

        {/* Mobile Table - Card view on mobile */}
        <DashboardLayout.Section
          title="Mobile-Optimized Table"
          description="Cards on mobile, table on desktop"
          actions={
            <Button onClick={() => setFormModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          }
        >
          <MobileTable
            columns={[
              {
                key: 'name',
                label: 'Name',
                primary: true,
              },
              {
                key: 'email',
                label: 'Email',
              },
              {
                key: 'phone',
                label: 'Phone',
              },
              {
                key: 'status',
                label: 'Status',
                render: (value) => (
                  <Badge variant={value === 'active' ? 'default' : 'secondary'}>
                    {value}
                  </Badge>
                ),
              },
              {
                key: 'role',
                label: 'Role',
                hideOnMobile: true,
              },
            ]}
            data={SAMPLE_USERS}
            onRowClick={handleUserClick}
          />
        </DashboardLayout.Section>

        {/* Responsive Grid */}
        <DashboardLayout.Section
          title="Responsive Grid Layout"
          description="Stacks on mobile, 2 columns on tablet, 3 on desktop"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Email</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Send and receive emails
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Phone</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Make and receive calls
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Location</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View location services
                </p>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout.Section>

        {/* Buttons for Modals */}
        <DashboardLayout.Section title="Modal Examples">
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setFormModalOpen(true)}>
              Open Form Modal
            </Button>
            <Button variant="destructive" onClick={() => setDeleteModalOpen(true)}>
              Open Delete Confirmation
            </Button>
          </div>
        </DashboardLayout.Section>

        {/* Mobile Utilities Showcase */}
        <DashboardLayout.Section
          title="Mobile Utilities"
          description="Touch targets, safe areas, and responsive text"
        >
          <Card>
            <CardContent className="space-y-6 p-4 sm:p-6">
              {/* Touch Targets */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Touch Targets (44x44px minimum)</h4>
                <div className="flex flex-wrap gap-2">
                  <button className="touch-target rounded-md bg-primary text-primary-foreground">
                    Touch
                  </button>
                  <button className="touch-target rounded-md border">
                    Target
                  </button>
                  <button className="touch-target rounded-md bg-secondary">
                    Example
                  </button>
                </div>
              </div>

              {/* Responsive Text */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Responsive Typography</h4>
                <p className="text-mobile-sm mb-2">Small mobile-optimized text</p>
                <p className="text-mobile-base mb-2">Base mobile-optimized text</p>
                <h3 className="text-mobile-lg">Large responsive heading</h3>
              </div>

              {/* Mobile Stack */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Mobile Stack (vertical → horizontal)</h4>
                <div className="mobile-stack">
                  <Button variant="outline">Cancel</Button>
                  <Button>Confirm</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </DashboardLayout.Section>
      </DashboardLayout.Content>

      {/* Form Modal - Full screen on mobile */}
      <MobileModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title="Add New User"
        description="Create a new user account"
        size="lg"
      >
        <MobileModal.Content>
          <MobileForm onSubmit={handleFormSubmit}>
            <MobileForm.Section
              title="Personal Information"
              description="Basic user details"
            >
              <MobileForm.Group>
                <MobileForm.Field label="First Name" required>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="John"
                  />
                </MobileForm.Field>

                <MobileForm.Field label="Last Name" required>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Doe"
                  />
                </MobileForm.Field>
              </MobileForm.Group>

              <MobileForm.Field
                label="Email"
                description="Primary email address"
                required
              >
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </MobileForm.Field>

              <MobileForm.Field label="Phone Number">
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </MobileForm.Field>
            </MobileForm.Section>
          </MobileForm>
        </MobileModal.Content>

        <MobileModal.Actions>
          <Button type="button" variant="outline" onClick={() => setFormModalOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleFormSubmit}>
            Create User
          </Button>
        </MobileModal.Actions>
      </MobileModal>

      {/* Delete Confirmation Modal */}
      <MobileModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Deletion"
        description="This action cannot be undone"
        size="sm"
      >
        <MobileModal.Content>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this user? All associated data will be permanently removed.
          </p>
        </MobileModal.Content>

        <MobileModal.Actions>
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              console.log('User deleted')
              setDeleteModalOpen(false)
            }}
          >
            Delete
          </Button>
        </MobileModal.Actions>
      </MobileModal>
    </DashboardLayout>
  )
}
