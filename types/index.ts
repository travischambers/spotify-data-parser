export type Stream = {
  endTime: Date;
  artistName: string;
  trackName: string;
  msPlayed: number;
};

export type ExtendedStream = {
  ts: Date; // "YYYY-MM-DD 13:30:30",
  username: string;
  platform: string;
  ms_played: number;
  conn_country: string;
  ip_addr_decrypted: string;
  user_agent_decrypted: string;
  master_metadata_track_name?: string;
  master_metadata_album_artist_name?: string;
  master_metadata_album_album_name?: string;
  spotify_track_uri?: string;
  episode_name?: string;
  episode_show_name?: string;
  spotify_episode_uri?: string;
  reason_start: string;
  reason_end: string;
  shuffle?: boolean; // null/true/false,
  skipped?: boolean; // null/true/false,
  offline?: boolean; // null/true/false,
  offline_timestamp: string;
  incognito_mode?: boolean; // null/true/false,
};

export type SongStream = {
  ts: Date;
  platform: string;
  ms_played: number;
  master_metadata_track_name: string;
  master_metadata_album_artist_name: string;
  master_metadata_album_album_name: string;
}

export type EpisodeStream = {
  ts: Date;
  platform: string;
  ms_played: number;
  episode_name: string;
  episode_show_name: string;
}