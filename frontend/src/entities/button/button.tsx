import React, { FC } from 'react';
import './button.scss';
import { Button as UIButton } from '@mui/material';

export type VariantBtn = 'contained' | 'outlined' | 'text'
export type SizeBtn = 'small' | 'medium' | 'large'

interface ButtonProps {
	buttonText: string;
	clickHandler: (e: React.MouseEvent<HTMLButtonElement>) => void;
	disabled?: boolean;
	variant: VariantBtn;
	className?: string;
	size?: SizeBtn;
	startIconSrc?: string;
	fontSize?: string;
	isFullSize?:boolean;
}

export const Button: FC<ButtonProps> = ({
	clickHandler,
	buttonText,
	disabled,
	variant,
	className,
	size,
	startIconSrc,
	fontSize,
	isFullSize,
}) => {
	if (disabled === undefined || disabled === null) disabled = false;
	let clkHandler: (e: React.MouseEvent<HTMLButtonElement>) => void;
	if (!disabled) {
		clkHandler = clickHandler;
	} else {
		clkHandler = () => { };
	}

	return (
		<UIButton
			className={className}
			fullWidth={isFullSize}
			variant={variant}
			size={size || 'small'}
			disabled={disabled}
			onClick={clkHandler}
			startIcon={startIconSrc ? <img src={startIconSrc} /> : null}
			sx={{
				textTransform: 'none',
				fontSize: fontSize,
				justifyContent: variant === 'text' ? 'start' : null,
				padding: variant === 'text' ? '0' : null,
			}}
		>
			<p>{buttonText}</p>
		</UIButton>
	);
};
