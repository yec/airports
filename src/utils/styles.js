import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  listItem: {
    height: listItemHeight,
  },
  title: {
    padding: 40,
  },
  body: {
    padding: 40,
  },
  root: {
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%',
    maxWidth: 560,
    backgroundColor: theme.palette.background.paper,
  },
  centered: {
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  centeredHide: {
    transition: 'opacity 0.2s',
    opacity: 0,
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
}));

const listItemHeight = 100;

export { useStyles };
