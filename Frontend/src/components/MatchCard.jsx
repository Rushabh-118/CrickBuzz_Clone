import React, { useState } from 'react';

const TeamLogo = ({ name, src, size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl'
  };

  // Fix for image URL - Use correct Cricbuzz CDN format
  const getImageUrl = (imageId) => {
    if (!imageId) return null;
    return `https://www.cricbuzz.com/a/img/v1/75x75/i1/c${imageId}/team-logos.jpg`;
  };

  const imageUrl = src ? getImageUrl(src) : null;

  return imageUrl ? (
    <img 
      src={imageUrl} 
      alt={name} 
      className={`${sizes[size]} rounded-full object-cover border border-gray-200`}
      onError={(e) => {
        try {
          e.target.style.display = 'none';
          const ns = e.target.nextSibling;
          if (ns && ns.style) ns.style.display = 'flex';
        } catch (err) {
          // ignore
        }
      }}
    />
  ) : (
    <div className={`${sizes[size]} rounded-full bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-700 border border-gray-300`}>
      {(name || 'T').slice(0, 2).toUpperCase()}
    </div>
  );
};

const InningsScore = ({ innings, title, isBatting = false }) => {
  if (!innings) return null;
  
  return (
    <div className={`p-3 rounded-lg ${isBatting ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'}`}>
      {title && <div className="text-xs font-semibold text-gray-700 mb-2">{title}</div>}
      {Object.entries(innings).map(([key, inn]) => (
        <div key={key} className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="font-bold text-gray-900">{inn.runs}</span>
              <span className="text-gray-600">/{inn.wickets}</span>
              <span className="text-gray-500 text-xs ml-2">({inn.overs} ov)</span>
            </div>
            {isBatting && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
                ● LIVE
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const MatchStatusBadge = ({ status, state }) => {
  const getStatusColor = () => {
    if (state === 'Complete') return 'bg-green-100 text-green-800 border-green-200';
    if (state === 'In Progress') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (state === 'Upcoming') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor()}`}>
      {status}
    </span>
  );
};

const ExpandedMatchModal = ({ match, onClose }) => {
  if (!match) return null;

  const { matchInfo, matchScore } = match;
  const { team1, team2, venueInfo, seriesName, matchDesc, matchFormat, state, status, startDate, endDate } = matchInfo;
  
  const team1Score = matchScore?.team1Score;
  const team2Score = matchScore?.team2Score;
  
  const currentBattingTeam = matchInfo.currBatTeamId === team1.teamId ? team1 : 
                           matchInfo.currBatTeamId === team2.teamId ? team2 : null;

  const formatDate = (timestamp) => {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Match Details</h2>
            <p className="text-sm text-gray-600">{seriesName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Match Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center space-x-8 mb-4">
              <div className="text-center">
                <TeamLogo name={team1.teamSName} src={team1.imageId} size="xl" />
                <div className="mt-3 font-bold text-lg">{team1.teamName}</div>
                <div className="text-sm text-gray-600">{team1.teamSName}</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-500">VS</div>
                <div className="mt-2 px-4 py-1 bg-gray-100 rounded-full text-sm font-semibold">
                  {matchFormat}
                </div>
              </div>
              
              <div className="text-center">
                <TeamLogo name={team2.teamSName} src={team2.imageId} size="xl" />
                <div className="mt-3 font-bold text-lg">{team2.teamName}</div>
                <div className="text-sm text-gray-600">{team2.teamSName}</div>
              </div>
            </div>
            
            <div className="text-2xl font-bold text-gray-900 mb-2">{matchDesc}</div>
            <MatchStatusBadge status={status} state={state} />
          </div>

          {/* Score Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-linear-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200">
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <TeamLogo name={team1.teamSName} src={team1.imageId} size="sm" />
                <span className="ml-3">{team1.teamName}</span>
                {currentBattingTeam?.teamId === team1.teamId && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
                    ● BATTING
                  </span>
                )}
              </h3>
              {team1Score ? (
                <InningsScore 
                  innings={team1Score} 
                  isBatting={currentBattingTeam?.teamId === team1.teamId}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Yet to bat
                </div>
              )}
            </div>
            
            <div className="bg-linear-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200">
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <TeamLogo name={team2.teamSName} src={team2.imageId} size="sm" />
                <span className="ml-3">{team2.teamName}</span>
                {currentBattingTeam?.teamId === team2.teamId && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
                    ● BATTING
                  </span>
                )}
              </h3>
              {team2Score ? (
                <InningsScore 
                  innings={team2Score} 
                  isBatting={currentBattingTeam?.teamId === team2.teamId}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Yet to bat
                </div>
              )}
            </div>
          </div>

          {/* Match Details */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-4">Match Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Venue</div>
                  <div className="font-medium">
                    {venueInfo.ground}, {venueInfo.city}
                  </div>
                  {venueInfo.timezone && (
                    <div className="text-xs text-gray-500">
                      Timezone: {venueInfo.timezone}
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="text-sm text-gray-600">Match Date & Time</div>
                  <div className="font-medium">{formatDate(startDate)}</div>
                  <div className="text-sm text-gray-600">
                    {formatTime(startDate)} - {formatTime(endDate)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Series</div>
                  <div className="font-medium">{seriesName}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600">Match Status</div>
                  <div className="font-medium">{state}</div>
                  <div className="text-sm text-gray-600">{status}</div>
                </div>
                
                {matchInfo.currBatTeamId && (
                  <div>
                    <div className="text-sm text-gray-600">Currently Batting</div>
                    <div className="font-medium">
                      {currentBattingTeam?.teamName || 'Not started'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Match ID: {matchInfo.matchId}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MatchCard = ({ match }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { matchInfo, matchScore } = match;
  const { team1, team2, venueInfo, seriesName, matchDesc, matchFormat, state, status } = matchInfo;

  const team1Score = matchScore?.team1Score;
  const team2Score = matchScore?.team2Score;

  // Determine which team is batting currently
  const currentBattingTeam = matchInfo.currBatTeamId === team1.teamId ? team1 : 
                           matchInfo.currBatTeamId === team2.teamId ? team2 : null;

  // Format match time
  const startDate = new Date(parseInt(matchInfo.startDate));
  const timeString = startDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });

  const dateString = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  return (
    <>
      {/* Match Card */}
      <div 
        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer transform hover:-translate-y-1"
        onClick={() => setIsModalOpen(true)}
      >
        {/* Series Header */}
        <div className="px-4 py-3 bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              <span className="text-xs font-semibold text-gray-700 truncate">{seriesName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md font-medium">
                {matchFormat}
              </span>
              <span className="text-xs text-gray-500">
                {dateString} • {timeString}
              </span>
            </div>
          </div>
          <div className="mt-1 text-xs text-gray-600 truncate">{matchDesc}</div>
        </div>

        {/* Match Content */}
        <div className="p-4">
          {/* Teams and Scores */}
          <div className="space-y-3">
            {/* Team 1 */}
            <div className="flex items-center justify-between group">
              <div className="flex items-center space-x-3 flex-1">
                <TeamLogo name={team1.teamSName} src={team1.imageId} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {team1.teamName}
                    </span>
                    {currentBattingTeam?.teamId === team1.teamId && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                        ● LIVE
                      </span>
                    )}
                  </div>
                  <div className="mt-1">
                    {team1Score ? (
                      <div className="text-xs">
                        <span className="font-semibold">{Object.values(team1Score)[0]?.runs}</span>
                        <span className="text-gray-600">/{Object.values(team1Score)[0]?.wickets}</span>
                        <span className="text-gray-500 text-xs ml-1">({Object.values(team1Score)[0]?.overs} ov)</span>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">Yet to bat</div>
                    )}
                  </div>
                </div>
              </div>
              {team1Score && (
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {Object.values(team1Score)[0]?.runs || 0}
                    <span className="text-sm font-normal text-gray-600">/{Object.values(team1Score)[0]?.wickets || 0}</span>
                  </div>
                </div>
              )}
            </div>

            {/* VS Separator */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-white text-xs font-semibold text-gray-500">VS</span>
              </div>
            </div>

            {/* Team 2 */}
            <div className="flex items-center justify-between group">
              <div className="flex items-center space-x-3 flex-1">
                <TeamLogo name={team2.teamSName} src={team2.imageId} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {team2.teamName}
                    </span>
                    {currentBattingTeam?.teamId === team2.teamId && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                        ● LIVE
                      </span>
                    )}
                  </div>
                  <div className="mt-1">
                    {team2Score ? (
                      <div className="text-xs">
                        <span className="font-semibold">{Object.values(team2Score)[0]?.runs}</span>
                        <span className="text-gray-600">/{Object.values(team2Score)[0]?.wickets}</span>
                        <span className="text-gray-500 text-xs ml-1">({Object.values(team2Score)[0]?.overs} ov)</span>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">Yet to bat</div>
                    )}
                  </div>
                </div>
              </div>
              {team2Score && (
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {Object.values(team2Score)[0]?.runs || 0}
                    <span className="text-sm font-normal text-gray-600">/{Object.values(team2Score)[0]?.wickets || 0}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Match Footer */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex-1">
                <div className="text-xs text-gray-600 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {venueInfo.ground}, {venueInfo.city}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <MatchStatusBadge status={status} state={state} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Match Modal */}
      {isModalOpen && (
        <ExpandedMatchModal 
          match={match} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
};

export default MatchCard;