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

import axios, { AxiosInstance } from 'axios';

export interface FireFlyDataSend {
  value: string;
}

export interface FireFlyData extends FireFlyDataSend {
  id: string;
}

export interface FireFlyDataIdentifier {
  id: string;
  hash: string;
}

export interface FireFlyMessage {
  header: {
    id: string;
    author: string;
    type: string;
  };
  local: boolean;
  data: FireFlyDataIdentifier[];
}

export class FireFly {
  private rest: AxiosInstance;
  private ns = 'default';

  constructor(port: number) {
    this.rest = axios.create({ baseURL: `http://localhost:${port}/api/v1` });
  }

  async sendBroadcast(data: FireFlyDataSend[]): Promise<void> {
    await this.rest.post(`/namespaces/${this.ns}/broadcast/message`, { data });
  }

  async getMessages(): Promise<FireFlyMessage[]> {
    const response = await this.rest.get<FireFlyMessage[]>(
      `/namespaces/${this.ns}/messages`
    );
    return response.data;
  }

  retrieveData(data: FireFlyDataIdentifier[]): Promise<FireFlyData[]> {
    return Promise.all(
      data.map((d) =>
        this.rest
          .get<FireFlyData>(`/namespaces/${this.ns}/data/${d.id}`)
          .then((response) => response.data)
      )
    );
  }
}
