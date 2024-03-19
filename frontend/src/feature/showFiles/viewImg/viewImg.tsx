import React, { FC } from 'react';


export interface ViewImgProps {
	imgSrc: string,
	altText?: string,
}

export const ViewImg: FC<ViewImgProps> = React.memo(function viewImg({ imgSrc, altText }: ViewImgProps) {
	return <div className='view-img'>
		<img src={imgSrc} alt={altText} />
	</div >
});

