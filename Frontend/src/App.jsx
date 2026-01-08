import React, { useEffect, useState } from 'react'
import axios from 'axios'
import MatchCard from './components/MatchCard'
import { Volleyball , Trophy, Calendar, RefreshCw } from 'lucide-react'

const TABS = [
  { 
    key: 'live', 
    label: 'Live Matches', 
    endpoint: '/api/live',
    icon: Volleyball ,
    color: 'from-red-500 to-orange-500'
  },
  { 
    key: 'upcoming', 
    label: 'Upcoming', 
    endpoint: '/api/upcoming',
    icon: Calendar,
    color: 'from-blue-500 to-cyan-500'
  },
  { 
    key: 'recent', 
    label: 'Recent', 
    endpoint: '/api/recent',
    icon: Trophy,
    color: 'from-emerald-500 to-green-500'
  },
]

const BASE_URL = import.meta.env.VITE_API_URL

const App = () => {
  const [activeTab, setActiveTab] = useState('live')
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState([])
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)

  const fetchMatches = async (tabKey) => {
    const tab = TABS.find(t => t.key === tabKey)
    if (!tab) return
    
    setLoading(true)
    setError(null)
    
    try {
      const res = await axios.get(`${BASE_URL}${tab.endpoint}`)
      
      // Handle different API response structures
      let matchData = [];
      if (res.data?.typeMatches) {
        // For the provided data structure
        matchData = res.data.typeMatches.flatMap(typeMatch => 
          typeMatch.seriesMatches?.flatMap(seriesMatch => 
            seriesMatch.seriesAdWrapper?.matches || []
          ) || []
        )
      } else if (res.data?.matches) {
        matchData = res.data.matches
      } else if (Array.isArray(res.data)) {
        matchData = res.data
      } else {
        matchData = [res.data].filter(Boolean)
      }
      
      setMatches(matchData)
      setLastUpdated(new Date())
      
    } catch (err) {
      console.error('Error fetching matches:', err)
      setError('Failed to load matches. Please try again.')
      setMatches([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    fetchMatches(activeTab) 
  }, [activeTab])

  const handleRefresh = () => {
    fetchMatches(activeTab)
  }

  const activeTabInfo = TABS.find(t => t.key === activeTab)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Volleyball  className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  CricLive
                </h1>
                <p className="text-xs text-slate-500">Real-time Cricket Scores</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-6">
              <nav className="hidden md:flex items-center space-x-1">
                {TABS.map(tab => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.key
                  
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`relative px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
                        isActive 
                          ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform -translate-y-0.5` 
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="font-medium">{tab.label}</span>
                      {isActive && (
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-current"></div>
                      )}
                    </button>
                  )
                })}
              </nav>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <select 
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TABS.map(tab => (
                    <option key={tab.key} value={tab.key}>
                      {tab.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 rounded-full bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow"
              >
                <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div>
                <div className="text-xs text-slate-500">Active Tab</div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${activeTabInfo.color}`}></div>
                  <span className="font-semibold text-slate-900">{activeTabInfo.label}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Matches Found</div>
                <div className="font-semibold text-slate-900">{matches.length}</div>
              </div>
            </div>
            
            {lastUpdated && (
              <div className="text-xs text-slate-500">
                Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
              <Volleyball  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-500 animate-pulse" />
            </div>
            <div className="text-lg font-medium text-slate-700">Loading matches...</div>
            <p className="text-sm text-slate-500">Fetching the latest cricket scores</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="max-w-md mx-auto py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
              <div className="text-red-500">⚠️</div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to Load</h3>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Success State */}
        {!loading && !error && matches.length > 0 && (
          <>
            {/* Tab Content Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{activeTabInfo.label}</h2>
                  <p className="text-slate-600">
                    {activeTab === 'live' && 'Matches currently in progress'}
                    {activeTab === 'upcoming' && 'Scheduled matches'}
                    {activeTab === 'recent' && 'Recently completed matches'}
                  </p>
                </div>
                <div className="text-sm px-3 py-1.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-600">Showing </span>
                  <span className="font-semibold text-slate-900">{matches.length}</span>
                  <span className="text-slate-600"> matches</span>
                </div>
              </div>

              {/* Grid Layout */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {matches.map((match, idx) => (
                  <MatchCard key={match.matchInfo?.matchId || idx} match={match} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && !error && matches.length === 0 && (
          <div className="max-w-md mx-auto py-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 mb-6">
              <Volleyball  className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">No Matches Available</h3>
            <p className="text-slate-600 mb-8">
              {activeTab === 'live' && 'There are no live matches at the moment.'}
              {activeTab === 'upcoming' && 'No upcoming matches scheduled.'}
              {activeTab === 'recent' && 'No recent matches available.'}
            </p>
            <div className="space-x-4">
              <button
                onClick={handleRefresh}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
              >
                Refresh
              </button>
              <button
                onClick={() => setActiveTab('live')}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all duration-200 font-medium"
              >
                View Live
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Volleyball  className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-slate-900">CricLive</span>
            </div>
            
            <div className="text-sm text-slate-500 text-center">
              <p>Real-time cricket scores powered by Cricbuzz API</p>
              <p className="mt-1">Data is updated automatically every 30 seconds</p>
            </div>
            
            <div className="text-xs text-slate-400">
              © {new Date().getFullYear()} CricLive • All rights reserved
            </div>
          </div>
        </div>
      </footer>

      {/* Background Decorations */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-gradient-to-br from-green-100 to-transparent rounded-full opacity-30 blur-3xl"></div>
      </div>
      {isPlayerOpen && (
        <PlayerStats playerId={"8733"} onClose={() => setIsPlayerOpen(false)} />
      )}
    </div>
  )
}

export default App

// Render PlayerStats modal at root-level so it overlays the app
// (kept outside export to avoid interfering with SSR)