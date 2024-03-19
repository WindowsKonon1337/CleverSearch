import { useAppSelector } from '@store/store';
import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { useDeleteFileMutation } from '@api/filesApi';
import { useSearchMutation } from '@api/searchApi';
import { changeDir, changeDisk } from '@store/currentDirectoryAndDisk';
import { RenderFields } from '@ui/renderFields/renderFields';
import { useLocation, useNavigate } from 'react-router-dom';
import { switchToSearch, switchToShow } from '@store/whatToShow';
import { transfromToShowRequestString } from '@api/transforms';

interface ShowSearchedFilesProps { }


export const ShowSearchedFiles: FC<ShowSearchedFilesProps> = () => {
    const [deleteFile] = useDeleteFileMutation();
    const [search, { data, ...searchResp }] = useSearchMutation({ fixedCacheKey: 'search' });
    const dispatch = useDispatch();
    const navigate = useNavigate()

    const location = useLocation();

    useEffect(() => {
        dispatch(switchToSearch())
    }, [location])

    const paramsSearch = useAppSelector((state) => state.searchRequest);

    return (
        < div className="data-show" >
            <div className="data-show__header">
                <p>Результаты поиска:</p>
                <div
                    style={{ color: 'var(--main-color-500)' }}
                    onClick={() =>
                        navigate(-1)
                    }
                >
                    Назад
                </div>
            </div>
            <RenderFields
                data={data?.body}
                error={searchResp.error}
                isError={searchResp.isError}
                isLoading={searchResp.isLoading}
                dispatch={dispatch}
                deleteFile={
                    (fileName: string): void => {
                        deleteFile([fileName]);
                        setTimeout(() =>
                            search(paramsSearch),
                            100);
                    }}
                openFolder={(path) => {
                    dispatch(changeDir({ dirs: path }))
                    dispatch(changeDisk('all'));
                    dispatch(switchToShow());

                    const url = transfromToShowRequestString({ limit: 10, offset: 0, dir: path });
                    navigate(url)
                }}
            />
        </ >
    );
};
