import React, { FC, useEffect, useState } from 'react';
import './userProfile.scss';
import { DropDown } from '@entities/dropDown/dropDown';
import { useDispatch } from 'react-redux';
import { getAvatarByEmail, useLazyProfileQuery } from '@api/userApi'
import { setUserEmail } from '@store/userAuth';
import { isNullOrUndefined } from '@helpers/isNullOrUndefined';
import { useLogout } from '@helpers/hooks/logout';
import { Typography } from '@mui/material';
import { useMobile } from 'src/mobileProvider';
import { useNavigate } from 'react-router-dom';
import { useSetAvatarMutation } from '@api/userApi';

interface UserProfileProps {
	email: string;
	isDropdownExist?: boolean;
}

export const UserProfile: FC<UserProfileProps> = ({
	email,
	isDropdownExist,
}): React.ReactNode => {
	const [isOpenProfile, setOpen] = useState(false)
	const dispatch = useDispatch()
	const logout = useLogout()
	const { whatDisplay } = useMobile()
	const [, respSetAvatar] = useSetAvatarMutation({fixedCacheKey: 'profilePicture'})

	const navigate = useNavigate()
	const [profile, profileResp] = useLazyProfileQuery()

	const [image, setImage] = useState<string>()

	useEffect(() => {
		if (respSetAvatar.isSuccess) {
			setImage(getAvatarByEmail(respSetAvatar.data))
		}
	}, [respSetAvatar])

	useEffect(() => {
		if (email === '') {
			if (!profileResp.isSuccess && !profileResp.isLoading && !profileResp.isError) {
				profile(null)
			}
	
			if (profileResp.data && profileResp.data.email) {
				dispatch(setUserEmail({ email: profileResp.data.email }))
			}
		} else {
			setImage(getAvatarByEmail(email))
		}
	}, [email, profileResp])

	const profileMain = (): React.ReactNode => {
		return (
			<div className='profile'>
				<div style={{fontSize:'var(--ft-paragraph)'}}>
					{email !== '' 
					? <img className='profile-picture' src={image} />
					: null
					}
					
				</div>
				<Typography
					sx={{
						width: '100%',
						overflow: 'hidden',
						maxWidth: '100%',
						textOverflow: 'ellipsis',
					}}
					fontSize={'var(--ft-body)'}
				>
					{email}
				</Typography>
			</div>
		)
	}
	const renderDropDown = (): React.ReactNode => {
		return (<DropDown
			styleOnMain={{ 
				height: '100%', 
				cursor: whatDisplay === 3 ? 'default' : 'pointer',
				maxWidth: '100%'
			}}
			variants='down-center'
			open={isOpenProfile}
			toggleOpen={setOpen}
			mainElement={profileMain()}
		>
			{[
				<div onClick={() => navigate('/settings')} key={'settings-profile'} >Settings</div>,
				<div onClick={logout} key={'logout-profile'}>Logout</div>,
			]}
		</DropDown >)
	}

	const isShowDropDown = isNullOrUndefined(isDropdownExist) || isDropdownExist
	return (
		<>
			{isShowDropDown ? renderDropDown() : profileMain()}
		</>
	)
};
