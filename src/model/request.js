import axios from 'axios';
import qs from 'qs';
import {
  Message
} from 'element-ui';

const service = axios.create({
  // 设置超时时间
  timeout: 60000,
  baseURL: '',
});

/**
 * 请求前拦截
 * 用于处理需要在请求前的操作
 */
service.interceptors.request.use(
  (config) => {
    if (config.method.toLocaleLowerCase() === 'post') {
      if (config.data instanceof FormData) {
        Object.assign(config.headers, {
          'Content-Type': 'multipart/form-data',
        });
      } else {
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        config.data = qs.stringify(config.data);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
/**
 * 请求响应拦截
 * 用于处理需要在请求返回后的操作
 */
service.interceptors.response.use(
  (response) => {
    const responseCode = response.status;
    // 如果返回的状态码为200，说明接口请求成功，可以正常拿到数据
    // 否则的话抛出错误
    if (responseCode === 200) {
      let data = response.data;
      return Promise.resolve(data);
    } else {
      return Promise.reject(response);
    }
  },
  (error) => {
    // 服务器返回不是 2 开头的情况，会进入这个回调
    // 可以根据后端返回的状态码进行不同的操作
    if (!error.response) {
      if (error.message.includes('timeout')) {
        console.log('超时了');
        Message.error('请求超时，请检查网络是否连接正常');
      } else if (axios.isCancel(error)) {
        console.log('请求取消')
        Message.error(error.message);
        return Promise.reject();
      } else {
        // 可以展示断网组件
        console.log('断网了');
        Message.error('请求失败，请检查网络是否已连接');
      }
      return;
    }
    const responseCode = error.response.status;
    switch (responseCode) {
      // 404请求不存在
      case 404:
        Message({
          message: '网络请求不存在',
          type: 'error',
        });
        break;
        // 其他错误，直接抛出错误提示
      default:
        Message({
          message: error.response.data.msg || '服务器出现错误',
          type: 'error',
        });
    }
    return Promise.reject(error);
  }
);

export default service;