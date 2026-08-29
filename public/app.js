const $ = (id) => document.getElementById(id);
let latest = null;
const setStatus = (text) => {
  $('status').textContent = text;
};
const loadNodes = async () => {
  try {
    const response = await fetch('/api/warp?metadata=1');
    const data = await response.json();
    for (const node of data.registry?.nodes ?? []) {
      const option = document.createElement('option');
      option.value = node.code;
      option.textContent = `${node.name} (${node.count} endpoint${node.count === 1 ? '' : 'ов'})`;
      $('location').append(option);
    }
  } catch {
    setStatus('Не удалось загрузить список нод. Доступен режим Авто.');
  }
};
$('endpoint-mode').addEventListener('change', () => {
  const enabled = $('endpoint-mode').value === 'node';
  $('node-label').hidden = !enabled;
  $('location').hidden = !enabled;
});
$('theme').addEventListener('click', () => {
  document.documentElement.style.colorScheme =
    document.documentElement.style.colorScheme === 'light' ? 'dark' : 'light';
});
$('generate').addEventListener('click', async () => {
  $('generate').disabled = true;
  setStatus('Генерируется защищённая конфигурация...');
  try {
    const response = await fetch('/api/warp', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        endpointMode: $('endpoint-mode').value,
        nodeCountry: $('location').value,
        protocol: $('protocol').value,
        dnsPreset: $('dns').value,
        includeIpv6: $('ipv6').checked,
      }),
    });
    const data = await response.json();
    if (!data.success) throw new Error();
    latest = data;
    const selection = data.selection;
    $('metadata').innerHTML =
      `<div><dt>Режим</dt><dd>${selection.mode === 'node' ? 'Нода Cloudflare' : 'Авто'}</dd></div><div><dt>Endpoint</dt><dd>${data.location.resolved}</dd></div><div><dt>Нода</dt><dd>${selection.nodeLocation ?? 'Автоматическая маршрутизация'}</dd></div><div><dt>SEEN AS</dt><dd>${selection.seenAs ?? 'Неизвестно'}</dd></div><div><dt>Проверено</dt><dd>${selection.verifiedAt ?? 'Cloudflare API'}</dd></div><div><dt>Доверие</dt><dd>${selection.confidence === 'best-effort' ? 'Best-effort' : 'Автоматически'}</dd></div>`;
    $('result').hidden = false;
    $('preview').hidden = true;
    setStatus('');
  } catch {
    setStatus('Не удалось создать конфигурацию. Попробуйте ещё раз.');
  } finally {
    $('generate').disabled = false;
  }
});
$('copy').addEventListener('click', async () => {
  if (latest) {
    await navigator.clipboard.writeText(latest.config);
    $('copy').textContent = 'Скопировано';
    setTimeout(() => ($('copy').textContent = 'Копировать'), 1600);
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
  $('show').textContent = $('preview').hidden ? 'Показать конфигурацию' : 'Скрыть конфигурацию';
});
$('regenerate').addEventListener('click', () => $('generate').click());
loadNodes();
