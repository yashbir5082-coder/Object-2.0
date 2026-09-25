/**
 * Music API Service
 * Powered by Apple iTunes Search API (100% reliable, zero-auth, global & Indian tracks)
 * with curated celebratory fallbacks.
 */

const ITUNES_SEARCH = 'https://itunes.apple.com/search';
const ITUNES_LOOKUP = 'https://itunes.apple.com/lookup';

// Curated default celebration songs
export const DEFAULT_BIRTHDAY_SONGS = [
  {
    id: '1440821356',
    name: 'Happy Birthday',
    artist: 'Stevie Wonder',
    album: 'Hotter Than July',
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/10/71/7e/10717e68-72d1-e3ce-6173-a920506bf797/00602537779482.rgb.jpg/300x300bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/c7/ec/49/c7ec49c2-928f-ca06-a3b8-d88ed558db1e/mzaf_7219514641896647669.plus.aac.p.m4a',
  },
  {
    id: '1440833132',
    name: 'Birthday',
    artist: 'The Beatles',
    album: 'The Beatles (White Album)',
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/05/cf/64/05cf6471-70e2-6320-94ec-d1a1b415a784/00602567572015.rgb.jpg/300x300bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/71/84/f1/7184f181-79e5-9430-c0b9-0c67ba5b11eb/mzaf_17208154162483864177.plus.aac.p.m4a',
  },
  {
    id: '1533036611',
    name: 'Celebration',
    artist: 'Kool & The Gang',
    album: 'Celebrate!',
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/b9/0f/c6/b90fc6a4-47f5-2efc-1b77-d4fa4c3b5220/06UMGIM08244.rgb.jpg/300x300bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/10/01/be/1001be1f-1355-685b-e48f-3dae84576dfa/mzaf_13506381467472093498.plus.aac.p.m4a',
  }
];

/**
 * Search for songs using iTunes Search API.
 * Supports any language / artist (English, Hindi/Bollywood, Punjabi, Spanish, etc.)
 * @param {string} query - Search term
 * @param {number} limit - Max results (default 10)
 * @returns {Promise<Array>} Array of song objects
 */
export async function searchSongs(query, limit = 10) {
  const trimmed = (query || '').trim();
  if (!trimmed) {
    return DEFAULT_BIRTHDAY_SONGS;
  }

  try {
    const url = `${ITUNES_SEARCH}?term=${encodeURIComponent(trimmed)}&entity=song&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      return [];
    }

    return data.results.map((song) => ({
      id: String(song.trackId),
      name: song.trackName || 'Unknown Title',
      artist: song.artistName || 'Unknown Artist',
      album: song.collectionName || '',
      duration: Math.round((song.trackTimeMillis || 0) / 1000),
      imageUrl:
        song.artworkUrl100?.replace('100x100bb', '300x300bb') ||
        song.artworkUrl60 ||
        song.artworkUrl30 ||
        '',
      previewUrl: song.previewUrl || '',
      year: song.releaseDate ? new Date(song.releaseDate).getFullYear() : '',
    }));
  } catch (error) {
    console.error('Song search failed, returning curated fallbacks:', error);
    return DEFAULT_BIRTHDAY_SONGS.filter(
      (s) =>
        s.name.toLowerCase().includes(trimmed.toLowerCase()) ||
        s.artist.toLowerCase().includes(trimmed.toLowerCase())
    );
  }
}

/**
 * Get song details by ID.
 * @param {string} songId - Track ID
 * @returns {Promise<Object|null>} Song object or null
 */
export async function getSongById(songId) {
  if (!songId) return null;

  // Check default songs first
  const found = DEFAULT_BIRTHDAY_SONGS.find((s) => s.id === String(songId));
  if (found) return found;

  try {
    const res = await fetch(`${ITUNES_LOOKUP}?id=${encodeURIComponent(songId)}`);
    if (!res.ok) return null;
    const data = await res.json();
    const song = data.results?.[0];
    if (!song) return null;

    return {
      id: String(song.trackId),
      name: song.trackName || 'Unknown Title',
      artist: song.artistName || 'Unknown Artist',
      album: song.collectionName || '',
      duration: Math.round((song.trackTimeMillis || 0) / 1000),
      imageUrl:
        song.artworkUrl100?.replace('100x100bb', '300x300bb') ||
        song.artworkUrl60 ||
        '',
      previewUrl: song.previewUrl || '',
    };
  } catch (error) {
    console.error('Get song by ID failed:', error);
    return null;
  }
}
