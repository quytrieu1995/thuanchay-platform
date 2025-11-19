/**
 * Version Service
 * Quản lý và kiểm tra phiên bản ứng dụng
 */

const VERSION_KEY = 'app_version'
const VERSION_CHECK_INTERVAL = 5 * 60 * 1000 // 5 phút
const BUILD_TIME_KEY = 'app_build_time'

/**
 * Lấy phiên bản hiện tại từ package.json hoặc localStorage
 */
export const getCurrentVersion = () => {
  // Lấy từ meta tag trong HTML (được inject bởi Vite plugin)
  const metaVersion = document.querySelector('meta[name="app-version"]')
  if (metaVersion) {
    return metaVersion.getAttribute('content') || '1.0.0'
  }
  
  // Fallback: lấy từ import.meta.env
  if (import.meta.env.VITE_APP_VERSION) {
    return import.meta.env.VITE_APP_VERSION
  }
  
  // Fallback: lấy từ localStorage
  const savedVersion = localStorage.getItem(VERSION_KEY)
  if (savedVersion) {
    return savedVersion
  }
  
  return '1.0.0'
}

/**
 * Lấy build time hiện tại
 */
export const getCurrentBuildTime = () => {
  return localStorage.getItem(BUILD_TIME_KEY) || new Date().toISOString()
}

/**
 * Lưu phiên bản hiện tại
 */
export const saveCurrentVersion = (version, buildTime = null) => {
  localStorage.setItem(VERSION_KEY, version)
  if (buildTime) {
    localStorage.setItem(BUILD_TIME_KEY, buildTime)
  }
}

/**
 * So sánh hai phiên bản (semantic versioning)
 * @param {string} version1 - Phiên bản 1
 * @param {string} version2 - Phiên bản 2
 * @returns {number} -1 nếu version1 < version2, 0 nếu bằng, 1 nếu version1 > version2
 */
export const compareVersions = (version1, version2) => {
  const v1parts = version1.split('.').map(Number)
  const v2parts = version2.split('.').map(Number)
  
  const maxLength = Math.max(v1parts.length, v2parts.length)
  
  for (let i = 0; i < maxLength; i++) {
    const v1part = v1parts[i] || 0
    const v2part = v2parts[i] || 0
    
    if (v1part < v2part) return -1
    if (v1part > v2part) return 1
  }
  
  return 0
}

/**
 * Kiểm tra phiên bản mới từ server/file
 * So sánh build hash và build time hiện tại với giá trị đã lưu
 */
export const checkForNewVersion = async () => {
  try {
    // Lấy build hash và build time hiện tại từ HTML (được inject khi build)
    const currentBuildHash = await getBuildHash()
    const currentBuildTime = await getBuildTime()
    
    // Lấy giá trị đã lưu trong localStorage
    const savedBuildHash = localStorage.getItem('app_build_hash')
    const savedBuildTime = getCurrentBuildTime()
    
    // Nếu không có giá trị đã lưu, lưu giá trị hiện tại và không có update
    if (!savedBuildHash && currentBuildHash) {
      localStorage.setItem('app_build_hash', currentBuildHash)
    }
    if (!savedBuildTime && currentBuildTime) {
      saveCurrentVersion(getCurrentVersion(), currentBuildTime)
    }
    
    // Kiểm tra nếu build hash khác (có file mới được upload)
    if (currentBuildHash && savedBuildHash && currentBuildHash !== savedBuildHash) {
      return {
        hasUpdate: true,
        currentVersion: getCurrentVersion(),
        newVersion: getCurrentVersion(),
        buildHash: currentBuildHash,
        buildTime: currentBuildTime || new Date().toISOString()
      }
    }
    
    // Kiểm tra nếu build time khác
    if (currentBuildTime && savedBuildTime && currentBuildTime !== savedBuildTime) {
      return {
        hasUpdate: true,
        currentVersion: getCurrentVersion(),
        newVersion: getCurrentVersion(),
        buildTime: currentBuildTime,
        buildHash: currentBuildHash
      }
    }
    
    // Kiểm tra từ file version.json (nếu có)
    try {
      const response = await fetch('/version.json?t=' + Date.now(), {
        cache: 'no-cache'
      })
      if (response.ok) {
        const data = await response.json()
        const serverBuildHash = data.buildHash || data.hash
        const serverBuildTime = data.buildTime || data.timestamp
        
        if (serverBuildHash && savedBuildHash && serverBuildHash !== savedBuildHash) {
          return {
            hasUpdate: true,
            currentVersion: getCurrentVersion(),
            newVersion: data.version || getCurrentVersion(),
            buildHash: serverBuildHash,
            buildTime: serverBuildTime
          }
        }
        
        if (serverBuildTime && savedBuildTime && serverBuildTime !== savedBuildTime) {
          return {
            hasUpdate: true,
            currentVersion: getCurrentVersion(),
            newVersion: data.version || getCurrentVersion(),
            buildTime: serverBuildTime,
            buildHash: serverBuildHash
          }
        }
      }
    } catch (error) {
      // File version.json không tồn tại, bỏ qua
    }
    
    return {
      hasUpdate: false,
      currentVersion: getCurrentVersion(),
      newVersion: getCurrentVersion()
    }
  } catch (error) {
    console.error('Error checking for new version:', error)
    return {
      hasUpdate: false,
      currentVersion: getCurrentVersion(),
      error: error.message
    }
  }
}

/**
 * Lấy build hash từ index.html hoặc meta tag
 */
const getBuildHash = async () => {
  try {
    // Kiểm tra meta tag trong document (được inject bởi Vite plugin)
    const metaHash = document.querySelector('meta[name="build-hash"]')
    if (metaHash) {
      return metaHash.getAttribute('content')
    }
    
    // Hoặc kiểm tra từ file version.json (được tạo khi build)
    const response = await fetch('/version.json?t=' + Date.now(), {
      cache: 'no-cache'
    })
    if (response.ok) {
      const data = await response.json()
      return data.buildHash || data.hash
    }
  } catch (error) {
    // File không tồn tại hoặc lỗi, bỏ qua
  }
  
  return null
}

/**
 * Lấy build time từ meta tag hoặc file
 */
const getBuildTime = async () => {
  try {
    // Kiểm tra meta tag (được inject bởi Vite plugin)
    const metaBuildTime = document.querySelector('meta[name="build-time"]')
    if (metaBuildTime) {
      return metaBuildTime.getAttribute('content')
    }
    
    // Hoặc từ file version.json (được tạo khi build)
    const response = await fetch('/version.json?t=' + Date.now(), {
      cache: 'no-cache'
    })
    if (response.ok) {
      const data = await response.json()
      return data.buildTime || data.timestamp
    }
  } catch (error) {
    // File không tồn tại, bỏ qua
  }
  
  return null
}

/**
 * Cập nhật phiên bản và reload trang
 */
export const updateVersion = (newVersion, buildTime = null, buildHash = null) => {
  saveCurrentVersion(newVersion, buildTime)
  if (buildHash) {
    localStorage.setItem('app_build_hash', buildHash)
  }
  
  // Reload trang để tải phiên bản mới
  window.location.reload()
}

/**
 * Khởi tạo phiên bản khi app khởi động
 */
export const initializeVersion = () => {
  const currentVersion = getCurrentVersion()
  const buildTime = getCurrentBuildTime()
  
  // Lưu phiên bản hiện tại nếu chưa có
  if (!localStorage.getItem(VERSION_KEY)) {
    saveCurrentVersion(currentVersion, buildTime)
  }
  
  // Lưu build hash nếu có
  const metaHash = document.querySelector('meta[name="build-hash"]')
  if (metaHash) {
    const hash = metaHash.getAttribute('content')
    if (hash) {
      localStorage.setItem('app_build_hash', hash)
    }
  }
  
  // Lưu build time nếu có
  const metaBuildTime = document.querySelector('meta[name="build-time"]')
  if (metaBuildTime) {
    const time = metaBuildTime.getAttribute('content')
    if (time) {
      localStorage.setItem(BUILD_TIME_KEY, time)
    }
  }
  
  return {
    version: currentVersion,
    buildTime
  }
}

