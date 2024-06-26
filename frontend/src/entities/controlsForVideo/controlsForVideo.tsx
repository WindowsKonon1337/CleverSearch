import React, { FC, useState } from 'react';

// TODO make import with minimal support for our links 
// https://github.com/cookpete/react-player?tab=readme-ov-file#usage
import './controlsForVideo.scss'

import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';

import FastForwardRoundedIcon from '@mui/icons-material/FastForwardRounded';
import FastRewindRoundedIcon from '@mui/icons-material/FastRewindRounded';

import FullscreenExitRoundedIcon from '@mui/icons-material/FullscreenExitRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';

import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import VolumeDownRoundedIcon from '@mui/icons-material/VolumeDownRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';

import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';

import { DropDown } from '@entities/dropDown/dropDown';
import { Box, IconButton, Slider, Typography } from '@mui/material'
import { useMobile } from 'src/mobileProvider';

import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';


interface ControlsForVideoProps {
	currentTime: number,
	maxTime: number,
	setTime: (timeToSet: number) => void,
	start: () => void,
	stop: () => void,
	isFullScreen?: boolean,
	toggleFullScreen?: () => void,
	changeSpeed: (desiredSpeed: number) => void,
	currentVolume: number,
	// Can accept only from 0 to 1
	setVolume: (desiredVolume: number) => void
	isPlaying: boolean,
	searchTimeCodes?: number[],
}

export const ControlsForVideo: FC<ControlsForVideoProps> = ({
	currentTime,
	maxTime,
	setTime,
	start,
	stop,
	toggleFullScreen,
	isFullScreen,
	changeSpeed,
	currentVolume,
	setVolume,
	isPlaying,
	searchTimeCodes,
}) => {
	const [isOpenVolume, setOpenVolume] = useState(false)
	const [speedOpen, setSpeedOpen] = useState(false)

	const [currentTimeCodeSearched, setCurrentTimeCodeSearched] = useState(0)

	const {whatDisplay} = useMobile()

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (Number(e.target.value)) {
			setTime(Number(e.target.value))
		}
	}

	const getValueForInput = (duration: number, current: number): number => {
		if (duration !== 0) {
			return current / maxTime * 0.999999
		}
		return 0
	}

	const getVolumeIcon = (volume: number): React.ReactNode => {
		if (volume >= 0.5) {
			return <VolumeUpRoundedIcon fontSize='inherit' className='contorl-img'/>
		}
		if (volume < 0.5 && volume !== 0) {
			return <VolumeDownRoundedIcon fontSize='inherit' className='contorl-img'/>
		}

		return <VolumeOffRoundedIcon fontSize='inherit' className='contorl-img'/>
	}

	const handleSelectTimecode = (timeCodeSelected: number) => {
		if (searchTimeCodes?.length <= timeCodeSelected) {
			setCurrentTimeCodeSearched(searchTimeCodes.length - 1)
			return
		  }
	  
		  if (timeCodeSelected < 0) {
			setCurrentTimeCodeSearched(0)
			return
		  }
	  
		  setCurrentTimeCodeSearched(timeCodeSelected)
		  setTime(searchTimeCodes[timeCodeSelected])
	}

	return (
		<div className='controls-container'>
			<div className='progress-bar-container' style={{ position: 'relative' }}>
				<input
					className='progress-bar'
					max={0.999999}
					min={0}
					value={getValueForInput(maxTime, currentTime)}
					step={0.000001}
					type='range'
					style={{ width: '100%', height: '100%' }}
					onChange={handleChange} />
			</div>
			<div 
				className='controls' 
				style={{
					gap: whatDisplay !== 1 ? null : '8px',
					position: 'relative',
				}}
			>
				<div className='start-stop-container'>
					{!isPlaying ?
						<PlayArrowRoundedIcon onClick={start} fontSize='inherit'/>
						:
						<PauseRoundedIcon className='contorl-img' fontSize='inherit' onClick={stop}/>
					}
				</div>
				<div className='rewind-container'>
					<div className='rewind-back-container'>
						<FastRewindRoundedIcon
							fontSize='inherit'
							className='contorl-img'
							onClick={() => setTime(currentTime - 5)}
						/>
					</div>
					<div className='rewind-forward-container'>
						<FastForwardRoundedIcon
							fontSize='inherit'
							className='contorl-img'
							onClick={() => setTime(currentTime + 5)}
						/>
					</div>
				</div>
				<div className='speed-container'>
					<DropDown
						borderRadius='small'
						open={speedOpen}
						toggleOpen={setSpeedOpen}
						variants='up'
						mainElement={<SpeedRoundedIcon fontSize='inherit'/>}
					>
						{[
							<p key={'speed-x1'} onClick={() => changeSpeed(1)}>x1</p>,
							<p key={'speed-x2'} onClick={() => changeSpeed(2)}>x2</p>
						]}
					</DropDown>
					
				</div>
				{whatDisplay !== 1 ? null 
				: <div className='volume-container'>
					{/* TODO think about children */}
					<DropDown
						open={isOpenVolume}
						toggleOpen={setOpenVolume}
						variants='up'
						mainElement={getVolumeIcon(currentVolume)}
					>
						{[
							<Box
								key={'box-control'} 
								sx={
									{
										height: 130,
										overflow: 'hidden',
										'boxSizing': 'border-box',
									}
								}
									display={'flex'}
									alignItems={'center'}
								>
									<Slider
										sx={{
											height: 105,
											'& input[type="range"]': {
												WebkitAppearance: 'slider-vertical',
											},
										}}
										orientation="vertical"
										value={currentVolume}
										max={1}
										min={0}
										step={0.01}
										onChange={(e, val) => {
											if ('value' in e.target) {
												let value = Array.isArray(val) ? val[0] : val;
												if (isNaN(value)) value = 0.5
												setVolume(value)
											}
										}}
									/>
								</Box>
						]}
					</DropDown>
				</div>
				}
				<div className='fullscreen-container'>
					{isFullScreen 
					? <FullscreenRoundedIcon fontSize='inherit' onClick={() => toggleFullScreen()}/>
					: <FullscreenExitRoundedIcon fontSize='inherit' onClick={() => toggleFullScreen()}/>
					}
				</div>
			</div>
				{
					searchTimeCodes?.length > 1
					?<div 
						className='timecode-show' 
						style={{
							display: 'flex',
							flexDirection:'row',
							fontSize: 'var(--ft-body-plust)',
							position: 'absolute',
							bottom: '88px',
							right: '32px',
						}}
					>
						 	<IconButton
								onClick={() => handleSelectTimecode(currentTimeCodeSearched + 1)}
								sx={{color:'black', fontSize: 'var(--ft-body-plust)'}}
								disabled={currentTimeCodeSearched === searchTimeCodes?.length - 1}
							>
							<KeyboardArrowUpOutlinedIcon fontSize='inherit' sx={{color:'inherit', borderRadius: 'var(--big-radius)', backgroundColor: 'rgba(255,255,255,0.3)'}}/>
							</IconButton>
							<Typography fontSize={'var(--ft-body)'}></Typography>
							<IconButton 
								onClick={() => handleSelectTimecode(currentTimeCodeSearched - 1)}
								sx={{color:'black', fontSize: 'var(--ft-body-plust)'}}
								disabled={currentTimeCodeSearched === 0}
							>
							<KeyboardArrowDownOutlinedIcon fontSize='inherit'  sx={{color:'inherit', borderRadius: 'var(--big-radius)', backgroundColor: 'rgba(255,255,255,0.3)'}}/>
							</IconButton>
					</div>
					:null
				}
		</div>
	)
};
