// Web Speech API version of the mobile mic button: continuous listening that
// restarts itself until stopped, appending to whatever text was already typed.
import { useCallback, useEffect, useRef, useState } from 'react'

const SpeechRecognition = typeof window !== 'undefined'
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : null

export function useSpeechToText({ locale, getText, setText }) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)
  const shouldListenRef = useRef(false)
  const io = useRef({ getText, setText, locale })
  io.current = { getText, setText, locale }

  const available = !!SpeechRecognition

  const startSession = useCallback(() => {
    let previousText = io.current.getText()
    if (previousText && !previousText.endsWith(' ')) previousText += ' '

    const recognition = new SpeechRecognition()
    recognition.lang = io.current.locale
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) transcript += event.results[i][0].transcript
      io.current.setText(previousText + transcript)
    }
    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        shouldListenRef.current = false
      }
    }
    recognition.onend = () => {
      if (shouldListenRef.current) {
        setTimeout(() => { if (shouldListenRef.current) startSession() }, 100)
      } else {
        setIsListening(false)
      }
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
      setIsListening(true)
    } catch {
      shouldListenRef.current = false
      setIsListening(false)
    }
  }, [])

  const stop = useCallback(() => {
    shouldListenRef.current = false
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const toggle = useCallback(() => {
    if (shouldListenRef.current) {
      stop()
    } else {
      shouldListenRef.current = true
      startSession()
    }
  }, [startSession, stop])

  useEffect(() => () => {
    shouldListenRef.current = false
    recognitionRef.current?.abort()
  }, [])

  return { available, isListening, toggle, stop }
}
