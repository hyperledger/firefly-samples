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
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Checkbox,
  FormLabel,
  FormGroup,
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
  FireFlyMemberInput,
  FireFlyMessage,
  FireFlyMessageEvent,
  FireFlyOrganization,
} from './firefly';
import ReconnectingWebsocket from 'reconnecting-websocket';
import dayjs from 'dayjs';

const MEMBERS = [
  'http://localhost:5000',
  'http://localhost:5001',
  'http://localhost:5002',
];
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
  const firefly = useRef<FireFly | null>(null);
  const ws = useRef<ReconnectingWebsocket | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [orgs, setOrgs] = useState<FireFlyOrganization[]>([]);
  const [pickedOrgs, setPickedOrgs] = useState<{ [oName: string]: boolean }>(
    {}
  );
  const [selfOrg, setSelfOrg] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');

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

    const orgs = await firefly.current.getOrgs();
    setOrgs(orgs);

    const status = await firefly.current.getStatus();
    setSelfOrg(status?.org?.name || '');

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

  const orgName = (message: MessageRow) => {
    const identity = message.message.header.author;
    const org = orgs?.find((o) => o.identity === identity);
    let name = org ? org.name : identity;
    if (message.message.local) {
      name = `${name} (self)`;
    }
    return name;
  };

  const MessageList = (options: MessageListOptions) => {
    const { messages } = options;
    const classes = useStyles();

    const rows = [];
    for (const message of messages) {
      const date = dayjs(message.message.header.created);
      rows.push(
        <TableRow key={message.message.header.id}>
          <TableCell>{date.format(DATE_FORMAT)}</TableCell>
          <TableCell>{orgName(message)}</TableCell>
          <TableCell className={classes.scrollRight}>
            <div>
              <pre>
                {message.data
                  .map((d) => JSON.stringify(d?.value || '', null, 2))
                  .join(', ')}
              </pre>
            </div>
          </TableCell>
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
  };

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={1} md={2} xl={3} />
        <Grid item xs={10} md={8} xl={6}>
          <Paper
            className={classes.paper}
            component="form"
            onSubmit={async (event) => {
              event.preventDefault();
              try {
                if (messageText === '') {
                  return;
                }
                if (isPrivate) {
                  const recipients: FireFlyMemberInput[] = [];
                  pickedOrgs[selfOrg] = true;
                  for (const oName in pickedOrgs) {
                    if (pickedOrgs[oName]) {
                      recipients.push({ identity: oName });
                    }
                  }
                  await firefly.current?.sendPrivate({
                    data: [
                      {
                        value: messageText,
                      },
                    ],
                    group: {
                      members: recipients,
                    },
                  });
                } else {
                  await firefly.current?.sendBroadcast([
                    {
                      value: messageText,
                    },
                  ]);
                }
                setConfirmationMessage('Message sent');
              } catch (err) {
                setConfirmationMessage(`Error: ${err}`);
              }
              setMessageText('');
            }}
          >
            <h1>Send Message</h1>

            <FormControlLabel
              control={
                <Switch
                  checked={!isPrivate}
                  color="primary"
                  onClick={() => setIsPrivate(!isPrivate)}
                />
              }
              label={
                isPrivate
                  ? 'Choose recipients'
                  : 'Broadcast to the whole network'
              }
              className={classes.formControl}
            />

            {isPrivate && (
              <Box>
                <FormControl
                  component="fieldset"
                  className={classes.formControl}
                >
                  <FormLabel component="legend">Pick recipients</FormLabel>
                  <FormGroup>
                    {orgs.map((o, i) => (
                      <FormControlLabel
                        key={o.name}
                        control={
                          <Checkbox
                            checked={!!pickedOrgs[o.name] || o.name === selfOrg}
                            disabled={o.name === selfOrg}
                            onChange={(e) => {
                              console.log(e.target);
                              setPickedOrgs({
                                ...pickedOrgs,
                                [e.target.value]: e.target.checked,
                              });
                            }}
                            name={o.name}
                            value={o.name}
                          />
                        }
                        label={
                          o.name === selfOrg
                            ? `${o.name}/${o.identity} (self)`
                            : `${o.name}/${o.identity}`
                        }
                      />
                    ))}
                  </FormGroup>
                </FormControl>
              </Box>
            )}

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
        <Grid item xs={1} md={2} xl={3}>
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
        <Grid item xs />
      </Grid>

      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={!!confirmationMessage}
        autoHideDuration={3000}
        message={confirmationMessage}
        onClose={() => setConfirmationMessage('')}
      />
    </div>
  );
}

interface MessageListOptions {
  messages: MessageRow[];
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
  scrollRight: {
    overflowX: 'scroll',
    [theme.breakpoints.up('xs')]: {
      maxWidth: 150,
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: 350,
    },
    [theme.breakpoints.up('xl')]: {
      maxWidth: 450,
    },
  },
}));

export default App;
