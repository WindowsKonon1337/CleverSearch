import React, { FC, useState } from 'react';
import './fileShow.scss';
import { SharedModal } from '@widgets/sharedModal/sharedModal'

interface FileShowProps {
	iconSrc: string;
	altText?: string;
	filename: string;
	date: string;
	size: string;
	onClick?: () => void;
	onDelete: () => void;
	dirPath?: string
	config: { isDelete?: boolean, isShare?: boolean }
}

export const FileShow: FC<FileShowProps> = ({
	iconSrc,
	altText,
	filename,
	date,
	size,
	onClick,
	onDelete,
	dirPath,
	config
}) => {
	const [isOpen, setOpen] = useState(false)

	return (
		<>
			<div className="file-show-line" onClick={onClick} >
				<div className='container-file-info'>
					<div className="icon-placement">
						<img className="icon" src={iconSrc} alt={altText ? altText : ''}></img>
					</div>
					<div className="filename-with-date">
						<div className="filename">{filename}</div>
						<div className="date">{date}</div>
					</div>
				</div>
				<div className='additional-functions-file'>
					{config.isDelete ?
						<div onClick={(event) => { event.stopPropagation(); onDelete(); }} >Delete</div>
						: null}
					{config.isShare ?
						<div
							onClick={(event) => { event.stopPropagation(); setOpen(true); }}
						>
							Share
						</div>
						: null}
				</div>
				{config.isShare ?
					<SharedModal
						isOpen={isOpen}
						close={() => setOpen(false)}
						dirPath={dirPath}
					/>
					: null}
				<div className="size">{size}</div>
			</div>
		</>
	);
}
