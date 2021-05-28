import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  TextField,
} from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { useState } from 'react';
import './App.css';

function App() {
  const classes = useStyles();
  const [recipient, setRecipient] = useState('');
  const [files, setFiles] = useState([]);

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs />
        <Grid item xs={12} md={8} xl={4}>
          <Paper className={classes.paper}>
            <h1>Send Data</h1>
            <FormControl variant="outlined" className={classes.formControl} fullWidth={true}>
              <InputLabel id="recipient-label">Recipient</InputLabel>
              <Select
                labelId="recipient-label"
                value={recipient}
                onChange={event => setRecipient(event.target.value)}
                label="Recipient"
              >
                <MenuItem value="">&nbsp;</MenuItem>
                <MenuItem value={1}>Recipient 1</MenuItem>
                <MenuItem value={2}>Recipient 2</MenuItem>
              </Select>
            </FormControl>
            <FormControl className={classes.formControl} fullWidth={true}>
              <TextField label="Public Description" variant="outlined" />
            </FormControl>
            <FormControl className={classes.formControl}>
              <input
                accept="*/*"
                id="upload-file"
                multiple
                hidden
                type="file"
                onChange={event => setFiles(event.target.files)}
              />
              <label htmlFor="upload-file">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                >
                  Select Private Files
                </Button>
              </label>
              {files && <SelectedFiles files={files} />}
            </FormControl>
            <br />
            <FormControl className={classes.formControlRight}>
              <Button
                variant="contained"
                color="primary"
              >
                Submit
              </Button>
            </FormControl>
            <div className={classes.clearFix} />
          </Paper>
        </Grid>
        <Grid item xs />
      </Grid>
    </div>
  );
}

function SelectedFiles({ files }) {
  const elements = [];
  for (let i=0; i<files.length; i++) {
    const filename = files.item(i).name;
    elements.push(
      <li key={filename}>{filename}</li>
    )
  }
  return <ul>{elements}</ul>;
}

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(2),
  },
  formControl: {
    marginTop: theme.spacing(2),
  },
  formControlRight: {
    marginTop: theme.spacing(2),
    float: 'right',
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  upload: {
    display: 'none',
  },
  clearFix: {
    clear: 'both',
  },
}));

export default App;
