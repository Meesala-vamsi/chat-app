let audioContext

// Plays a short two-note "ding" for a new message.
// The sound is made with the browser's Web Audio API, so no audio file is needed.
// Browsers only allow sound after the user has clicked or typed on the page once, which is always true in the chat.
export const playNotificationSound = () => {
  try {
    audioContext ??= new (window.AudioContext || window.webkitAudioContext)()
    if (audioContext.state === 'suspended') audioContext.resume()

    const notes = [
      { frequency: 880, delay: 0 },
      { frequency: 1318.5, delay: 0.12 },
    ]
    const now = audioContext.currentTime

    notes.forEach(({ frequency, delay }) => {
      const oscillator = audioContext.createOscillator()
      const volume = audioContext.createGain()
      const start = now + delay

      oscillator.type = 'sine'
      oscillator.frequency.value = frequency

      // fade in quickly and fade out slowly, so it sounds soft instead of a harsh beep
      volume.gain.setValueAtTime(0.0001, start)
      volume.gain.exponentialRampToValueAtTime(0.25, start + 0.02)
      volume.gain.exponentialRampToValueAtTime(0.0001, start + 0.35)

      oscillator.connect(volume).connect(audioContext.destination)
      oscillator.start(start)
      oscillator.stop(start + 0.4)
    })
  } catch {
    // the sound is only a nice extra, never break the chat because of it
  }
}
