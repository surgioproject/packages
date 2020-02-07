import ky from 'ky';

export const defaultFetcher = <T>(url: string): Promise<T> => ky.get(url).then(res => res.json()).then(json => json.data);

export const getDownloadUrl = (artifactName: string, inline: boolean = true, accessToken?: string | null): string => {
  const urlObject = new URL(`/get-artifact/${artifactName}`, window.location.origin);

  if (accessToken) {
    urlObject.searchParams.set('access_token', accessToken);
  }

  if (!inline) {
    urlObject.searchParams.set('dl', '1');
  }

  return urlObject.toString();
};

export const getToken = (): string | null => {
  const urlObject = new URL(window.location.href);

  return urlObject.searchParams.get('access_token');
};
