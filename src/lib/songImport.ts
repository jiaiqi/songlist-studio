import type { SongDraft } from '@/types'

const separators = [' - ', ' – ', ' — ', ' / ', '/', '-', '–', '—']

export function parseSongImport(input: string): SongDraft[] {
  const dedupeKeys = new Set<string>()

  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseSongLine)
    .filter((song) => {
      const key = `${song.title.toLowerCase()}::${song.artist?.toLowerCase() ?? ''}`

      if (dedupeKeys.has(key)) return false

      dedupeKeys.add(key)
      return true
    })
}

function parseSongLine(line: string): SongDraft {
  const separator = separators.find((candidate) => line.includes(candidate))

  if (!separator) {
    return createSongDraft(line)
  }

  const [title, ...artistParts] = line.split(separator)
  return createSongDraft(title, artistParts.join(separator))
}

export function createSongDraft(title: string, artist = ''): SongDraft {
  return {
    title: title.trim(),
    artist: artist.trim() || undefined,
    status: 'requestable',
    tags: [],
  }
}
