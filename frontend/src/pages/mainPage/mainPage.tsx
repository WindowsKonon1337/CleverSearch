import React, { FC, useState } from 'react';
import { Sidebar } from '@modules/sidebar/sidebar';
import { SearchLine } from '@modules/searchLine/searchLine';

import { Outlet } from 'react-router-dom';

export const MainPage: FC = () => {
	return <div className="App">
		<Sidebar></Sidebar>
		<div className="main-app">
			<SearchLine></SearchLine>
			<Outlet></Outlet>
		</div>
	</div>
};
