"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Chip,
  getKeyValue,
  Input,
  Pagination,
  Select,
  SelectItem,
  SharedSelection,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
} from "@heroui/react";
import { FaSearch } from "react-icons/fa";

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

function calculateYearRange(songStreams: SongStream[]): number[] {
  const years = Array.from(
    new Set(songStreams.map(({ ts }) => new Date(ts).getFullYear())),
  ).sort();
  console.log("years", years);

  return years;
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
  const [pageNumber, setPageNumber] = useState(1);
  const [filterValue, setFilterValue] = useState("");
  const hasSearchFilter = Boolean(filterValue);
  const [filterColumn, setFilterColumn] = useState("");
  const [yearsFilter, setYearsFilter] = useState<number[]>([]);
  const hasYearsFilter = yearsFilter.length > 0;
  const pageSize = 10;

  const yearsRange = calculateYearRange(songStreams);
  const filteredByYearSongStreams = useMemo(() => {
    let filteredSongs = [...songStreams];

    if (hasYearsFilter) {
      filteredSongs = filteredSongs.filter((song) => {
        return yearsFilter.includes(new Date(song.ts).getFullYear());
      });
    }

    console.log("filteredByYearSongStreams", filteredSongs);

    return filteredSongs;
  }, [songStreams, yearsFilter]);

  const songRows = getSongRows(filteredByYearSongStreams);

  const filteredSongRows = useMemo(() => {
    let filteredSongs = [...songRows];

    if (hasSearchFilter) {
      filteredSongs = filteredSongs.filter((song) => {
        if (filterColumn === "name" || !filterColumn) {
          return song.name.toLowerCase().includes(filterValue.toLowerCase());
        } else if (filterColumn === "album") {
          return song.album.toLowerCase().includes(filterValue.toLowerCase());
        } else if (filterColumn === "artist") {
          return song.artist.toLowerCase().includes(filterValue.toLowerCase());
        }
      });
    }

    return filteredSongs;
  }, [songRows, filterValue]);

  const numPages = Math.ceil(songRows.length / pageSize);
  const filteredSongRowsPage = useMemo(() => {
    const start = (pageNumber - 1) * pageSize;
    const end = start + pageSize;

    return filteredSongRows.slice(start, end);
  }, [pageNumber, filteredSongRows]);

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

  const filterableColumns = [
    { key: "name", label: "Name" },
    { key: "album", label: "Album" },
    { key: "artist", label: "Artist" },
  ];

  const mostPlayedSongsColumns = [
    { key: "name", label: "Name" },
    { key: "album", label: "Album" },
    { key: "artist", label: "Artist" },
    { key: "time", label: "Play Time (hours)" },
    { key: "count", label: "Play Count" },
  ];

  const mostPlayedSongsRows = filteredSongRowsPage.map((track, index) => ({
    key: index,
    name: track.name,
    album: track.album,
    artist: track.artist,
    time: track.time,
    count: track.count,
  }));

  const onClear = useCallback(() => {
    setFilterValue("");
    setPageNumber(1);
  }, []);

  const onSearchChange = useCallback((value: string) => {
    if (value) {
      setFilterValue(value);
      setPageNumber(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onFilterColumnSelectionChange = useCallback((keys: SharedSelection) => {
    const value = keys.currentKey;

    if (value) {
      setFilterColumn(value);
      setPageNumber(1);
    } else {
      setFilterColumn("name");
    }
  }, []);

  const onFilterYearSelectionChange = useCallback((keys: SharedSelection) => {
    const values = Array.from(keys).map(Number);

    if (values.length > 0) {
      setYearsFilter(values);
      setPageNumber(1);
    } else {
      setYearsFilter([]);
    }
  }, []);

  return (
    <div className="font-mono">
      <p className="flex flex-row justify-center text-4xl">
        Spotify Streaming History Viewer
      </p>
      <div className="flex flex-row">
        <UploadSection onStreamsLoaded={onStreamsLoaded} />
        <div className="p-2 flex space-x-2 items-center">
          <Chip color={fileCount > 0 ? "success" : "default"}>
            {fileCount} file{fileCount === 1 ? "" : "s"}
          </Chip>
          <Chip color={songRows.length > 0 ? "success" : "default"}>
            {songRows.length} song{songRows.length === 1 ? "" : "s"}
          </Chip>
          <Chip color={episodeStreams.length > 0 ? "success" : "default"}>
            {episodeStreams.length} episode{episodeStreams.length === 1 ? "" : "s"}
          </Chip>
          <Chip color={yearsRange.length > 0 ? "success" : "default"}>
            {yearsRange.length} year{yearsRange.length === 1 ? "" : "s"}
          </Chip>
          <Chip color={songStreams.length > 0 ? "success" : "default"}>
            {songStreams.length} stream{songStreams.length === 1 ? "" : "s"}
          </Chip>
        </div>
      </div>
      <div className="mt-6">
        <Tabs aria-label="Options">
          <Tab key="songs" title="Songs">
            <div className="flex flex-row flex-grow space-y-2 mb-2 items-center">
              <Select
                className="w-1/5"
                label="Filter Years"
                selectionMode="multiple"
                size="md"
                onSelectionChange={onFilterYearSelectionChange}
              >
                {yearsRange.map((year) => (
                  <SelectItem key={year}>{year.toString()}</SelectItem>
                ))}
              </Select>
              <Select
                className="w-1/5"
                defaultSelectedKeys={["name"]}
                label="Filter Column"
                size="md"
                onSelectionChange={onFilterColumnSelectionChange}
              >
                {filterableColumns.map((column) => (
                  <SelectItem key={column.key}>{column.label}</SelectItem>
                ))}
              </Select>
              <Input
                isClearable
                className="w-4/5"
                placeholder="Filter..."
                startContent={<FaSearch />}
                value={filterValue}
                onClear={() => onClear()}
                onValueChange={onSearchChange}
              />
            </div>
            <Table
              aria-label="Most Played Songs"
              bottomContent={
                <div className="flex w-full justify-center">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="secondary"
                    page={pageNumber}
                    total={numPages}
                    onChange={(page) => setPageNumber(page)}
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
          <Tab key="episodes" title="Episodes">
            Coming soon!
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
