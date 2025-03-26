import { message } from 'antd'
import axios, { HttpStatusCode } from 'axios'

const messageMap: any = {
  'request error': '请求失败，请稍后重试',
  'Network Error': '网络出错，请检查您的网络状况',
  'Request failed with status code 502': '服务器出小差了，请稍后重试',
}

axios.defaults.headers.post['Content-Type'] =
  'application/x-www-form-urlencoded; charset=utf-8'
axios.defaults.withCredentials = true
// axios.defaults.timeout = 30 * 1000
// 拦截器
axios.interceptors.request.use(function(config) {
  return config
})

function request(config: any = {}) {
  config = Object.assign(
    {
      withCredentials: true,
      // timeout: 30 * 1000,
    },
    config,
  )

  return axios(config)
    .then(response => {
      const { status, data, message: msg } = response.data || {}
      // 接受一个可定制响应的方式
      if (config._customResponse) return response

      if (status === HttpStatusCode.Ok) {
        return data
      } else {
        throw new Error(msg || 'request error')
      }
    })
    .catch(err => {
      if (messageMap[err.message]) {
        message.error(messageMap[err.message])
      } else {
        message.error(err.message)
      }
    })
}

// https://github.com/axios/axios/blob/master/lib/core/Axios.js
function get(url: string, params = {}, config = {}) {
  return request(
    Object.assign(config, {
      method: 'get',
      url,
      params,
    }),
  )
}

function post(url: string, data: any, config = {}) {
  return request(
    Object.assign(config, {
      method: 'post',
      url,
      data,
    }),
  )
}

function postJson(url: string, data: any, config = {}) {
  return request(
    Object.assign(
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      },
      config,
      {
        method: 'post',
        url,
        data,
      },
    ),
  )
}

export default request
export { axios, get, post, postJson, request }