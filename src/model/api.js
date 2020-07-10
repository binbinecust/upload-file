import request from './request';
import axios from 'axios';
const { baseUrl } = require('../../config');
export default {
  // 'uploadForm': request.post(`${baseUrl}/uploadForm`, ),
  uploadEncode: (payload) => request.post(`${baseUrl}/uploadEncode`, payload),
  // uploadEncodeBinary: (payload) => request.post(`${baseUrl}/uploadEncodeBinary`, payload),
  uploadFormData: (payload) =>
    request.post(`${baseUrl}/uploadFormData`, payload),
  largeUpload: (payload, onUploadProgress) =>
    request.post(`${baseUrl}/largeUpload`, payload, {
      onUploadProgress
    }),
  mergeChunks: (payload) => request.post(`${baseUrl}/mergeChunks`, payload),
  checkFile: (payload) => request.post(`${baseUrl}/checkFile`, payload),

  // hash
  largeUploadHash: (payload, onUploadProgress, cancels, index) =>
    request.post(`${baseUrl}/largeUploadHash`, payload, {
      cancelToken: new axios.CancelToken(function executor(c) {
        // 设置 cancel token
        cancels[index] = c;
      }),
      onUploadProgress
    }),
  mergeChunksHash: (payload) =>
    request.post(`${baseUrl}/mergeChunksHash`, payload),
  checkFileHash: (payload) => request.post(`${baseUrl}/checkFileHash`, payload)
};
