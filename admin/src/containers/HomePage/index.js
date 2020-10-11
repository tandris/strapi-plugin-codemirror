/*
 *
 * HomePage
 *
 */

import React, { memo } from 'react';
// import PropTypes from 'prop-types';
import pluginId from '../../pluginId';
import CodeMirror from '../../components/CodeMirror';

const HomePage = () => {
  return (
    <div>
      <CodeMirror  onChange={()=>{}} name = "playground"/>
    </div>
  );
};

export default memo(HomePage);
