import React from 'react'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { ArtifactConfig } from 'surgio/internal'
import { CATEGORIES } from 'surgio/constant'

import ArtifactCopyButtons from './'

describe('<ArtifactCopyButtons />', () => {
  test('renders component', () => {
    const artifact = generateArtifact()
    const { getByTestId } = render(
      <SnackbarProvider>
        <ArtifactCopyButtons artifact={artifact} />
      </SnackbarProvider>
    )
    const $copyButton = getByTestId('copy-button')
    const $changeTypeButton = getByTestId('format-select')

    expect($copyButton).toBeInTheDocument()
    expect($copyButton.textContent).toBe('复制')
    expect($changeTypeButton).toBeInTheDocument()
  })

  test('renders simple component', () => {
    const artifact = generateArtifact({
      categories: [CATEGORIES.SNIPPET],
    })
    const { getByTestId } = render(
      <SnackbarProvider>
        <ArtifactCopyButtons artifact={artifact} />
      </SnackbarProvider>
    )
    const $copyButton = getByTestId('copy-button')
    const $changeTypeButton = getByTestId('format-select')

    expect($copyButton).toBeInTheDocument()
    expect($copyButton.textContent).toBe('复制')
    expect($changeTypeButton).toBeDisabled()
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
