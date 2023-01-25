/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import userStoreInjectable from "../../common/user-store/user-store.injectable";
import React from "react";
import navigateToKubernetesPreferencesInjectable from "../../features/preferences/common/navigate-to-kubernetes-preferences.injectable";
import { runInAction } from "mobx";
import showSuccessNotificationInjectable from "../components/notifications/show-success-notification.injectable";

const addSyncEntriesInjectable = getInjectable({
  id: "add-sync-entries",

  instantiate: (di) => {
    const userStore = di.inject(userStoreInjectable);
    const navigateToKubernetesPreferences = di.inject(navigateToKubernetesPreferencesInjectable);
    const showSuccessNotification = di.inject(showSuccessNotificationInjectable);

    return async (paths: string[]) => {
      runInAction(() => {
        for (const path of paths) {
          userStore.syncKubeconfigEntries.set(path, {});
        }
      });

      showSuccessNotification((
        <div>
          <p>Selected items has been added to Kubeconfig Sync.</p>
          <br/>
          <p>
            {"Check the "}
            <a style={{ textDecoration: "underline" }} onClick={navigateToKubernetesPreferences}>Preferences</a>
            {" to see full list."}
          </p>
        </div>
      ));
    };
  },
});

export default addSyncEntriesInjectable;
