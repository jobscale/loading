import loadingImage from './loading-image.js';

const app = {
  loadingImage,

  async loading(pending, options = {}) {
    const {
      milliseconds = 500,
      zIndex = '101',
      backgroundSize = '25% auto',
      backgroundColor = 'rgba(0, 0, 0, 0.7)',
    } = options;
    if (app.loadingEl) {
      const settled = await Promise.allSettled(
        Array.isArray(pending) ? pending : [pending],
      );
      return Array.isArray(pending) ? settled : settled[0];
    }
    app.loadingEl = document.createElement('div');
    Object.assign(app.loadingEl, {
      role: 'status', ariaLive: 'polite', ariaBusy: 'true',
    });
    Object.assign(app.loadingEl.style, {
      cursor: 'wait',
      position: 'fixed',
      inset: '0',
      zIndex,
      backgroundColor,
      backgroundImage: `url(${app.loadingImage})`,
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize,
    });
    document.activeElement?.blur();
    document.documentElement.inert = true;
    document.body.append(app.loadingEl);
    const settled = await Promise.allSettled([
      ...Array.isArray(pending) ? pending : [pending],
      new Promise(resolve => { setTimeout(resolve, milliseconds); }),
    ]);
    app.loadingEl.remove();
    delete app.loadingEl;
    document.documentElement.inert = false;
    return Array.isArray(pending) ? settled.slice(0, -1) : settled[0];
  },
};

export const { loading } = app;
export { loadingImage };
export default new Proxy(app, {
  set(target, prop, value) {
    if (prop === 'loadingImage' && !value?.startsWith('data:image')) {
      throw new Error('Cannot modify loadingImage');
    }
    target[prop] = value;
    return true;
  },
});
