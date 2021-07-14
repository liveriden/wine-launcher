import AppFolders from "../app-folders";
import FileSystem from "../file-system";
import Network    from "../network";
import Utils      from "../utils";

export default class WineScLug {
  /**
   * @type {string}
   */
  url = 'https://api.github.com/repos/gort818/wine-sc-lug/releases';

  data = null;

  /**
   * @type {AppFolders}
   */
  appFolders = null;

  /**
   * @type {FileSystem}
   */
  fs = null;

  /**
   * @type {Network}
   */
  network = null;

  /**
   * @param {AppFolders} appFolders
   * @param {FileSystem} fs
   * @param {Network} network
   */
  constructor(appFolders, fs, network) {
    this.appFolders = appFolders;
    this.fs         = fs;
    this.network    = network;
  }

  /**
   * @return {{name: string, type: string, nested: (function(): Promise)}}
   */
  getElement() {
    return {
      name:   'Wine builds for Star Citizen: gort818',
      type:   'dir',
      nested: () => this.getList(),
    };
  }

  /**
   * @return {Promise}
   */
  getList() {
    let promise = Promise.resolve();

    if (null === this.data) {
      promise = this.network.getJSON(this.url).then((data) => {
        this.data = data.map((item) => ({
          name:     item.name || item.tag_name,
          type:     'file',
          download: () => {
            let asset = Utils.findAssetArchive(item.assets);
            let url   = asset.browser_download_url;
            return this.download(url);
          },
        }));
      });
    }

    return promise.then(() => this.data);
  }

  /**
   * @param {string} url
   * @return Promise<string>
   */
  download(url) {
    let cacheDir = this.appFolders.getCacheDir();
    let filename = this.fs.basename(url);

    return this.network.download(url, `${cacheDir}/${filename}`).then(() => filename);
  }
}