const $ = (id) => document.getElementById(id);
let latest = null;
const setStatus = (text) => {
  $('status').textContent = text;
};
$('theme').addEventListener('click', () => {
  document.documentElement.style.colorScheme =
    document.documentElement.style.colorScheme === 'light' ? 'dark' : 'light';
});
$('generate').addEventListener('click', async () => {
  $('generate').disabled = true;
  setStatus('Generating secure configuration...');
  try {
    const response = await fetch('/api/warp', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ location: $('location').value }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error?.message ?? 'Unable to generate configuration.');
    latest = data;
    $('metadata').innerHTML =
      `<div><dt>Requested preference</dt><dd>${data.location.requested}</dd></div><div><dt>Routing</dt><dd>Automatic Cloudflare routing</dd></div><div><dt>Endpoint</dt><dd>${data.location.resolved}</dd></div><div><dt>Observed location</dt><dd>Not checked</dd></div>`;
    $('result').hidden = false;
    $('preview').hidden = true;
    setStatus('');
  } catch {
    setStatus('Unable to generate configuration. Please try again.');
  } finally {
    $('generate').disabled = false;
  }
});
$('copy').addEventListener('click', async () => {
  if (latest) {
    await navigator.clipboard.writeText(latest.config);
    $('copy').textContent = 'Copied!';
    setTimeout(() => ($('copy').textContent = 'Copy config'), 1600);
  }
});
$('download').addEventListener('click', () => {
  if (latest) {
    const link = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([latest.config], { type: 'text/plain' })),
      download: latest.filename,
    });
    link.click();
    URL.revokeObjectURL(link.href);
  }
});
$('show').addEventListener('click', () => {
  $('preview').hidden = !$('preview').hidden;
  $('preview').textContent = latest?.config ?? '';
  $('show').textContent = $('preview').hidden ? 'Show configuration' : 'Hide configuration';
});
$('regenerate').addEventListener('click', () => $('generate').click());
