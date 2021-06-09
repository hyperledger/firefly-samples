// Copyright © 2021 Kaleido, Inc.
//
// SPDX-License-Identifier: Apache-2.0
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@material-ui/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FireFly,
  FireFlyData,
  FireFlyMessage,
  FireFlyMessageEvent,
} from './firefly';
import ReconnectingWebsocket from 'reconnecting-websocket';
import dayjs from 'dayjs';

const MEMBERS = ['http://localhost:5000', 'http://localhost:5001'];
const MAX_MESSAGES = 25;
const DATE_FORMAT = 'MM/DD/YYYY h:mm:ss A';

interface MessageRow {
  message: FireFlyMessage;
  data: FireFlyData[];
}

function App(): JSX.Element {
  const classes = useStyles();
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [messageText, setMessageText] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<number>(0);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const firefly = useRef<FireFly | null>(null);
  const ws = useRef<ReconnectingWebsocket | null>(null);

  const load = useCallback(async () => {
    const host = MEMBERS[selectedMember];
    console.log(`Loading data from ${host}`);

    firefly.current = new FireFly(host);
    const messages = await firefly.current.getMessages(MAX_MESSAGES);
    const rows: MessageRow[] = [];
    for (const message of messages) {
      rows.push({
        message,
        data: await firefly.current.retrieveData(message.data),
      });
    }
    setMessages(rows);

    const wsHost = MEMBERS[selectedMember].replace('http', 'ws');
    if (ws.current !== null) {
      ws.current.close();
    }
    ws.current = new ReconnectingWebsocket(
      `${wsHost}/ws?namespace=default&ephemeral&autoack`
    );
    ws.current.onopen = () => {
      console.log('Websocket connected');
    };
    ws.current.onmessage = (message) => {
      const data: FireFlyMessageEvent = JSON.parse(message.data);
      if (data.type === 'message_confirmed') {
        load();
      }
    };
    ws.current.onerror = (err) => {
      console.error(err);
    };
  }, [selectedMember]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs />
        <Grid item xs={10} md={8} xl={4}>
          <Paper
            className={classes.paper}
            component="form"
            onSubmit={(event) => {
              event.preventDefault();
              if (messageText === '') {
                return;
              }
              firefly.current?.sendBroadcast([
                {
                  value: messageText,
                },
              ]);
              setShowConfirmation(true);
              setMessageText('');
            }}
          >
            <h1>Send Message</h1>

            <FormControlLabel
              control={
                <Switch
                  checked={true}
                  color="primary"
                  onClick={() =>
                    alert('Private send is not yet supported in this sample.')
                  }
                />
              }
              label="Broadcast to all recipients"
              className={classes.formControl}
            />

            <FormControl className={classes.formControl} fullWidth={true}>
              <TextField
                label="Message"
                variant="outlined"
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
              />
            </FormControl>

            <FormControl className={classes.formControlRight}>
              <Button variant="contained" color="primary" type="submit">
                Submit
              </Button>
            </FormControl>

            <div className={classes.clearFix} />
          </Paper>

          <br />

          <Paper className={classes.paper}>
            <h1>Last {MAX_MESSAGES} Messages Received</h1>

            <MessageList messages={messages} />
          </Paper>
        </Grid>
        <Grid item xs={1} md={2} xl={4}>
          <FormControl style={{ float: 'right' }}>
            <Select
              value={selectedMember}
              onChange={(event) => {
                console.log(`Set selected member ${event.target.value}`);
                setSelectedMember(event.target.value as number);
              }}
            >
              {MEMBERS.map((m, i) => (
                <MenuItem key={m} value={i}>
                  {m}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={showConfirmation}
        autoHideDuration={3000}
        message="Message sent"
        onClose={() => setShowConfirmation(false)}
      />
    </div>
  );
}

interface MessageListOptions {
  messages: MessageRow[];
}

function MessageList(options: MessageListOptions) {
  const { messages } = options;

  const rows = [];
  for (const message of messages) {
    const date = dayjs(message.message.header.created);
    rows.push(
      <TableRow key={message.message.header.id}>
        <TableCell>{date.format(DATE_FORMAT)}</TableCell>
        <TableCell>
          {message.message.local ? 'self' : message.message.header.author}
        </TableCell>
        <TableCell>{message.data.map((d) => d?.value).join(', ')}</TableCell>
      </TableRow>
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Time</TableCell>
          <TableCell>From</TableCell>
          <TableCell>Data</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>{rows}</TableBody>
    </Table>
  );
}

const useStyles = makeStyles((theme) => ({
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
