"use client";

import { useMemo, useState } from "react";
import {
  Chip,
  getKeyValue,
  Pagination,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
} from "@heroui/react";

import UploadSection from "@/components/UploadSection";
import { EpisodeStream, ExtendedStream, SongStream } from "@/types";

type SongRow = {
  name: string;
  album: string;
  artist: string;
  time: number;
  count: number;
};
function getSongRows(songStreams: SongStream[]): SongRow[] {
  const rowMap: Record<string, SongRow> = {};

  songStreams.forEach(
    ({
      master_metadata_track_name: name,
      master_metadata_album_album_name: album,
      master_metadata_album_artist_name: artist,
      ms_played,
    }) => {
      rowMap[name] = rowMap[name] || {
        name,
        album,
        artist,
        time: 0,
        count: 0,
      };
      rowMap[name].time += ms_played / 1000 / 60 / 60;
      rowMap[name].count += 1;
    },
  );

  const rows = Object.values(rowMap)
    .map((row) => ({
      ...row,
      time: Math.round(row.time * 100) / 100,
    }))
    .sort((a, b) => b.count - a.count);

  return rows;
}

function isSongStream(stream: ExtendedStream): stream is ExtendedStream & SongStream {
  return (
    typeof stream.master_metadata_track_name === "string" &&
    typeof stream.master_metadata_album_artist_name === "string" &&
    typeof stream.master_metadata_album_album_name === "string"
  );
}

function isEpisodeStream(
  stream: ExtendedStream,
): stream is ExtendedStream & EpisodeStream {
  return (
    typeof stream.episode_name === "string" &&
    typeof stream.episode_show_name === "string"
  );
}

export default function HomeContent() {
  const [fileCount, setFileCount] = useState(0);
  const [songStreams, setSongStreams] = useState<SongStream[]>([]);
  const [episodeStreams, setEpisodeStreams] = useState<EpisodeStream[]>([]);

  const songRows = getSongRows(songStreams);

  const [page, setPage] = useState(1);
  const pageSize = 20;
  const pages = Math.ceil(songRows.length / pageSize);
  const songRowsPage = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return songRows.slice(start, end);
  }, [page, songRows]);

  const onStreamsLoaded = (fileCount: number, streams: ExtendedStream[]) => {
    setFileCount(fileCount);

    const songStreams: SongStream[] = [];
    const episodeStreams: EpisodeStream[] = [];

    streams.forEach((stream) => {
      if (isSongStream(stream)) {
        songStreams.push({
          ts: stream.ts,
          platform: stream.platform,
          ms_played: stream.ms_played,
          master_metadata_track_name: stream.master_metadata_track_name,
          master_metadata_album_artist_name: stream.master_metadata_album_artist_name,
          master_metadata_album_album_name: stream.master_metadata_album_album_name,
        });
      } else if (isEpisodeStream(stream)) {
        episodeStreams.push({
          ts: stream.ts,
          platform: stream.platform,
          ms_played: stream.ms_played,
          episode_name: stream.episode_name,
          episode_show_name: stream.episode_show_name,
        });
      }
    });
    setSongStreams(songStreams);
    setEpisodeStreams(episodeStreams);
  };

  const mostPlayedSongsColumns = [
    { key: "name", label: "Name" },
    { key: "album", label: "Album" },
    { key: "artist", label: "Artist" },
    { key: "time", label: "Play Time (hours)" },
    { key: "count", label: "Play Count" },
  ];

  const mostPlayedSongsRows = songRowsPage.map((track, index) => ({
    key: index,
    name: track.name,
    album: track.album,
    artist: track.artist,
    time: track.time,
    count: track.count,
  }));

  return (
    <div>
      <div className="flex flex-row">
        <UploadSection onStreamsLoaded={onStreamsLoaded} />
        <div className="p-2 flex space-x-2 items-center">
          <Chip color={fileCount > 0 ? "success" : "default"}>
            {fileCount} file{fileCount === 1 ? "" : "s"} uploaded
          </Chip>
          <Chip color={songRows.length > 0 ? "success" : "default"}>
            {songRows.length} song{songRows.length === 1 ? "" : "s"}
          </Chip>
          <Chip color={episodeStreams.length > 0 ? "success" : "default"}>
            {episodeStreams.length} episode{episodeStreams.length === 1 ? "" : "s"}
          </Chip>
          <Chip color={songStreams.length > 0 ? "success" : "default"}>
            {songStreams.length} stream{songStreams.length === 1 ? "" : "s"}
          </Chip>
        </div>
      </div>
      <div className="mt-6">
        <Tabs aria-label="Options">
          <Tab key="songs" title="Songs">
            <Table
              aria-label="Most Played Songs"
              bottomContent={
                <div className="flex w-full justify-center">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="secondary"
                    page={page}
                    total={pages}
                    onChange={(page) => setPage(page)}
                  />
                </div>
              }
              classNames={{
                wrapper: "min-h-[222px]",
              }}
            >
              <TableHeader columns={mostPlayedSongsColumns}>
                {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
              </TableHeader>
              <TableBody emptyContent={"No data"} items={mostPlayedSongsRows}>
                {(item) => (
                  <TableRow key={item.key}>
                    {(columnKey) => (
                      <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Tab>
          <Tab key="artists" title="Artists">
            Coming soon!
          </Tab>
          <Tab key="episodes" title="Episodes">
            Coming soon!
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
