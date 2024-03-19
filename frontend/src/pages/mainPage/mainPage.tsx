import React, { FC } from 'react';
import { Sidebar } from '@widgets/sidebar/sidebar';
import { SearchLine } from '@widgets/searchLine/searchLine';

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
