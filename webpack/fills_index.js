import React from 'react';
import { addGlobalFill } from 'foremanReact/components/common/Fill/GlobalFill';
import { registerReducer } from 'foremanReact/common/MountingService';

import SystemStatuses from './components/extensions/about';
import extendReducer from './components/extensions/reducers';
import { Launcher } from "./components/extensions/launcher";

registerReducer('katelloExtends', extendReducer);

addGlobalFill('aboutFooterSlot', '[katello]AboutSystemStatuses', <SystemStatuses key="katello-system-statuses" />, 100);
addGlobalFill('layoutTop', '[katello]Launcher', <Launcher key="katello-launcher" />, 100);
