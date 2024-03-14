import React, { FC, useRef } from 'react';
import { Button, Variants } from '@ui/button/Button';

interface ButtonWithInputProps {
  onChange: (a: FileList) => void;
  disabled: boolean;
  variant: Variants;
  className?: string;
  buttonText:string,
}

export const ButtonWithInput: FC<ButtonWithInputProps> = ({
	onChange,
	disabled,
	variant,
	className,
	buttonText,
}) => {
	const hiddenFileInput = useRef(null);
	const handleClick = () => {
		hiddenFileInput.current.click();
	};

	return (
		<div className={className || ''}>
			<Button
				variant={variant}
				buttonText={buttonText}
				clickHandler={handleClick}
				disabled={false}
			></Button>
			<input
				multiple={true}
				ref={hiddenFileInput}
				type="file"
				disabled={disabled}
				style={{ display: 'none' }}
				onChange={(event) => {
					const files = event.target.files;
					if (files) {
						onChange(files);
					}
					event.target.value ='';
				}}
			></input>
		</div>
	);
};