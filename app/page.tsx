'use client'

import React, { useState, createContext, useContext, useEffect } from 'react';
import { Home as HomeIcon, Search, Settings } from 'lucide-react';
import HomePage from '@/components/HomePage';
import SearchPage from '@/components/SearchPage';
import SettingsPage from '@/components/SettingsPage';
import PlaylistsPage from '@/components/PlaylistsPage';
import LikedSongsPage from '@/components/LikedSongsPage';
import MinimizedPlayer from '@/components/MinimizedPlayer';
import MaximizedPlayer from '@/components/MaximizedPlayer';
import CreatePlaylistModal from '@/components/CreatePlaylistModal';
import AddToPlaylistModal from '@/components/AddToPlaylistModal';
import AuthWrapper from '@/components/AuthWrapper';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Song } from '@/types';
import { useTheme } from '@/components/ThemeContext';


function MusicPlayerContent() {
  const { user } = useAuth();
  const {
    songs,
    playlists,
    likedSongs,
    lastPlayedSong,
    loading,
    toggleLike,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    recordListeningHistory,
    stopCurrentSongTracking
  } = useSupabaseData(user);

  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'settings'>('home');
  const [currentPage, setCurrentPage] = useState<'main' | 'playlists' | 'liked'>('main');
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerMaximized, setIsPlayerMaximized] = useState(false);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
  const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState<Song | null>(null);
  const [hasSetLastPlayedSong, setHasSetLastPlayedSong] = useState(false);
  const [lastPlayedSongDismissed, setLastPlayedSongDismissed] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  // Set last played song as current song when data loads (only once and if not dismissed)
  useEffect(() => {
    if (lastPlayedSong && !currentSong && !hasSetLastPlayedSong && !lastPlayedSongDismissed) {
      setCurrentSong(lastPlayedSong);
      setIsPlaying(false); // Start paused
      setHasSetLastPlayedSong(true);
    }
  }, [lastPlayedSong, currentSong, hasSetLastPlayedSong, lastPlayedSongDismissed]);

  

  const handleSongPlay = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setLastPlayedSongDismissed(false); // Reset dismissal when user actively plays a song
    // Record listening history and update last song
    recordListeningHistory(song.id);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const togglePlayerSize = () => {
    setIsPlayerMaximized(!isPlayerMaximized);
  };

  const closePlayer = async () => {
    // Stop tracking current song before closing
    await stopCurrentSongTracking();
    setCurrentSong(null);
    setIsPlaying(false);
    setIsPlayerMaximized(false);
    
    // Mark last played song as dismissed so it won't auto-load again
    setLastPlayedSongDismissed(true);
  };

  const handleToggleLike = (songId: string) => {
    toggleLike(songId);
    
    // Update current song state if it's the one being liked/unliked
    if (currentSong && currentSong.id === songId) {
      setCurrentSong(prev => prev ? { ...prev, isLiked: !prev.isLiked } : null);
    }
  };

  const handlePrevious = () => {
    if (currentSong) {
      const currentIndex = songs.findIndex(song => song.id === currentSong.id);
      const previousIndex = currentIndex > 0 ? currentIndex - 1 : songs.length - 1;
      const newSong = songs[previousIndex];
      setCurrentSong(newSong);
      recordListeningHistory(newSong.id);
    }
  };

  const handleNext = () => {
    if (currentSong) {
      const currentIndex = songs.findIndex(song => song.id === currentSong.id);
      const nextIndex = currentIndex < songs.length - 1 ? currentIndex + 1 : 0;
      const newSong = songs[nextIndex];
      setCurrentSong(newSong);
      recordListeningHistory(newSong.id);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleAddToPlaylist = (song: Song) => {
    setSelectedSongForPlaylist(song);
    setShowAddToPlaylistModal(true);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading your music...</p>
          </div>
        </div>
      );
    }

    if (currentPage === 'playlists') {
      return (
        <PlaylistsPage 
          playlists={playlists} 
          onBack={() => setCurrentPage('main')} 
          onSongPlay={handleSongPlay}
          onCreatePlaylist={() => setShowCreatePlaylistModal(true)}
          onDeletePlaylist={deletePlaylist}
          onRenamePlaylist={renamePlaylist}
          onRemoveSongFromPlaylist={removeSongFromPlaylist}
        />
      );
    }
    
    if (currentPage === 'liked') {
      return <LikedSongsPage songs={likedSongs} onBack={() => setCurrentPage('main')} onSongPlay={handleSongPlay} />;
    }

    switch (activeTab) {
      case 'home':
        return <HomePage songs={songs} onSongPlay={handleSongPlay} formatNumber={formatNumber} onAddToPlaylist={handleAddToPlaylist} />;
      case 'search':
        return <SearchPage songs={songs} onSongPlay={handleSongPlay} formatNumber={formatNumber} onAddToPlaylist={handleAddToPlaylist} />;
      case 'settings':
        return <SettingsPage onPlaylistsClick={() => setCurrentPage('playlists')} onLikedClick={() => setCurrentPage('liked')} />;
      default:
        return <HomePage songs={songs} onSongPlay={handleSongPlay} formatNumber={formatNumber} onAddToPlaylist={handleAddToPlaylist} />;
    }
  };

  const themeClasses = isDarkMode 
    ? 'bg-gray-900 text-white' 
    : 'bg-gray-50 text-gray-900';

  return (
    
      <div className={`min-h-screen ${themeClasses} relative overflow-hidden`}>
        {/* Main Content */}
        <div className={`transition-all duration-300 ${currentSong ? 'pb-36' : 'pb-20'}`}>
          {renderContent()}
        </div>

        {/* Bottom Navigation */}
        {currentPage === 'main' && (
          <div className={`fixed bottom-0 left-0 right-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t z-30`}>
            <div className="flex items-center justify-around py-3">
              <button
                onClick={() => setActiveTab('home')}
                className={`flex flex-col items-center space-y-1 p-2 transition-colors ${
                  activeTab === 'home' ? 'text-purple-400' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                <HomeIcon size={24} />
                <span className="text-xs">Home</span>
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`flex flex-col items-center space-y-1 p-2 transition-colors ${
                  activeTab === 'search' ? 'text-purple-400' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                <Search size={24} />
                <span className="text-xs">Search</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex flex-col items-center space-y-1 p-2 transition-colors ${
                  activeTab === 'settings' ? 'text-purple-400' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                <Settings size={24} />
                <span className="text-xs">Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* Music Player - Only show if currentSong exists */}
        {currentSong && (
          <>
            {!isPlayerMaximized ? (
              <MinimizedPlayer
                song={currentSong}
                isPlaying={isPlaying}
                onTogglePlay={togglePlay}
                onMaximize={togglePlayerSize}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onClose={closePlayer}
                onToggleLike={() => handleToggleLike(currentSong.id)}
                formatNumber={formatNumber}
              />
            ) : (
              <MaximizedPlayer
                song={currentSong}
                isPlaying={isPlaying}
                onTogglePlay={togglePlay}
                onMinimize={togglePlayerSize}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onToggleLike={() => handleToggleLike(currentSong.id)}
                formatNumber={formatNumber}
                onAddToPlaylist={() => handleAddToPlaylist(currentSong)}
              />
            )}
          </>
        )}

        {/* Modals */}
        <CreatePlaylistModal
          isOpen={showCreatePlaylistModal}
          onClose={() => setShowCreatePlaylistModal(false)}
          onCreatePlaylist={createPlaylist}
        />

        <AddToPlaylistModal
          isOpen={showAddToPlaylistModal}
          onClose={() => {
            setShowAddToPlaylistModal(false);
            setSelectedSongForPlaylist(null);
          }}
          song={selectedSongForPlaylist}
          playlists={playlists}
          onAddToPlaylist={addSongToPlaylist}
          onCreatePlaylist={() => {
            setShowAddToPlaylistModal(false);
            setShowCreatePlaylistModal(true);
          }}
        />
      </div>
  );
}

export default function MusicPlayerApp() {
  return (
    <AuthWrapper>
      <MusicPlayerContent />
    </AuthWrapper>
  );
}