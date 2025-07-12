// 验证是否为外部链接
export const isExternal = (path: string): boolean => {
    return /^(https?:|mailto:|tel:)/.test(path)
  }
  
  // 验证用户名
  export const validateUsername = (username: string): boolean => {
    return username.length >= 3
  }
  
  // 验证密码
  export const validatePassword = (password: string): boolean => {
    return password.length >= 6
  }