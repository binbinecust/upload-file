import request from './request';
const {
  baseUrl
} = require('../../config');
export default {
  // 'uploadForm': request.post(`${baseUrl}/uploadForm`, ),
  uploadEncode: (payload) => request.post(`${baseUrl}/uploadEncode`, payload),
  uploadEncodeBinary: (payload) => request.post(`${baseUrl}/uploadEncodeBinary`, payload),
  uploadFormData: (payload) => request.post(`${baseUrl}/uploadFormData`, payload),
  largeUpload: (payload, onUploadProgress) => request.post(`${baseUrl}/largeUpload`, payload, {
    onUploadProgress
  }),
  mergeChunks: (payload) => request.post(`${baseUrl}/mergeChunks`, payload),
  checkFile: (payload) => request.post(`${baseUrl}/checkFile`, payload),
};