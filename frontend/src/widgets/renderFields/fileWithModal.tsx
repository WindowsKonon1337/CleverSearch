import { FileShow } from '@feature/fileShow/fileShow';
import { fileFile } from '@models/searchParams';
import React, { FC, useState } from 'react';
import './renderFields.scss';

export interface renderReturns {
	renderModal: () => React.ReactNode | null;
	clickHandler: () => void;
	imgSrc: string;
}

export interface FileWithModalProps {
	file: fileFile,
	deleteFile: (fileName: string) => void,
	getFileProps: (file: fileFile, isOpen: boolean, changeState: (isOpen: boolean) => void) => renderReturns
}


export const FileWithModal: FC<FileWithModalProps> = ({
	file,
	deleteFile,
	getFileProps,
}) => {
	const [isOpen, setOpen] = useState(false)

	const props = getFileProps(file, isOpen, (isOpen) => { setOpen(isOpen) })

	const renderModal = props.renderModal;
	const clickHandler = props.clickHandler;
	const iconSrc = props.imgSrc;

	const splitPath = file.path.split('/')
	return (
		<>
			<FileShow
				key={file.id}
				iconSrc={iconSrc}
				altText={file.is_dir ? 'folder' : 'file'}
				filename={file.is_dir ? splitPath[splitPath.length - 1] : file.filename}
				date={file.date}
				size={file.size}
				onDelete={() => deleteFile(file.path)}
				onClick={() => { setOpen(true); clickHandler() }}
				dirPath={file.is_dir ? file.path : ''}
			></FileShow>
			{renderModal()}
		</>
	);

};

