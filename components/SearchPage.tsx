import React, { useState } from 'react';
import { Search, Music, Plus } from 'lucide-react';
import { Song } from '@/types';
import { useTheme } from '@/components/ThemeContext';
import SongCard from './SongCard';

interface SearchPageProps {
  songs: Song[];
  onSongPlay: (song: Song) => void;
  formatNumber: (num: number) => string;
  onAddToPlaylist: (song: Song) => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ songs, onSongPlay, formatNumber, onAddToPlaylist }) => {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(10);

  const filteredSongs = songs.filter(song =>
    song.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const displayedSongs = filteredSongs.slice(0, displayCount);
  const hasMoreSongs = displayCount < filteredSongs.length;

  const loadMore = () => {
    setDisplayCount(prev => prev + 10);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`sticky top-0 ${isDarkMode ? 'bg-gray-900/95' : 'bg-gray-50/95'} backdrop-blur-md z-10 px-4 py-4`}>
        <h1 className="text-2xl font-bold mb-4">Search</h1>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
          <input
            type="text"
            placeholder="What do you want to listen to?"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setDisplayCount(10); // Reset display count when searching
            }}
            className={`w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-full py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        {searchQuery === '' ? (
          <>
            {/* Browse Categories */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Browse all</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Pop', color: 'from-pink-500 to-purple-500' },
                  { name: 'Rock', color: 'from-red-500 to-orange-500' },
                  { name: 'Hip-Hop', color: 'from-yellow-500 to-green-500' },
                  { name: 'Electronic', color: 'from-blue-500 to-indigo-500' },
                  { name: 'Jazz', color: 'from-purple-500 to-pink-500' },
                  { name: 'Classical', color: 'from-gray-500 to-gray-700' }
                ].map((category, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(category.name)}
                    className={`relative p-4 rounded-lg bg-gradient-to-br ${category.color} h-24 overflow-hidden transition-transform hover:scale-105`}
                  >
                    <h3 className="font-semibold text-white">{category.name}</h3>
                    <Music className="absolute bottom-2 right-2 text-white/50" size={32} />
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Search Results */}
            <div>
              <h2 className="text-lg font-semibold mb-4">
                {filteredSongs.length > 0 ? `Found ${filteredSongs.length} results` : 'No results found'}
              </h2>
              <div className="space-y-3">
                {displayedSongs.map((song) => (
                  <SongCard 
                    key={song.id} 
                    song={song} 
                    onPlay={onSongPlay} 
                    formatNumber={formatNumber}
                    onAddToPlaylist={onAddToPlaylist}
                  />
                ))}
              </div>
              
              {/* Load More Button for Search Results */}
              {hasMoreSongs && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={loadMore}
                    className={`flex items-center space-x-2 px-6 py-3 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' : 'bg-white hover:bg-gray-50 border-gray-200'} border rounded-full transition-colors`}
                  >
                    <Plus size={18} className="text-purple-400" />
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Load More</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;