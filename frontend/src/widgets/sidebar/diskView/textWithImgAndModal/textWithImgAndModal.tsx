import { TextWithImg } from "@feature/textWithImg/textWithimg";
import { DiskType, diskTypes, isDiskType } from "@models/disk";
import { ConnectedClouds } from "@models/user";
import { FC, useRef, useState } from "react";
import { Modal } from '@feature/modal/modal';
import InfoIcon from '@mui/icons-material/Info';
import { SelectorMulti } from '@entities/selectors/selectorMulti/selectorMulti';
import { Option } from '@models/additional';
import { Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

const isSelectedDisk =
    (disk: ConnectedClouds, selectedDisk: ConnectedClouds[]): boolean => {
        return !!selectedDisk.find(val => val.cloud_email === disk.cloud_email
            && val.disk === disk.disk
        )
    }

export interface TextWithImgProps {
    selected: boolean,
    disk: DiskType,
    cloudValues: ConnectedClouds[],
    setState: (text: diskTypes | ConnectedClouds) => void,
    selectedCloud: ConnectedClouds[],
    selectCloud: (cloud: ConnectedClouds) => void,
    refreshDisk: (cloud: ConnectedClouds) => void,
    currentSelectedDisk: string,
}

export const TextWithImgAndModal: FC<TextWithImgProps> = (
    {
        selected,
        disk,
        cloudValues,
        setState,
        selectedCloud,
        selectCloud,
        refreshDisk,
        currentSelectedDisk,
    }
): React.ReactNode => {
    const [isOpen, setOpen] = useState<boolean>(false)
    const { src, altText, diskName } = disk;
    const ref = useRef(null)

    const transformToOption = (cloudEmail: string): Option => {
        return {
            label: cloudEmail,
            value: cloudEmail,
        }
    }
    const currentDiskSelected: ConnectedClouds[] = selectedCloud
        .filter(val => isSelectedDisk(val, selectedCloud))
        .filter(val => val.disk === diskName)

    const emailsInDisk = cloudValues.filter(val => val.disk === disk.diskName).map(val => val.cloud_email)

    const emailSelectCloud = currentDiskSelected?.filter(val => val.cloud_email !== '')

    const subText = emailsInDisk.length === 1 ? emailsInDisk[0] : currentDiskSelected.map(val => val.cloud_email).join(', ')
    return (
        <>
            <TextWithImg
                key={diskName + src}
                className={[selected ? 'selected' : '', 'text-with-img-row'].join(' ')}
                text={diskName}
                imgSrc={src}
                altImgText={altText}
                onClick={(e) => {
                    if (e.target === ref.current) return
                    if (emailSelectCloud.length > 0) {
                        setState(
                            {
                                disk: diskName,
                                access_token: emailSelectCloud[0].access_token,
                                cloud_email: emailSelectCloud[0].cloud_email,
                            } as ConnectedClouds);
                    }

                    if (emailsInDisk.length === 1) {
                        setState(cloudValues
                            .find(val => val.cloud_email === emailsInDisk[0]));
                        selectCloud(
                            cloudValues
                                .find(val => val.cloud_email === emailsInDisk[0])
                        )
                        return
                    }

                    if (currentDiskSelected.length === 0) {
                        setOpen(true)
                    }

                    if (emailSelectCloud[0] && currentSelectedDisk === emailSelectCloud[0].disk)
                        setOpen(true)
                }}
                subText={subText}
                rightIconProp={<RefreshIcon ref={ref}  onClick={(e) => {
                    e.preventDefault()
                    refreshDisk(currentDiskSelected[0])
                } }/>}
            />
            <Modal
                isOpen={isOpen}
                closeModal={() => setOpen(false)}
                children={<div style={{ width: '250px' }}>
                    <SelectorMulti
                        defaultValue={emailSelectCloud[0] ? [transformToOption(emailSelectCloud[0].cloud_email)] : null}
                        isMulti={false}
                        options={cloudValues
                            .map(val => transformToOption(val.cloud_email))
                        }
                        fontSize="var(--ft-body)"
                        onChange={(newValues): void => {
                            setState(cloudValues
                                .find(val => val.cloud_email === newValues[0]));
                            selectCloud(
                                cloudValues
                                    .find(val => val.cloud_email === newValues[0])
                            )
                        }} />
                </div>}
            />
        </>
    );
};