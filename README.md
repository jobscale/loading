# @jobscale/loading

A browser loading overlay module.

Calling `loading(pending, options)` appends a full-screen translucent overlay
with an animated SVG spinner in the center to `document.body`.
It waits for the given value (`pending`) — either a single `Promise` or an
array of `Promise`s — to settle, guarantees a minimum display duration
(`options.milliseconds`, default `500ms`), then removes the overlay
automatically. Internally it uses `Promise.allSettled`, so a rejected
`pending` does not throw; the returned value is a `PromiseSettledResult`
(or an array of them when `pending` is an array).

## Features

- No dependencies (pure ESM)
- Inline SVG bundled as a data URL — no network request required
- Prevents duplicate overlays (subsequent calls while visible are ignored)
- Covers the full viewport (`position: fixed` / `z-index: 101`)

## Installation

Via CDN (when loading as `type="module"`):

```html
<script type="module">
  import { loading } from 'https://esm.sh/@jobscale/loading';

  await loading(fetch('/api/data'));
</script>
```

From a classic `<script>` (no `type="module"`), use dynamic `import()`.
Top-level `await` is not available in classic scripts, so wrap the call in
an `async` function or IIFE:

```html
<script>
  (async () => {
    const { loading } = await import('https://esm.sh/@jobscale/loading');
    await loading(fetch('/api/data'));
  })();
</script>
```

You can also cache the module promise and reuse it across handlers:

```html
<script>
  const loadingModule = import('https://esm.sh/@jobscale/loading');

  document.getElementById('btn').addEventListener('click', async () => {
    const { loading } = await loadingModule;
    await loading(fetch('/api/data'));
  });
</script>
```

Via npm:

```sh
npm install @jobscale/loading
```

```js
import { loading } from '@jobscale/loading';
```

## Usage

Pass a `Promise` and the overlay will be displayed until it settles.
`loading()` returns a `PromiseSettledResult`, so both success and failure
can be handled without a `try` / `catch`.

```js
import { loading } from 'https://esm.sh/@jobscale/loading';

async function fetchData() {
  const result = await loading(fetch('/api/data'));
  if (result.status === 'fulfilled') {
    const data = await result.value.json();
    console.log(data);
  } else {
    console.error(result.reason);
  }
}
```

You can also pass an array of `Promise`s. The overlay stays visible until all
of them settle, and an array of `PromiseSettledResult`s is returned in the
same order.

```js
const [dataRes, configRes, userRes] = await loading([
  fetch('/api/data'),
  fetch('/api/config'),
  fetch('/api/user'),
]);
if (dataRes.status === 'fulfilled') {
  const data = await dataRes.value.json();
}
```

Pass an options object as the second argument to customize the minimum
display time or the appearance.

```js
// Keep the overlay visible for at least 1200ms
const res = await loading(fetch('/api/data'), { milliseconds: 1200 });

// Disable the minimum display time (close as soon as `pending` resolves)
const res2 = await loading(fetch('/api/data'), { milliseconds: 0 });

// Adjust stacking order and spinner size
const res3 = await loading(fetch('/api/data'), {
  zIndex: '9999',
  backgroundSize: '15% auto',
  backgroundColor: 'rgba(22, 22, 33, 0.7)',
});
```

## API

### `loading<T>(pending: Promise<T> | Promise<unknown>[], options?: LoadingOptions): Promise<PromiseSettledResult<T> | PromiseSettledResult<unknown>[] | typeof pending>`

- `pending` — a `Promise` to wait for, or an array of `Promise`s.
- `options` — optional object to customize the overlay.
- Returns — a `PromiseSettledResult` (`{ status: 'fulfilled', value }` or
  `{ status: 'rejected', reason }`), delivered after the overlay is removed.
  When `pending` is an array, an array of `PromiseSettledResult`s is
  returned in the same order.
- The overlay stays visible for whichever is longer: the settling of every
  `pending` promise or `options.milliseconds`.
- Rejections in `pending` do not propagate — they surface as
  `{ status: 'rejected', reason }` entries.
- If an overlay is already visible, the call is a no-op and simply returns
  the given `pending` value as-is.

#### `LoadingOptions`

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `milliseconds` | `number` | `500` | Minimum display time in milliseconds. |
| `zIndex` | `string` | `'101'` | `z-index` of the overlay element. |
| `backgroundSize` | `string` | `'25% auto'` | `background-size` of the spinner image. |
| `backgroundColor` | `string` | `'rgba(0, 0, 0, 0.7)'` | `background-color` of the overlay. |

### `loadingImage`

The data URL string of the SVG spinner used internally. Import it if you want
to reuse the spinner image in your own elements.

```js
import { loadingImage } from 'https://esm.sh/@jobscale/loading';

const el = document.createElement('img');
el.src = loadingImage;
```

### Default export

An object containing `loading` and `loadingImage`.

```js
import app from 'https://esm.sh/@jobscale/loading';

await app.loading(pending);
```

## License

MIT
