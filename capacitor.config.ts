import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'fr.atop.menage',
  appName: 'menage',
  webDir: 'dist/menage/browser',
  server: {
    url: 'https://digital.atop-group.fr',
    cleartext: false
  }
};

export default config;
