"use client";

import { useMemo, useState } from "react";
import UploadSection from "@/components/UploadSection";

export type Stream = {
  endTime: Date;
  artistName: string;
  trackName: string;
  msPlayed: number;
};

const getMostPlayed = (streams: Stream[], numMostPlayed = 10) => {
  const trackPlaytime: Record<string, number> = {};
  const artistPlaytime: Record<string, number> = {};
  const trackCount: Record<string, number> = {};
  const artistCount: Record<string, number> = {};

  streams.forEach(({ trackName, artistName, msPlayed }) => {
    trackPlaytime[trackName] = (trackPlaytime[trackName] || 0) + msPlayed;
    artistPlaytime[artistName] = (artistPlaytime[artistName] || 0) + msPlayed;
    trackCount[trackName] = (trackCount[trackName] || 0) + 1;
    artistCount[artistName] = (artistCount[artistName] || 0) + 1;
  });

  const topTracksByTime = Object.entries(trackPlaytime)
    .sort((a, b) => b[1] - a[1])
    .slice(0, numMostPlayed)
    .map(([name, time]) => ({ name, time }));

  const topArtistsByTime = Object.entries(artistPlaytime)
    .sort((a, b) => b[1] - a[1])
    .slice(0, numMostPlayed)
    .map(([name, time]) => ({ name, time }));

  const topTracksByCount = Object.entries(trackCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, numMostPlayed)
    .map(([name, count]) => ({ name, count }));

  const topArtistsByCount = Object.entries(artistCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, numMostPlayed)
    .map(([name, count]) => ({ name, count }));

  return {
    topTracksByTime,
    topArtistsByTime,
    topTracksByCount,
    topArtistsByCount,
  };
};

export default function HomeContent() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const mostPlayed = useMemo(() => getMostPlayed(streams), [streams]);

  console.log("streams", streams);

  return (
    <div>
      <UploadSection onStreamsLoaded={setStreams} />

      {streams.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Most Played</h2>
          <div className="mt-4">
            <h3 className="text-lg font-semibold">
              Top {mostPlayed.topTracksByTime.length} Tracks By Time
            </h3>
            <ul>
              {mostPlayed.topTracksByTime.map((track, index) => (
                <li key={index}>
                  {track.name} - {(track.time / (1000 * 60 * 60)).toFixed(2)} hours
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold">
              Top {mostPlayed.topTracksByTime.length} Tracks By Count
            </h3>
            <ul>
              {mostPlayed.topTracksByCount.map((track, index) => (
                <li key={index}>
                  {track.name} - {track.count} plays
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold">
              Top {mostPlayed.topArtistsByTime.length} Artists By Time
            </h3>
            <ul>
              {mostPlayed.topArtistsByTime.map((artist, index) => (
                <li key={index}>
                  {artist.name} - {(artist.time / (1000 * 60 * 60)).toFixed(2)} hours
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold">
              Top {mostPlayed.topArtistsByCount.length} Artists By Count
            </h3>
            <ul>
              {mostPlayed.topArtistsByCount.map((artist, index) => (
                <li key={index}>
                  {artist.name} - {artist.count} plays
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
