import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap, BehaviorSubject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root',
})
export class Cripto {
  private coin$ = new BehaviorSubject<string>('xrpusdt');
  private socket$: Observable<any>;

  constructor(private http: HttpClient) {
    // Cria um novo socket sempre que a moeda muda
    this.socket$ = this.coin$.pipe(
      switchMap((coin) =>
        webSocket(`wss://fstream.binance.com/ws/${coin}@markPrice`)
      )
    );
  }

  getSymbols() {
    return this.http.get<any>('https://fapi.binance.com/fapi/v1/exchangeInfo');
  }

  setCoin(coin: string) {
    this.coin$.next(coin);
  }

  getSocket(coin: string): Observable<any> {
    return webSocket(`wss://fstream.binance.com/ws/${coin}@markPrice`);
  }
}
