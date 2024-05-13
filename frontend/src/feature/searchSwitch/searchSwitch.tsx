import React, { FC, useEffect, useState } from 'react';
import {Typography, Dialog as UIDialog } from '@mui/material'
import { Switch } from '@entities/switch/switch';
import { useAppSelector } from '@store/store';
import { useDispatch } from 'react-redux';
import { newSearchValues } from '@store/searchRequest';

import './searchSwitch.scss'

interface SmartSwitchProps {
    isSmartSearch: boolean,
    changeSmartSearch: () => void,
}

export const SmartSwitch: FC<SmartSwitchProps> = ({
    isSmartSearch,
    changeSmartSearch,
}) => {
    const handleChange = () => {
        changeSmartSearch()
    }
    return (
        <div className={['smart-switch', isSmartSearch ? '' : 'not-selected-smart'].join(' ')}>
            <Typography fontSize={'var(--ft-paragraph)'}>Smart</Typography>
            <Switch checked={isSmartSearch}
                color='secondary'
                onChange={handleChange}
            ></Switch>
        </div>
    )
};