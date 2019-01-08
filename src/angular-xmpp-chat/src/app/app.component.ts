import { Component, OnInit } from '@angular/core';

import { client, xml } from '@xmpp/client';
import { User, SendMessageEvent, Message } from '@progress/kendo-angular-conversational-ui';
import { Observable, merge, from, ReplaySubject, Subject } from 'rxjs';
import { scan } from 'rxjs/operators';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'angular-xmpp-chat';
  public feed: Observable<Message[]>;

  output = new Subject<Message>();
  input = new Subject<Message>();


  public readonly user: User = {
    id: 1
  };

  public readonly bot: User = {
    id: 0
  };

  parser = new DOMParser();

  client;

  ngOnInit() {
    this.client = client({
      service: 'ws://localhost:5280/ws',
      domain: 'localhost',
      resource: 'example',
      username: 'hoge',
      password: 'hoge',
    });
    window['xmpp'] = this.client;
    window['xml'] = xml;
    this.client.on('error', err => {
      console.error('❌', err.toString());
    });

    this.client.on('offline', () => {
      console.log('⏹', 'offline');
    });

    // this.client.on('stanza', async stanza => {
    //   if (stanza.is('message')) {
    //     await this.client.send(xml('presence', { type: 'unavailable' }));
    //     // await this.client.stop();
    //   }
    // });

    this.client.on('online', async address => {
      console.log('▶', 'online as', address.toString());

      // Makes itself available
      await this.client.send(xml('presence'));

    });

    // Debug
    this.client.on('status', status => {
      console.log('🛈', 'status', status);
    });

    this.client.on('input', input => {
      const doc = this.parser.parseFromString(input, 'application/xml');
      const messageBody = doc.querySelector('message body');
      console.log('⮊input', input);
      if (messageBody !== null) {
        const message: Message = {
          author: this.bot,
          timestamp: new Date(),
          text: doc.querySelector('message body').innerHTML,
        };
        this.input.next(message);
      }
      // doc.querySelector('message body').innerHTML;
    });
    this.client.on('output', output => {
      const doc = this.parser.parseFromString(output, 'application/xml');
      console.log('⮊output', output);
      const body = doc.querySelector('body');
      if (body !== null) {
        const message: Message = {
          author: this.user,
          timestamp: new Date(),
          text: body.innerHTML,
        };
        this.input.next(message);
      }
    });

    this.client.start().catch(console.error);

    // Merge local and remote messages into a single stream
    this.feed = merge(
      this.output,
      this.input,
    ).pipe(
      // ... and emit an array of all messages
      scan<Message, Message[]>((acc, v): Message[] => {
        return [...acc, v];
      }, [])
    );
  }


  public async sendMessage(e: SendMessageEvent) {
    // Sends a chat message to itself
    const message = xml(
      'message',
      { type: 'chat', to: 'fuga@localhost' },
      xml('body', {}, e.message.text )
    );
    // this.output.next({
    //   author: this.user,
    //   timestamp: new Date(),
    //   text: e.message.text,
    // });

    await this.client.send(message);
    // this.local.next(e.message);

    // this.local.next({
    //   author: this.bot,
    //   typing: true
    // });

    // this.svc.submit(e.message.text);
  }
}
