import type { AxiosRequestConfig } from 'axios';

import { axiosBase } from './axios-helper';

export default async function (path: string, config?: AxiosRequestConfig) {
  const { data } = await axiosBase.get(path, config);
  return data;
}
