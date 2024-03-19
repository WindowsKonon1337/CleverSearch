import React, { FC } from 'react';
import { Modal } from '@feature/modal/modal';
import './modalWithImg.scss'
import { ViewImg } from '@feature/showFiles/viewImg/viewImg';

export interface ModalWithImgProps {
    isOpen: boolean
    close: () => void
    imgSrc: string
    altText?: string
}

export const ModalWithImg: FC<ModalWithImgProps> = ({
    isOpen,
    close,
    imgSrc,
    altText,
}) => {
    return (
        <div>
            <Modal className={'modal__img-show'} isOpen={isOpen} closeModal={close}>
                <ViewImg imgSrc={imgSrc} altText={altText} />
            </Modal>
        </div >
    );
};