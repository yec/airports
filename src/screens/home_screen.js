import React from 'react';

import { Link } from 'react-router-dom';

function HomeScreen () {

  return <div>
    investigated 3 caching methods.

    <br/>
    <Link to="/nocache" >nocache</Link>. presumes browser caching will do something intelligent.
    <br/>
    <Link to="/promise" >promise array</Link>. keep an array of promises so refetching will not occur
    <br/>
    <Link to="/arraybuffer" >byte cache</Link>. keep a arraybuffer and fill with bytes as needed. only fetch the range we need
  </div>

}

export default HomeScreen
