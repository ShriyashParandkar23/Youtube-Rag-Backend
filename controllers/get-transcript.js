import fetch from 'node-fetch';

const YT_INITIAL_PLAYER_RESPONSE_RE = /ytInitialPlayerResponse\s*=\s*({.+?})\s*;\s*(?:var\s+(?:meta|head)|<\/script|\n)/;

async function retrieveTranscript(videoId) {
  console.log(videoId)
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await response.text();

    const match = html.match(YT_INITIAL_PLAYER_RESPONSE_RE);
    if (!match) {
      console.warn('Unable to parse ytInitialPlayerResponse');
      return null;
    }

    const player = JSON.parse(match[1]);

    // Check if videoDetails exists
    if (!player.videoDetails) {
      console.warn('Missing video details in player response');
      return null;
    }

    const metadata = {
      title: player.videoDetails.title || 'Unknown title',
      duration: player.videoDetails.lengthSeconds || 0,
      author: player.videoDetails.author || 'Unknown author',
      views: player.videoDetails.viewCount || 0,
    };

    // Ensure the captions tracklist exists
    const tracks = player.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
    if (tracks.length === 0) {
      console.warn('No caption tracks found');
      return { metadata }; // Return metadata even if there are no transcripts
    }

    // Sort the tracks by language (prefer English and non-ASR)
    tracks.sort(compareTracks);

    // Fetch the transcript from the first available track
    const transcriptRes = await fetch(tracks[0].baseUrl + '&fmt=json3');
    const transcript = await transcriptRes.json();

    // Process transcript events
    const parsedTranscript = transcript.events
      .filter(e => e.segs)
      .map(e => e.segs.map(s => s.utf8).join(' '))
      .join(' ')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/\s+/g, ' ');

    return { parsedTranscript, metadata };
  } catch (error) {
    console.error('Error while retrieving transcript:', error);
    return null;
  }
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
