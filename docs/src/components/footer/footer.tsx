import { component$, Host, $, useScopedStyles$ } from '@builder.io/qwik';
import styles from './footer.css';

export const Footer = component$(
  () => {
    useScopedStyles$(styles);

    return $(() => (
      <Host class="pt-8 pb-12 px-2 flex justify-between text-sm">
        <div class="py-1">
          <span>Made with ♡ by the </span>
          <a href="https://www.builder.io/">Builder.io</a>
          <span> team</span>
        </div>
        <nav class="flex">
          <a class="px-3 py-1" href="https://github.com/BuilderIO/qwik" target="_blank">
            Github
          </a>
          <a class="px-3 py-1" href="https://discord.gg/Fd9Cwb3Z8D" target="_blank">
            Discord
          </a>
          <a class="px-3 py-1" href="https://twitter.com/QwikDev" target="_blank">
            @QwikDev
          </a>
        </nav>
      </Host>
    ));
  },
  { tagName: 'footer' }
);
