export type SpotifyTrack = {
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
  name: string;
  type: string;
  external_urls: { spotify: string };
};

export type SpotifyAlbum = {
  name: string;
  album_type: string;
  release_date: string;
  images: { url: string }[];
  tracks: {
    total: number;
    items: SpotifyTrack[];
  };
  artists: SpotifyArtist[];
  external_urls: { spotify: string };
};

export type SpotifyPlaylist = {
  name: string;
  description: string;
  owner: {
    id: string;
    display_name: string;
    external_urls: { spotify: string };
  };
  images: { url: string }[];
  external_urls: { spotify: string };
  tracks: {
    total: number;
    items: { track: SpotifyTrack; added_at: string }[];
  };
};

export type SpotifyArtist = {
  id: string;
  name: string;
  popularity?: number;
  followers?: { total: number };
  type?: string;
  images?: { url: string }[];
  external_urls: { spotify: string };
};

export type SpotifyUser = {
  display_name: string;
  images: { url: string }[];
  external_urls: { spotify: string };
};

export type SpotifyType = "track" | "playlist" | "album" | "artist";

export class AsukaSpotify {
  private token: string | undefined;
  private tokenExpires: number | undefined;
  private cache: Map<
    string,
    SpotifyTrack | SpotifyAlbum | SpotifyPlaylist | SpotifyArtist | SpotifyUser
  > = new Map();
  private cacheLimit = 100;

  spotifyIdFromUrl(url: string): string {
    const match = url.match(/\/(track|playlist|album|artist)\/(\w+)/);
    if (match) {
      return match[2];
    }
    return "";
  }

  spotifyUrlFromId(id: string, type: SpotifyType): string {
    return `https://open.spotify.com/${type}s/${id}`;
  }

  async getSpotifyToken(): Promise<void> {
    const SPOTIFY_CLIENT_ID = Bun.env.SPOTIFY_CLIENT_ID;
    const SPOTIFY_CLIENT_SECRET = Bun.env.SPOTIFY_CLIENT_SECRET;
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      throw new Error("No Spotify client ID or secret provided.");
    }

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`,
        ).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Spotify token.");
    }

    const data = (await response.json()) as { access_token: string };

    this.token = data.access_token;
    this.tokenExpires = Date.now() + 3600 * 1000;
  }

  async spotifyRequest<T>(url: string): Promise<T> {
    if (!this.token || !this.tokenExpires || this.tokenExpires < Date.now()) {
      await this.getSpotifyToken();
    }

    if (this.cache.get(url)) {
      this.cache.delete(url);
    }

    const cached = this.cache.get(url);
    if (cached) {
      return cached as T;
    }

    if (this.cache.size > this.cacheLimit) {
      this.cache.delete(this.cache.keys().next().value);
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Spotify data.");
    }

    const data = response.json() as Promise<T>;
    return data;
  }

  async getSpotifyTrack(id: string): Promise<SpotifyTrack> {
    const url = `https://api.spotify.com/v1/tracks/${id}`;
    const data = await this.spotifyRequest<SpotifyTrack>(url);
    this.cache.set(url, data);
    return data;
  }

  async getSpotifyAlbum(id: string): Promise<SpotifyAlbum> {
    const url = `https://api.spotify.com/v1/albums/${id}`;
    const data = await this.spotifyRequest<SpotifyAlbum>(url);
    this.cache.set(url, data);
    return data;
  }

  async getSpotifyPlaylist(id: string): Promise<SpotifyPlaylist> {
    const url = `https://api.spotify.com/v1/playlists/${id}`;
    const data = await this.spotifyRequest<SpotifyPlaylist>(url);
    this.cache.set(url, data);
    return data;
  }

  async getSpotifyArtist(id: string): Promise<SpotifyArtist> {
    const url = `https://api.spotify.com/v1/artists/${id}`;
    const data = await this.spotifyRequest<SpotifyArtist>(url);
    this.cache.set(url, data);
    return data;
  }

  async getSpotifyUser(id: string): Promise<SpotifyUser> {
    const url = `https://api.spotify.com/v1/users/${id}`;
    const data = await this.spotifyRequest<SpotifyUser>(url);
    this.cache.set(url, data);
    return data;
  }
}

export default new AsukaSpotify();
