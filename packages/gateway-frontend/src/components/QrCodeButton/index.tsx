import React from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import QrCode from 'qrcode.react';

import QrCodeIcon from '../QrCodeIcon';

export interface QrCodeButtonProps {
  text: string;
}

export default function QrCodeButton(props: QrCodeButtonProps) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [qrValue, setQrValue] = React.useState<string>('');

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setQrValue(props.text);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div>
      <Button aria-describedby={id}
              variant="contained"
              size="medium"
              color="primary"
              onClick={handleClick}>
        <QrCodeIcon />
      </Button>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        {
          qrValue && (
            <Box display="flex" justifyContent="center">
              <QrCode includeMargin value={qrValue} />
            </Box>
          )
        }
      </Popover>
    </div>
  );
}
