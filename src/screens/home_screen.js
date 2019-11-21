import React from 'react';
import { Link } from 'react-router-dom';
import { Paper, Typography, Button } from '@material-ui/core';
import { useStyles } from '../utils/styles';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';

function HomeScreen() {
  const classes = useStyles();

  return <Paper className={classes.root}>
    <Typography className={classes.title} variant="h5" component="h3">
      Qantas tech test
  </Typography>
    <List component="nav" aria-label="airports">
    </List>
    <Divider />
    <div className={classes.body} >
      Investigated 3 caching methods.
      <div>
        <Link to="/nocache" >nocache</Link>. presumes browser caching will do something intelligent.
      </div>
      <div>
        <Link to="/promise" >promise array</Link>. keep an array of promises to prevent refetching.
      </div>
      <div>
        <Link to="/arraybuffer" >byte cache</Link>. keep a arraybuffer and fill with bytes as needed. only fetch the range we need.
      </div>
    </div>
  </Paper>
}

export default HomeScreen

