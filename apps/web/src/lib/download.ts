export function triggerDownload(url: string) {
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.style.width = '0px'
  iframe.style.height = '0px'
  document.body.appendChild(iframe)
  iframe.src = url
  setTimeout(() => document.body.removeChild(iframe), 30000)
}
