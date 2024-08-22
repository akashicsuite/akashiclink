import type { AxiosRequestConfig } from 'axios';

import { axiosBase } from './axios-helper';

// eslint-disable-next-line import/no-default-export
export default async function (path: string, config?: AxiosRequestConfig) {
  const { data } = await axiosBase.get(path, config);
  return data;
}
