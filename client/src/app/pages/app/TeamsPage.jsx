/**
 * TeamsPage
 * Main page for viewing and managing teams
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TeamList, CreateTeamModal } from '../../components/@system/Teams'

export function TeamsPage() {
  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)

  function handleTeamSelect(team) {
    navigate(`/app/teams/${team.id}`)
  }

  function handleTeamCreated(team) {
    navigate(`/app/teams/${team.id}`)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Teams</h1>
        <p className="text-gray-600">
          Manage your teams and collaborate with others.
        </p>
      </div>

      <TeamList
        onTeamSelect={handleTeamSelect}
        onCreateTeam={() => setShowCreateModal(true)}
      />

      <CreateTeamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onTeamCreated={handleTeamCreated}
      />
    </div>
  )
}
