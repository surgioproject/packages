import React from 'react'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import ProviderCopyButtons from './'

describe('<ProviderCopyButtons />', () => {
  test('renders component', () => {
    const { getByTestId } = render(
      <SnackbarProvider>
        <ProviderCopyButtons providerNameList={['test']} />
      </SnackbarProvider>
    )
    const $copyButton = getByTestId('copy-button')
    const $changeTypeButton = getByTestId('format-select')

    expect($copyButton).toBeInTheDocument()
    expect($copyButton.textContent).toBe('复制')
    expect($changeTypeButton).toBeInTheDocument()
  })
})
