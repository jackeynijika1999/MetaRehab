import { ChangeDetectionStrategy, Component, ViewContainerRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CTMViewer } from '../ctm-viewer';
//源代码
import { getCTMViewerConfigs, getModelViewerConfigs,getShopItemlViewerConfigs,getMuseumItemViewerConfigs } from '../configs';
import { PluginModelViewer } from '../ctm-viewer/plugins/model-viewer/plugin-model-viewer';
import { PluginShopItemViewer} from '../ctm-viewer/plugins/shopitem-viewer/plugin-shopitem-viewer';
//新增深圳博物馆
import { PluginMuseumItemViewer} from '../ctm-viewer/plugins/museum-item-viewer/plugin-museumItem-viewer';
import { getQueryParameter } from '../utils/url';
import { PluginAgent } from '../ctm-viewer/plugins/agent/plugin-agent';
import { PluginNPC } from '../ctm-viewer/plugins/npc/plugin-npc';

// const DefaultSceneName = 'clearwater-store';
// const DefaultSceneName = 'tang-pottery-two-people-240125';
// 新增深圳博物馆
// const DefaultSceneName = 'shenzhen-museum-240625'
const DefaultSceneName = 'polyu-st011'
import {AppModule} from './app.module';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private viewer: CTMViewer | undefined;

  constructor(private vcr: ViewContainerRef) {}

  ngOnInit() {
    // polyu-clock-tower-240123
    // tang-pottery-two-people-240125
    // clearwater-store
    const sceneName = getQueryParameter('sceneName') || DefaultSceneName;
    getCTMViewerConfigs(sceneName).then(config => {
      if (!config) {
        alert('资源不存在');
        return;
      }

      this.viewer = new CTMViewer('ctm-viewer', config);
      getModelViewerConfigs(sceneName).then(config => {
        this.viewer!.addPlugins(new PluginModelViewer(this.viewer!, config));
      });
      getShopItemlViewerConfigs(sceneName).then(config => {
        this.viewer!.addPlugins(new PluginShopItemViewer(this.viewer!, config, this.vcr));
      });
      getMuseumItemViewerConfigs(sceneName).then(config => {
        this.viewer!.addPlugins(new PluginMuseumItemViewer(this.viewer!, config, this.vcr));
      });
      if (config.agent) {
        this.viewer!.addPlugins(new PluginAgent(this.viewer!, config.agent));
      }
      if (config.npc?.length) {
        this.viewer!.addPlugins(new PluginNPC(this.viewer!, config.npc));
      }
    });
  }

  ngOnDestroy() {
    this.viewer?.dispose();
    this.viewer = undefined;
  }
}
