import React, { FC, useRef } from 'react';
import { Button, VariantBtn } from '@entities/button/button';

import './buttonWithInput.scss'
import { Typography } from '@mui/material';
import CSS from 'csstype'
import { isNullOrUndefined } from '@helpers/isNullOrUndefined';
import { correctFormats } from '@helpers/isCorrectFormat';

interface TextWithInputProps {
  onChange: (a: FileList) => void;
  disabled: boolean;
  className?: string;
  buttonText: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  stylesOnRoot?: CSS.Properties;
  textStyles?:CSS.Properties;
  accept?: string,
}

export const TextWithInput: FC<TextWithInputProps> = ({
  onChange,
  disabled,
  className,
  buttonText,
  startIcon,
  endIcon,
  stylesOnRoot,
  textStyles,
  accept,
}) => {
  const hiddenFileInput = useRef(null);
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    hiddenFileInput.current.click();
  };

  return (
    <div key={`classnames_${className}`} onClick={handleClick} className={className || ''} style={{...stylesOnRoot}}>
      {startIcon}
      <Typography
        key={`typo_${className}`}
        sx={{
          cursor: 'pointer',
          color:'inherit',
          ...textStyles,
        }}
        onClick={handleClick}
      >{buttonText}</Typography>
      {endIcon}
      <input
        key={`input_${className}`}
        accept={isNullOrUndefined(accept) ? correctFormats : accept}
        multiple={true}
        ref={hiddenFileInput}
        type="file"
        disabled={disabled}
        className={'hidden-input'}
        onChange={(event) => {
          const files = event.target.files;
          if (files) {
            onChange(files);
          }
          event.target.value = '';
        }}
      ></input>
    </div>
  );
};
