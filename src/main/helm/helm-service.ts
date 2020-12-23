import semver from "semver";
import { Cluster } from "../cluster";
import logger from "../logger";
import { HelmRepoManager } from "./helm-repo-manager";
import { HelmChartManager } from "./helm-chart-manager";
import { HelmChartList, RepoHelmChartList } from "../../renderer/api/endpoints/helm-charts.api";
import { deleteRelease, getHistory, getRelease, getValues, installChart, listReleases, rollback, upgradeRelease } from "./helm-release-manager";

class HelmService {
  public async installChart(cluster: Cluster, data: { chart: string; values: {}; name: string; namespace: string; version: string }) {
    return installChart(data.chart, data.values, data.name, data.namespace, data.version, cluster.getProxyKubeconfigPath());
  }

  public async listCharts() {
    const charts: HelmChartList = {};

    await HelmRepoManager.getInstance().init();
    const repositories = await HelmRepoManager.getInstance().repositories();

    for (const repo of repositories) {
      charts[repo.name] = {};
      const manager = new HelmChartManager(repo);
      const sortedCharts = this.sortChartsByVersion(await manager.charts());
      const enabledCharts = this.excludeDeprecatedChartGroups(sortedCharts);

      charts[repo.name] = enabledCharts;
    }

    return charts;
  }

  public async getChart(repoName: string, chartName: string, version = "") {
    const result = {
      readme: "",
      versions: {}
    };
    const repo = await HelmRepoManager.getInstance().repository(repoName);
    const chartManager = new HelmChartManager(repo);
    const chart = await chartManager.chart(chartName);

    result.readme = await chartManager.getReadme(chartName, version);
    result.versions = chart;

    return result;
  }

  public async getChartValues(repoName: string, chartName: string, version = "") {
    const repo = await HelmRepoManager.getInstance().repository(repoName);
    const chartManager = new HelmChartManager(repo);

    return chartManager.getValues(chartName, version);
  }

  public async listReleases(cluster: Cluster, namespace: string = null) {
    await HelmRepoManager.getInstance().init();

    return listReleases(cluster.getProxyKubeconfigPath(), namespace);
  }

  public async getRelease(cluster: Cluster, releaseName: string, namespace: string) {
    logger.debug("Fetch release");

    return getRelease(releaseName, namespace, cluster);
  }

  public async getReleaseValues(cluster: Cluster, releaseName: string, namespace: string) {
    logger.debug("Fetch release values");

    return getValues(releaseName, namespace, cluster.getProxyKubeconfigPath());
  }

  public async getReleaseHistory(cluster: Cluster, releaseName: string, namespace: string) {
    logger.debug("Fetch release history");

    return getHistory(releaseName, namespace, cluster.getProxyKubeconfigPath());
  }

  public async deleteRelease(cluster: Cluster, releaseName: string, namespace: string) {
    logger.debug("Delete release");

    return deleteRelease(releaseName, namespace, cluster.getProxyKubeconfigPath());
  }

  public async updateRelease(cluster: Cluster, releaseName: string, namespace: string, data: { chart: string; values: {}; version: string }) {
    logger.debug("Upgrade release");

    return upgradeRelease(releaseName, data.chart, data.values, namespace, data.version, cluster);
  }

  public async rollback(cluster: Cluster, releaseName: string, namespace: string, revision: number) {
    logger.debug("Rollback release");
    const output = rollback(releaseName, namespace, revision, cluster.getProxyKubeconfigPath());

    return { message: output };
  }

  private excludeDeprecatedChartGroups(chartGroups: RepoHelmChartList) {
    const groups = new Map(Object.entries(chartGroups));

    for (const [chartName, charts] of groups) {
      if (charts[0].deprecated) {
        groups.delete(chartName);
      }
    }

    return Object.fromEntries(groups);
  }

  private sortChartsByVersion(chartGroups: RepoHelmChartList) {
    for (const key in chartGroups) {
      chartGroups[key] = chartGroups[key].sort((first, second) => {
        const firstVersion = semver.coerce(first.version || 0);
        const secondVersion = semver.coerce(second.version || 0);

        return semver.compare(secondVersion, firstVersion);
      });
    }

    return chartGroups;
  }
}

export const helmService = new HelmService();
