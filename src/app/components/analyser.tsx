import { useEffect, useState } from 'react'
import Meyda from 'meyda'

const getMedia = async () => {
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    })
  } catch (err) {
    console.log('Error:', err.message)
  }
}

const useMeydaAnalyser = () => {
  const [analyser, setAnalyser] = useState(null)
  const [running, setRunning] = useState(false)
  const [features, setFeatures] = useState(null)

  useEffect(() => {
    const audioContext = new AudioContext()

    let newAnalyser
    getMedia().then(stream => {
      if (audioContext.state === 'closed') {
        return
      }
      const source = audioContext.createMediaStreamSource(stream)
      newAnalyser = Meyda.createMeydaAnalyzer({
        audioContext: audioContext,
        source: source,
        bufferSize: 4096,
        featureExtractors: ['chroma'],
        callback: chroma => {
          const featuress = [...chroma.chroma.slice(9, 12), ...chroma.chroma.slice(0, 9)]; // Start from A with pitch classes
          console.log(featuress)
          console.log(chroma)
          setFeatures(featuress)
        },
      })
      setAnalyser(newAnalyser)
    })
    return () => {
      if (newAnalyser) {
        newAnalyser.stop()
      }
      if (audioContext) {
        audioContext.close()
      }
    }
  }, [])

  useEffect(() => {
    if (analyser) {
      if (running) {
        analyser.start()
      } else {
        analyser.stop()
      }
    } else {
      setRunning(false)
    }
  }, [running, analyser])

  return [running, setRunning, features]
}

export default useMeydaAnalyser
