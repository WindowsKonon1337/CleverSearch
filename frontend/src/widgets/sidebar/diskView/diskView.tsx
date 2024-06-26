import { TextWithImg } from '@feature/textWithImg/textWithimg';
import { diskImgSrc, diskTypes } from '@models/disk';
import { useAppSelector } from '@store/store';
import { selectCloud } from '@store/userDisks';
import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { TextWithImgAndDropDown } from './textWithImgAndModal/textWithImgAndModal';
import { useUpdateDiskMutation } from '@api/diskApi';
import { newValues } from '@store/showRequest';
import { notificationBar } from '@helpers/notificationBar';



interface DiskViewProps {
    setSelectedState: (text: diskTypes) => void;
    nameOfSelectedDisk: diskTypes,
    needSelect: boolean,
    externalView: boolean,
}

export const DiskView: FC<DiskViewProps> = ({
    setSelectedState,
    nameOfSelectedDisk,
    needSelect,
    externalView,
}) => {
    const dispatch = useDispatch();
    const disks = useAppSelector(state => state.disks)
    
    const showReq = useAppSelector(state => state.showRequest)
    const [refresh, refreshResp] = useUpdateDiskMutation()
    
    useEffect(() => {
        if (refreshResp.isSuccess &&  typeof showReq.disk !== 'string' && showReq.disk.disk === nameOfSelectedDisk) {
            dispatch(newValues({...showReq, disk: showReq.disk}))
            notificationBar({
                children: 'Refresh files successfully',
                variant:'success',
            })
        }
    }, [refreshResp])


    const alreadyShowed = [] as diskTypes[]
    const disksToShow = disks.clouds
        .map(
            val => {
                if (!!alreadyShowed.find(disk => disk === val.disk)) {
                    return null
                }
                alreadyShowed.push(val.disk)
                return <TextWithImgAndDropDown
                    key={`${val.cloud_email}__${val.disk}`}
                    selected={nameOfSelectedDisk === val.disk && needSelect}
                    disk={diskImgSrc.get(val.disk)}
                    cloudValues={disks.clouds}
                    setState={setSelectedState}
                    selectedCloud={disks.selectedClouds}
                    selectCloud={(cloud) => {
                        dispatch(selectCloud(cloud))
                    }}
                    isRefreshShow={externalView}
                    currentSelectedDisk={typeof showReq.disk === 'string' ? showReq.disk : showReq.disk.disk}
                    refreshDisk={(disk) => {
                            notificationBar({
                                children: "Refresh files on disk",
                                variant: 'info',
                            })
                            refresh(disk)
                    }}
                />
            }
        )

    const allDiskInfo = diskImgSrc.get('internal')

    disksToShow.push(
        <TextWithImg
            key={allDiskInfo.diskName + allDiskInfo.src}
            className={
                [nameOfSelectedDisk === allDiskInfo.diskName && needSelect
                    ? 'selected'
                    : '', 'text-with-img-row'
                ].join(' ')
            }
            text={allDiskInfo.diskName}
            imgSrc={allDiskInfo.src}
            altImgText={allDiskInfo.altText}
            onClick={() => {
                setSelectedState(allDiskInfo.diskName as diskTypes);
            }}
        />
    )

    return (
        <div className="disks">{disksToShow}</div>
    )
};
