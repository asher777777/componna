/**
 * Subtitles Engine (SRT & WebVTT Generator and Parser)
 */

function formatSrtTime(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  const ms = Math.floor((totalSeconds % 1) * 1000);

  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

function formatVttTime(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  const ms = Math.floor((totalSeconds % 1) * 1000);

  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

export function generateSrtContent(text: string, durationSec: number = 6): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';

  const chunkSize = Math.max(Math.ceil(words.length / Math.ceil(durationSec / 2.5)), 4);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
  }

  const chunkDuration = durationSec / chunks.length;
  let srt = '';

  chunks.forEach((chunk, index) => {
    const startSec = index * chunkDuration;
    const endSec = Math.min((index + 1) * chunkDuration, durationSec);
    srt += `${index + 1}\n`;
    srt += `${formatSrtTime(startSec)} --> ${formatSrtTime(endSec)}\n`;
    srt += `${chunk}\n\n`;
  });

  return srt.trim();
}

export function generateVttContent(text: string, durationSec: number = 6): string {
  const srtBody = generateSrtContent(text, durationSec);
  const vttBody = srtBody.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
  return `WEBVTT\n\n${vttBody}`;
}

export function downloadSubtitleFile(filename: string, content: string, mimeType: string = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
