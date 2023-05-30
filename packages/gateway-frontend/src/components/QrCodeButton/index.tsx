import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import React, { useCallback, useState } from 'react'
import QrCode from 'qrcode.react'
import { QrCodeIcon } from 'lucide-react'

export interface QrCodeButtonProps {
  text: string
}

export default function QrCodeButton(props: QrCodeButtonProps) {
  const [qrValue, setQrValue] = useState<string>('')

  const handleClick = useCallback(() => {
    setQrValue(props.text)
  }, [props.text])

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <Button onClick={handleClick}>
            <QrCodeIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto h-auto p-0" side="top">
          {qrValue && (
            <div className="flex justify-center" data-text={props.text}>
              <QrCode includeMargin value={qrValue} />
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
