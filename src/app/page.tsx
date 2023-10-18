"use client"; // This is a client component
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react';
import * as Meyda from 'meyda';
// import { Chart as ChartJS } from 'chart.js/auto';
import { Chart as ChartJS } from 'chart.js/auto'
import { Chart, Bar, getDatasetAtEvent } from "react-chartjs-2";

// import useMeydaAnalyser from './components/analyser'


export default function Home() {
  
    let [ctxStarted, data, updateWaveform, peaks, analyser, setData] = useState(false);
    // Control
    let smoothing = 600;
    const canvasRef = useRef(null);
    // Audio
    let canvas, player, waveform, peaksInstance;
    let featuress = new Array(12).fill(2.0);
    ctxStarted = false;
    
    let ctx, chart;

    // CODE CRIME 👮
    const colours = [
        '#8dd3c7',
        '#ffffb3',
        '#bebada',
        '#fb8072',
        '#80b1d3',
        '#fdb462',
        '#b3de69',
        '#fccde5',
        '#d9d9d9',
        '#bc80bd',
        '#ccebc5',
        '#ffed6f'
    ];

    const options = {
        overview: {
            container: waveform,
            waveformColor: 'rgb(3,113,181'
        },
        mediaElement: player,
        dataUri: { arraybuffer: '/audio/Tremblay-AaS-AcBassGuit-Melo-M.dat' },
        mediaUrl: '/audio/Tremblay-AaS-AcBassGuit-Melo-M.mp3'
    };
    const labels = 'A A# B C C# D D# E F F# G G#'.split(' ');
    data = {
      labels: labels,
      datasets: [
          {
              data: featuress,
              backgroundColor: colours,
              borderColor: colours,
              borderWidth: 1
          }
      ]
    };
    const chartRef = useRef();
  
    updateWaveform = (audioFile, e) => {
        if (!ctxStarted) {
            const audioContext = new (AudioContext || webkitAudioContext)();
            const source = audioContext.createMediaElementSource(player);
            source.connect(audioContext.destination);
            analyser = Meyda.createMeydaAnalyzer({
                audioContext: audioContext,
                source: source,
                bufferSize: 4096,
                featureExtractors: ['chroma'],
                callback: chroma => {
                    featuress = [...chroma.chroma.slice(9, 12), ...chroma.chroma.slice(0, 9)]; // Start from A with pitch classes
                    data.datasets[0].data = featuress;
                    canvasRef.current.data = data;
                    canvasRef.current.update();
                }
            });
            analyser.start();
            ctxStarted = !ctxStarted;
        }
        player.src = audioFile + '.mp3';
        const options = {
            mediaUrl: audioFile + '.mp3',
            dataUri: { arraybuffer: audioFile + '.dat' }
        };

        // peaksInstance.setSource(options, err => {
//                 if (err) console.log(err);
//             });

        player.play();
    };
    // const [running, setRunning, features] = useMeydaAnalyser();

  useEffect(() => {
      let peaksInstance;
      player = document.getElementById('player');
      chart = document.getElementById('barChart');
      async function fetchData() {
          const module = await import('peaks.js');
          const Peaks = module.default;
          Peaks.init(options, (err, peaks) => {
              // Do something when the waveform is displayed and ready
              return peaks;
          });
          return Peaks;
      }
      peaks = fetchData().then(peaks2 => {
          peaks = peaks2;
          return peaks;
      });
      ChartJS.register();
  }, [smoothing, data, updateWaveform, peaksInstance, peaks]);

  return (
    <div className="container">
	<Bar ref={canvasRef} id="barChart" data={data} redraw={true} />

	<div className="controls">

		<div className="waveform" />

		<div className="smoothing">
			<span>Smoothing: {smoothing} frames</span>
			<input
				type="range"
				min="50"
				max="1000"
				value={smoothing}
			/>
		</div>
		<div className="sound-select">
			<button
				label="Bass 🎸"
				onClick={(e) => {
					updateWaveform('/audio/boop', e);
				}}
			>Boop 🎹</button>

			<button
				label="Piano 🎹"
				onClick={(e) => {
					updateWaveform('/audio/Tremblay-AaS-AcBassGuit-Melo-M', e);
				}}
			>Piano 🎹</button>

			<button
				label="Oboe 🎷"
				onClick={(e) => {
					updateWaveform('/audio/Tremblay-AaS-AcBassGuit-Melo-M', e);
				}}
			>Piano 🎹</button>

			<button
				label="Trombone 🎺"
				onClick={(e) => {
					updateWaveform('/audio/Tremblay-AaS-AcBassGuit-Melo-M', e);
				}}
			>Piano 🎹</button>
		</div>

		<audio controls loop className="player" id="player" src="/audio/Tremblay-AaS-AcBassGuit-Melo-M.mp3" />
	</div>
</div>
  )
}
