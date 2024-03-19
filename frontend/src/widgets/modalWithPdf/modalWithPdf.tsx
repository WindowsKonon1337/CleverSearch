import React, { FC } from 'react';
import { Modal } from '@feature/modal/modal';
import { ViewPDF } from '@feature/showFiles/viewPDF/viewPDF';
import './modalWithPDF.scss'

interface ModalWithPDFProps {
    isOpen: boolean;
    close: () => void;
    pdfURL: string;
    pageNumber?: number;
    searchString?: string;
}

export const ModalWithPDF: FC<ModalWithPDFProps> = ({
    isOpen,
    close,
    pdfURL,
    pageNumber,
    searchString,
}) => {
    return (
        <div>
            <Modal className={'modal__pdf-show'} isOpen={isOpen} closeModal={close}>
                <ViewPDF pdfURL={pdfURL} openPageInPDF={pageNumber} searchString={searchString}></ViewPDF>
            </Modal>
        </div >
    );
};