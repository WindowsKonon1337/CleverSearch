import React, { FC, useEffect, useState, useRef } from 'react';

// TODO make import with minimal support for our links 
// https://github.com/cookpete/react-player?tab=readme-ov-file#usage
import ReactPlayer from 'react-player'
import { ControlsForVideo } from '@entities/controlsForVideo/controlsForVideo'
import { OnProgressProps } from 'react-player/base';
import './videoPlayer.scss'

// https://github.com/cookpete/react-player/blob/master/examples/react/src/App.js#L195
// https://cookpete.github.io/react-player/

interface VideoPlayerProps {
	url: string,
	time?: number,
	duration?: number,
}

interface VideoPlayerState {
	url: string,
	pip: boolean,
	playing: boolean,
	controls: boolean,
	light: boolean,
	volume: number,
	muted: boolean,
	played: number,
	loaded: number,
	duration: number,
	playbackRate: number,
	loop: boolean,
	seeking: boolean
}

export const VideoPlayer: FC<VideoPlayerProps> = ({
	url,
	time,
	duration
}) => {
	const player = useRef<ReactPlayer>(null)
	const [state, setState] = useState<VideoPlayerState>({
		url: url,
		pip: false,
		playing: false,
		controls: false,
		light: false,
		volume: 0.8,
		muted: false,
		played: 0,
		loaded: 0,
		duration: duration || 0,
		playbackRate: 1.0,
		loop: false,
		seeking: false
	});
	const [firstTime, setFirstTime] = useState(true);

	const handleOnPlaybackRateChange = (speed: string) => {
		setState({ ...state, playbackRate: parseFloat(speed) })
	}

	const handleTogglePIP = () => {
		setState({ ...state, pip: !state.pip })
	}

	const handlePlay = () => {
		console.log('onPlay')
		setState({ ...state, playing: true })
	}

	const handlePause = () => {
		console.log('onPause')
		setState({ ...state, playing: false })
	}

	const handleProgress = (passedState: OnProgressProps) => {
		// We only want to update time slider if we are not currently seeking
		if (!state.seeking) {
			setState({ ...state, played: passedState.playedSeconds })
		}
	}

	const handleEnded = () => {
		setState({ ...state, playing: state.loop })
	}

	const handleDuration = (duration: number) => {
		setState({ ...state, duration })
	}

	// const handleClickFullscreen = () => {
	// 	screenfull.request(document.querySelector('.react-player'))
	// }

	return (
		<div className='video-player'>
			<ReactPlayer
				ref={player}
				className='react-player'
				width='100%'
				height='100%'
				url={state.url}
				pip={state.pip}
				playing={state.playing}
				controls={state.controls}
				light={state.light}
				loop={state.loop}
				playbackRate={state.playbackRate}
				volume={state.volume}
				muted={state.muted}
				onPlay={handlePlay}
				progressInterval={10}
				// TODO make pip
				onPause={handlePause}
				onPlaybackRateChange={handleOnPlaybackRateChange}
				onSeek={e => console.log('onSeek', e)}
				onError={e => console.log('onError', e)}
				onProgress={handleProgress}
				onDuration={handleDuration}
				onReady={(pl) => {
					if (firstTime) {
						pl.seekTo(time)
						setFirstTime(false)
					}
				}}
			>
			</ReactPlayer>
			<ControlsForVideo
				isPlaying={state.playing}
				currentTime={state.played}
				maxTime={state.duration}
				currentVolume={state.volume}
				setTime={(time: number) => player.current.seekTo(time)}
				start={() => setState({ ...state, playing: true })}
				stop={() => setState({ ...state, playing: false })}
				changeSpeed={(desiredSpeed) => setState({ ...state, playbackRate: desiredSpeed })}
				setVolume={(desiredVolume) => setState({ ...state, volume: desiredVolume })}
			/>
		</div>
	);
};
