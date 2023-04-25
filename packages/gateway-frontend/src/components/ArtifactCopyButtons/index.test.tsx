import React from 'react'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { ArtifactConfig } from 'surgio/internal'
import { CATEGORIES } from 'surgio/constant'

import ArtifactCopyButtons from './'

describe('<ArtifactCopyButtons />', () => {
  test('renders component', () => {
    const artifact = generateArtifact()
    const { getByLabelText, getByTestId } = render(
      <SnackbarProvider>
        <ArtifactCopyButtons artifact={artifact} />
      </SnackbarProvider>
    )
    const $copyButton = getByTestId('copy-button')
    const $changeTypeButton = getByLabelText('select url type')

    expect($copyButton).toBeInTheDocument()
    expect($copyButton.textContent).toBe('复制地址')
    expect($changeTypeButton).toBeInTheDocument()
  })

  test('renders simple component', () => {
    const artifact = generateArtifact({
      categories: [CATEGORIES.SNIPPET],
    })
    const { queryByLabelText, getByTestId } = render(
      <SnackbarProvider>
        <ArtifactCopyButtons artifact={artifact} />
      </SnackbarProvider>
    )
    const $copyButton = getByTestId('copy-button')
    const $changeTypeButton = queryByLabelText('select url type')

    expect($copyButton).toBeInTheDocument()
    expect($copyButton.textContent).toBe('复制地址')
    expect($changeTypeButton).toBeNull()
  })
})

function generateArtifact(partial?: Partial<ArtifactConfig>): ArtifactConfig {
  return {
    name: 'test.conf',
    template: 'test',
    provider: 'test',
    ...partial,
  }
}
