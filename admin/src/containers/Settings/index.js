/*
 *
 * Settings
 *
 */

import React, { memo } from 'react';
// import PropTypes from 'prop-types';
import pluginId from '../../pluginId';

const Settings = () => {
  return (
    <div>
      <h1>{pluginId}&apos;s Settings</h1>
      <p>Happy coding</p>
    </div>
  );
};

export default memo(Settings);
