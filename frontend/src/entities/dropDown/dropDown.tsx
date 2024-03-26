import React, { FC, useEffect, useRef, useState } from 'react';
import './dropDown.scss';
import { relative } from 'path';

export type WhereToPlace = 'up' | 'down'

interface DropDownProps {
	children: React.ReactNode
	isOpen: boolean,
	close: () => void,
	onClick: () => void,
	mainElement: React.ReactNode,
}

export const DropDown: FC<DropDownProps> = ({
	children,
	isOpen,
	close,
	onClick,
	mainElement,
}) => {
	const dropDownRef = useRef<HTMLDivElement>(null)
	const [displayElements, setdisplayElements] = useState(false);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropDownRef.current && (dropDownRef.current === event.target
				|| !dropDownRef.current.contains(event.target as Node & EventTarget))) {
				close()
				return
			}
		}

		function handleEsc(event: KeyboardEvent) {
			if (event.key.toLowerCase() === 'escape') {
				close()
			}
		}

		document.addEventListener('keydown', handleEsc);
		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('keydown', handleEsc);
		};
	}, [dropDownRef]);

	useEffect(() => {
		if (!isOpen) {
			setTimeout(() => {
				setdisplayElements(isOpen)
			}, 150)
			return;
		}
		setdisplayElements(isOpen)
	}, [isOpen])

	return (
		// TODO remove css inline
		<div style={{ position: 'relative', height: 'fit-content' }}>
			<div className='dropdown-menu'
				onClick={(e) => {
					e.stopPropagation();
					onClick();
				}}>
				{mainElement}
			</div>
			<div ref={dropDownRef} className={['dropdown', isOpen ? '' : 'dropdown-hide'].join(' ')}>
				{displayElements ? <div>{children}</div> : null}
			</div>
		</div>
	);
};
