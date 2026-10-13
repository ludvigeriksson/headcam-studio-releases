// Fills in the download links from the app's latest release and points out the installer for the
// visitor's computer. The releases are those of a public repository that the app's release
// workflow publishes to; the installed apps update themselves from the same place. Without an
// answer from GitHub the buttons keep the link they have in the page: the releases page.

const RELEASES = 'ludvigeriksson/headcam-studio-releases'
/** The installers among a release's files, by what is on the page as `data-platform`. */
const INSTALLER = /-(mac-arm64|mac-x64|win-x64)\.(dmg|exe)$/

const PLATFORM_LABELS = { mac: 'Download for Mac', windows: 'Download for Windows' }

function visitorSystem() {
  const ua = navigator.userAgent
  if (/Android|iPhone|iPad|iPod/.test(ua)) return 'mobile'
  // An iPad asking for the desktop site calls itself a Mac; it has a touch screen, a Mac has not.
  if (/Macintosh/.test(ua)) return navigator.maxTouchPoints > 1 ? 'mobile' : 'mac'
  if (/Windows/.test(ua)) return 'windows'
  return 'other'
}

/** Apple silicon or Intel, where the browser says (Chrome and Edge do; Safari does not). */
async function macArchitecture() {
  try {
    const hints = await navigator.userAgentData?.getHighEntropyValues(['architecture'])
    if (hints?.architecture === 'arm') return 'mac-arm64'
    if (hints?.architecture === 'x86') return 'mac-x64'
  } catch {
    // Not available: the visitor chooses.
  }
  return null
}

function megabytes(bytes) {
  return `${Math.round(bytes / 1_000_000)} MB`
}

/** The newest version and its installers, or null when GitHub does not say. */
async function latestRelease() {
  try {
    const response = await fetch(`https://api.github.com/repos/${RELEASES}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json' },
    })
    if (!response.ok) return null
    const release = await response.json()
    const files = {}
    for (const asset of release.assets ?? []) {
      const platform = INSTALLER.exec(asset.name)?.[1]
      if (platform) files[platform] = { url: asset.browser_download_url, size: asset.size }
    }
    return {
      version: release.tag_name.replace(/^v/, ''),
      date: release.published_at?.slice(0, 10),
      files,
    }
  } catch {
    return null
  }
}

async function main() {
  const system = visitorSystem()
  const heroNote = document.getElementById('hero-note')
  if (system === 'mobile') {
    heroNote.textContent = 'For Mac and Windows computers. Open this page on yours to download.'
  }

  const release = await latestRelease()
  const files = release?.files ?? {}
  for (const card of document.querySelectorAll('.download')) {
    const file = files[card.dataset.platform]
    if (!file) continue
    card.querySelector('a').href = file.url
    card.querySelector('.size').textContent = `Version ${release.version} · ${megabytes(file.size)}`
  }
  if (release) {
    document.getElementById('footer-version').textContent = release.date
      ? `Version ${release.version}, ${release.date}`
      : `Version ${release.version}`
  }

  const suggested =
    system === 'windows' ? 'win-x64' : system === 'mac' ? await macArchitecture() : null
  if (system === 'mac') document.getElementById('which-mac').hidden = suggested !== null

  const heroButton = document.getElementById('hero-download')
  if (system in PLATFORM_LABELS) heroButton.textContent = PLATFORM_LABELS[system]
  if (suggested) {
    document.querySelector(`[data-platform="${suggested}"]`).classList.add('suggested')
    if (files[suggested]) {
      heroButton.href = files[suggested].url
      heroNote.textContent = `Version ${release.version}. Also for ${system === 'mac' ? 'Windows' : 'macOS'}.`
    }
  } else {
    // Nothing to single out: all three look the same, each with a full button.
    for (const card of document.querySelectorAll('.download')) card.classList.add('suggested')
    document.getElementById('downloads').classList.add('plain')
  }
}

main()
