import React from 'react';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';

import ProviderCopyButtons from './';

describe('<ProviderCopyButtons />', () => {
  test('renders component', () => {
    const { getByLabelText, getByTestId } = render(
      <SnackbarProvider>
        <ProviderCopyButtons providerNameList={['test']} />
      </SnackbarProvider>
    );
    const $copyButton = getByTestId('copy-button');
    const $changeTypeButton = getByLabelText('select url type');

    expect($copyButton).toBeInTheDocument();
    expect($copyButton.textContent).toBe('复制 Surge Policy 地址');
    expect($changeTypeButton).toBeInTheDocument();
  });
});
