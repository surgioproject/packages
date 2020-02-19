import { render } from '@testing-library/react';
import React from 'react';
import { ArtifactConfig } from 'surgio/build/types';
import { CATEGORIES } from 'surgio/build/utils/constant';

import ActionButtons from './';

describe('<ActionButtons />', () => {
  test('renders empty component', () => {
    const artifact = generateArtifact();
    const { getByTestId } = render(<ActionButtons artifact={artifact} />);

    expect(getByTestId('action-buttons').innerHTML).toBe('');
  });

  test('renders surge button for artifact that has surge in its name', () => {
    const artifact = generateArtifact({
      name: 'Surge.conf',
    });
    const { getByTestId } = render(<ActionButtons artifact={artifact} />);

    expect(
      getByTestId('action-buttons')?.querySelector('a')?.textContent
    )
      .toBe('Add to Surge');
  });

  test('renders surge button for artifact that has surge category', () => {
    const artifact = generateArtifact({
      name: 'test.conf',
      categories: [
        CATEGORIES.SURGE,
      ]
    });
    const { getByTestId } = render(<ActionButtons artifact={artifact} />);

    expect(
      getByTestId('action-buttons')?.querySelector('a')?.textContent
    )
      .toBe('Add to Surge');
  });

  test('renders clash button for artifact that has clash in its name', () => {
    const artifact = generateArtifact({
      name: 'Clash.conf',
    });
    const { getByTestId } = render(<ActionButtons artifact={artifact} />);

    expect(
      getByTestId('action-buttons')?.querySelector('a')?.textContent
    )
      .toBe('Add to ClashX/CFW');
  });

  test('renders clash button for artifact that has clash category', () => {
    const artifact = generateArtifact({
      name: 'test.conf',
      categories: [
        CATEGORIES.CLASH,
      ]
    });
    const { getByTestId } = render(<ActionButtons artifact={artifact} />);

    expect(
      getByTestId('action-buttons')?.querySelector('a')?.textContent
    )
      .toBe('Add to ClashX/CFW');
  });

  test('renders quanx server remote button', () => {
    const artifact = generateArtifact({
      name: 'test.conf',
      categories: [
        CATEGORIES.QUANTUMULT_X_SERVER,
      ]
    });
    const { getByTestId } = render(<ActionButtons artifact={artifact} />);

    expect(
      getByTestId('quanx-server-remote')
    )
      .toBeInTheDocument();
  });

  test('renders quanx filter remote button', () => {
    const artifact = generateArtifact({
      name: 'test.conf',
      categories: [
        CATEGORIES.QUANTUMULT_X_FILTER,
      ]
    });
    const { getByTestId } = render(<ActionButtons artifact={artifact} />);

    expect(
      getByTestId('quanx-filter-remote')
    )
      .toBeInTheDocument();
  });

  test('renders quanx rewrite remote button', () => {
    const artifact = generateArtifact({
      name: 'test.conf',
      categories: [
        CATEGORIES.QUANTUMULT_X_REWRITE,
      ]
    });
    const { getByTestId } = render(<ActionButtons artifact={artifact} />);

    expect(
      getByTestId('quanx-rewrite-remote')
    )
      .toBeInTheDocument();
  });
});

function generateArtifact(partial?: Partial<ArtifactConfig>): ArtifactConfig {
  return {
    name: 'test.conf',
    template: 'test',
    provider: 'test',
    ...partial,
  };
}
