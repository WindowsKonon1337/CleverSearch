import { useShowMutation } from '@api/searchApi';
import { useAppSelector } from '@store/store';
import React, { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useDeleteFileMutation } from '@api/filesApi';
import { changeDir, changeDisk } from '@store/currentDirectoryAndDisk';
import { BreadCrumps } from '@ui/breadCrumps/breadCrumps';
import { RenderFields } from '@ui/renderFields/renderFields';
import { useSearchParams } from 'react-router-dom';
import { transformToShowParams } from '@models/searchParams';
import { transfromToShowRequestString } from '@api/transforms';
import { useNavigate } from 'react-router-dom';


interface ShowShowedFilesProps { }

const useShowParams = () => {
    const [searchParams] = useSearchParams();
    const searchParamsToObject = (params) => {
        const result: Record<string, string> = {};
        params.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    };

    return searchParamsToObject(searchParams)
}


export const ShowShowedFiles: FC<ShowShowedFilesProps> = () => {
    const navigate = useNavigate();

    const [show, showResp] = useShowMutation({ fixedCacheKey: 'show' });
    const { currentDisk, dirs } = useAppSelector(
        (state) => state.currentDirDisk
    );

    useEffect(() => {
        show({ limit: 10, offset: 0, disk: currentDisk, dir: dirs });
    }, [dirs, currentDisk])

    const [deleteFile] = useDeleteFileMutation();
    const dispatch = useDispatch();

    const urlParams = useShowParams()
    const [params] = useState(transformToShowParams(urlParams))

    useEffect(() => {
        dispatch(changeDir({ dirs: params.dir }))
        dispatch(changeDisk(params.disk))
    }, [params])

    return (
        <div className="data-show">
            <div className="data-show__header">
                <BreadCrumps dirs={dirs} />
                <div
                    style={{ color: 'var(--main-color-500)' }}
                    onClick={() => {
                        const url = transfromToShowRequestString(
                            { ...params, dir: dirs.slice(0, -1) || [] }
                        )
                        dispatch(
                            changeDir({
                                dirs: dirs.slice(0, -1) || [],
                            })
                        )
                        navigate(url, { replace: true })
                    }
                    }
                >
                    Назад
                </div>
            </div>
            <RenderFields
                data={showResp.data?.body}
                error={showResp.error}
                isError={showResp.isError}
                isLoading={showResp.isLoading}
                dispatch={dispatch}
                deleteFile={
                    (fileName: string): void => {
                        deleteFile([fileName]);
                        setTimeout(() =>
                            show(
                                { limit: 10, offset: 0, disk: currentDisk, dir: dirs }),
                            100);
                    }}
                openFolder={(path) => {
                    const url = transfromToShowRequestString(
                        { ...params, dir: path || [] }
                    )
                    navigate(url, { replace: true })
                }}
            />
        </div>
    );
};
