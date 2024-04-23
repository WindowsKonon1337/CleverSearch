import { useAppSelector } from '@store/store';
import React, { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useShowSharedMutation } from '@api/searchApi';
import { transfromToSharedRequestParams, transfromToShowRequestString } from '@api/transforms';
import { BreadCrumps } from '@entities/breadCrumps/breadCrumps';
import { switchToShared } from '@store/whatToShow';
import { RenderFields } from '@widgets/renderFields/renderFields';
import { useLocation, useNavigate } from 'react-router-dom';
import '../show.scss';
import { useParamsFromURL } from '@helpers/hooks/useParamsFromURL';
import { changeDir, newValues } from '@store/showRequest';
import { useShowParams } from '@helpers/hooks/useShowParams';

interface ShowSharedFilesProps { }


export const ShowSharedFiles: FC<ShowSharedFilesProps> = () => {
	const [showShared, { data, ...searchResp }] = useShowSharedMutation({ fixedCacheKey: 'shared' });
	const dispatch = useDispatch();

	const showReq = useAppSelector(state => state.showRequest)
	const { isShared } = useAppSelector(state => state.whatToShow)
	
	const [valueToShow, setvalueToShow] = useState(data?.body);

	const navigate = useNavigate()
	console.log("SHOW PARAMS",useShowParams())

	useEffect(() => {
		setvalueToShow(data?.body)
	}, [data?.body])

	useEffect(() => {
		dispatch(switchToShared())
	}, [])

	useEffect(() => {
		showShared({ ...showReq})
	}, [showReq, isShared])

	if (!isShared) {
		dispatch(switchToShared())
	}

	if (valueToShow && !('length' in valueToShow)) {
		setvalueToShow([valueToShow])
	}


	return (
		<div className="data-show" >
			<div className="data-show__header">
				<BreadCrumps
					dirs={['Shared', ...showReq.dir]}
					onClick={() => {
						if (showReq.dir.length !== 0) {
							dispatch(newValues({...showReq, dir: showReq.dir.slice(0, -1), disk: 'all'}))
							navigate(-1)

							return
						}
					}}
					reactOnElements={
						['Shared', ...showReq.dir].map((dir, index) => {
                            return () => {
                                let dirToSet: string[] = []
                                if (index !== 0) 
                                    dirToSet = showReq.dir.slice(0, index)
                                const url = transfromToSharedRequestParams(
                                    {
                                        ...showReq,
                                        dir: dirToSet,
                                    }
                                )
                                dispatch(changeDir(dirToSet))
                                navigate(url, { replace: true })
                            }
                        })
					}
				/>
			</div>
			<RenderFields
				data={valueToShow}
				error={searchResp.error}
				isError={searchResp.isError}
				isLoading={searchResp.isLoading}
				dispatch={dispatch}
				deleteFile={() => { }}
				openFolder={(path, disk) => {
					const pathWithValues = path.filter(val => val !== '')

					dispatch(newValues({...showReq, dir: pathWithValues, disk: disk}))
					if (!isShared) {
						dispatch(switchToShared());
					}
					const url = transfromToSharedRequestParams({ ...showReq, dir: pathWithValues, disk: disk });

					navigate(`/shared${url}`)
				}}
			/>
		</div>
	);
};
