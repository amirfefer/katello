
import React from 'react';
import StatefulApplicationLauncherWrapper from 'patternfly-react/dist/js/components/ApplicationLauncher/Wrappers/StatefulApplicationLauncherWrapper';

const handleClick = () => alert('clicked!');

const Apps = [
  {
    title: 'Content Hosts',
    icon: 'server',
    onClick: (e) => {
      handleClick(e);
    },
  },
  {
    title: 'Repos',
    icon: 'repository',
    tooltip: 'Tooltip!',
    onClick: (e) => {
      handleClick(e);
    },
  },
  {
    title: 'Subscriptions',
    icon: 'save',
    tooltip: 'Tooltip!',
    onClick: (e) => {
      handleClick(e);
    },
  },
  {
    title: 'Content Views',
    icon: 'virtual-machine',
    tooltip: 'Tooltip!',
    onClick: (e) => {
      handleClick(e);
    },
  },
];

export const Launcher = props =>
  (
    <ul className="nav navbar-nav navbar-right navbar-iconic">
      <StatefulApplicationLauncherWrapper
        apps={Apps}
        noIcons={false}
        grid={true}
        tooltipPlacement="left"
      />
    </ul>
  );
