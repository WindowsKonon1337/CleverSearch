import React, { FC } from 'react';
import { Modal } from '@feature/modal/modal'
import { Shared } from '@feature/shared/shared';

interface SharedModalProps {
	dirPath: string,
	close: () => void,
	isOpen: boolean,
}

export const SharedModal: FC<SharedModalProps> = ({ dirPath, close, isOpen }) => {
	return (
		<Modal
			isOpen={isOpen}
			closeModal={close}
			className={'modal-shared'}>
			<Shared
				className=''
				dirPath={dirPath}
			></Shared>
		</Modal>
	);
};
