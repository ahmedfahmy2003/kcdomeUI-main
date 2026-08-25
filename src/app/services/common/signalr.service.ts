import { inject, Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { AppService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  private hub!: signalR.HubConnection;
  private app = inject(AppService);

  startConnection(url: string, token: string) {
    if (this.hub && (this.hub.state === signalR.HubConnectionState.Connected || this.hub.state === signalR.HubConnectionState.Connecting)) {
      return;
    }
    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(this.app.signalrurl + url, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    return this.hub.start()
      .catch(err => console.error('Error while starting SignalR connection: ', err));
  }

  on(eventName: string, callback: (...args: any[]) => void) {
    this.hub.on(eventName, callback);
  }

  send(eventName: string, data: any) {
    return this.hub.invoke(eventName, data);
  }
}
