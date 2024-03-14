import { FC, useState } from 'react';
import { useSearchMutation } from '@api/searchApi';
import { diskTypes, fileTypes } from '@models/searchParams';
import { Input, InputVariants } from '@ui/input/input';
import './searchLine.scss';

import React from 'react';

import { useDispatch } from 'react-redux';
import { switchToSearch } from '@store/whatToShow';
import { SearchBox } from './searchBox/searchBox';
import { changeDir } from '@store/currentDirectoryAndDisk';
import {newValues} from '@store/searchRequest';

import SearchSVG from '@icons/Search.svg';
import FilterSVG from '@icons/Filter.svg';

interface SearchLineProps {}

export const SearchLine: FC<SearchLineProps> = () => {
	const [isBoxOpen, setisBoxOpen] = useState(false);
	const [searchValue, setsearchValue] = useState({
		smartSearch: false,
		fileType: ['all' as fileTypes],
		query: '',
		dir: '',
		disk: ['all'] as diskTypes[],
	});

	const [search, response] = useSearchMutation({fixedCacheKey: 'search'});
	const dispatch = useDispatch();

	return (
		<div className="search-line">
			<div className="icon-with-text">
				<div className="search-icon-container">
					<img alt="search icon" className="search-icon" src={SearchSVG}></img>
				</div>
				<div className="search-text">
					<Input
						onKeyDown={(e) => {
							if (e.key.toLowerCase() === 'enter') {
								search(searchValue);
								dispatch(newValues(searchValue));
								dispatch(switchToSearch());
								dispatch(changeDir({ dirs: [], current: '' }));
							}
						}}
						onChange={(e) =>
							setsearchValue({ ...searchValue, query: e.target.value })
						}
						disabled={response.isLoading}
						placeholder={'Найдём любой файл'}
						variant={InputVariants.default}
						type={'search'}
						className={['search-input']}
						value={searchValue.query}
					/>
				</div>
			</div>
			<div
				className="filter-icon-container"
				onClick={() => setisBoxOpen(!isBoxOpen)}
			>
				<img alt="filter icon" className="filter-icon" src={FilterSVG}></img>
			</div>
			{isBoxOpen ? (
				<div className="place-for-search-box">
					<SearchBox
						changeState={setsearchValue}
						state={searchValue}
						closeDrop={() => setisBoxOpen(false)}
						search={() => {
							dispatch(newValues(searchValue));
							search(searchValue);
						}}
					></SearchBox>
				</div>
			) : (
				''
			)}
		</div>
	);
};