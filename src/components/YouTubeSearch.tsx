import React, { useState } from 'react';
import { useAppStore, type Track } from '@/store/appStore';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, Music, Clock, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from './ui/card';

const YouTubeSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const { setCurrentTrack } = useAppStore();
  const [open, setOpen] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      // Using local backend with yt-search
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      setResults(data.items);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectTrack = (track: Track) => {
    setCurrentTrack(track);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Search className="w-4 h-4" />
          Search YT
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Search YouTube Music</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 p-1">
          <Input 
            placeholder="Search for songs, artists..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? '...' : <Search className="w-4 h-4" />}
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto mt-4 space-y-2 pr-2">
          {results.map((track) => (
            <Card 
              key={track.videoId} 
              className="cursor-pointer hover:bg-accent transition-colors overflow-hidden"
              onClick={() => selectTrack(track)}
            >
              <CardContent className="p-3 flex gap-4 items-center">
                <img src={track.thumbnail} alt={track.title} className="w-24 h-16 object-cover rounded-md flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{track.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {track.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {track.timestamp}
                    </span>
                  </div>
                </div>
                <Music className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
          {results.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground italic text-sm">
              Search results will appear here...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default YouTubeSearch;
