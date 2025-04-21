import fetch from 'node-fetch';


const YT_INITIAL_PLAYER_RESPONSE_RE = /ytInitialPlayerResponse\s*=\s*({.+?})\s*;\s*(?:var\s+(?:meta|head)|<\/script|\n)/;

async function retrieveTranscript(videoId) {
  const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
  const html = await response.text();

  const match = html.match(YT_INITIAL_PLAYER_RESPONSE_RE);
  if (!match) {
    console.warn('Unable to parse ytInitialPlayerResponse');
    return null;
  }

  const player = JSON.parse(match[1]);
  const metadata = {
    title: player.videoDetails.title,
    duration: player.videoDetails.lengthSeconds,
    author: player.videoDetails.author,
    views: player.videoDetails.viewCount,
  };

  const tracks = player.captions.playerCaptionsTracklistRenderer.captionTracks;
  tracks.sort(compareTracks);
  const transcriptRes = await fetch(tracks[0].baseUrl + '&fmt=json3');
  const transcript = await transcriptRes.json();

  const parsedTranscript = transcript.events
    .filter(e => e.segs)
    .map(e => e.segs.map(s => s.utf8).join(' '))
    .join(' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ');

  return { parsedTranscript, metadata };
}

function compareTracks(track1, track2) {
    const langCode1 = track1.languageCode;
    const langCode2 = track2.languageCode;
  
    if (langCode1 === 'en' && langCode2 !== 'en') {
      return -1; // English comes first
    } else if (langCode1 !== 'en' && langCode2 === 'en') {
      return 1; // English comes first
    } else if (track1.kind !== 'asr' && track2.kind === 'asr') {
      return -1; // Non-ASR comes first
    } else if (track1.kind === 'asr' && track2.kind !== 'asr') {
      return 1; // Non-ASR comes first
    }
    return 0; // Preserve order if both have same priority

}

export { retrieveTranscript };


