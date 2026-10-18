// The licence page. After checkout Stripe sends the buyer here with `?session=`, and the licence
// server (the tajga-licensing worker) says which key was bought. Without it, the page offers to
// email a lost key again.

// The same as LICENCE_SERVER in the app.
const SERVER = 'https://licence.tajga.studio'
const APP = 'headcam-studio'

const $ = (id) => document.getElementById(id)
const session = new URLSearchParams(location.search).get('session')
let key = ''

// The key, with line breaks allowed after its dashes only.
function showKeyText(text) {
  $('key').replaceChildren(
    ...text.split('-').flatMap((part, i) => (i ? ['-', document.createElement('wbr'), part] : [part])),
  )
}

async function showKey() {
  $('find').hidden = true
  $('waiting').hidden = false
  try {
    const response = await fetch(`${SERVER}/key?session=${encodeURIComponent(session)}`)
    const answer = await response.json()
    if (!response.ok) throw new Error(answer.message)
    key = answer.key
    showKeyText(key)
    $('open').href = `headcam-studio://activate?key=${encodeURIComponent(key)}`
    if (answer.email) {
      $('emailed').textContent = `Also sent to ${answer.email}`
      $('emailed').hidden = false
    }
    $('bought').hidden = false
  } catch (error) {
    $('failed').textContent = `The key could not be fetched (${error.message}). It is in your email, or ask for it again here.`
    $('failed').hidden = false
    $('find').hidden = false
  } finally {
    $('waiting').hidden = true
  }
}

$('copy').addEventListener('click', async () => {
  await navigator.clipboard.writeText(key)
  $('copy').querySelector('span').textContent = 'Copied'
})

$('find-form').addEventListener('submit', async (event) => {
  event.preventDefault()
  const button = event.submitter
  button.disabled = true
  await fetch(`${SERVER}/resend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app: APP, email: $('email').value }),
  }).catch(() => {})
  $('sent').hidden = false
  button.disabled = false
})

if (session) showKey()
